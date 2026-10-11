import { AppError } from "@cxsun/framework/errors";
import { FrappeConnectionRepository, requestFrappe } from "@cxsun/frappe-api";
import type { FrappeDatabase } from "@cxsun/frappe-api";
import type { Kysely } from "kysely";
import { getEcommerceDatabase } from "../../database/ecommerce-database.js";
import type {
  CatalogDataSourceControl,
  CatalogDataSourceConnectionResult,
  FrappeConnectionPayload,
  FrappeVerificationPayload
} from "./catalog-data-source.types.js";

export function createCatalogDataSourceControl(encryptionSecret: string): CatalogDataSourceControl {
  const repository = () =>
    new FrappeConnectionRepository(getEcommerceDatabase() as unknown as Kysely<FrappeDatabase>);

  async function hasConnectionTable() {
    const database = getEcommerceDatabase();
    const table = await database.introspection.getTables();
    return table.some(({ name }) => name === "frappe_connection_settings");
  }

  async function connection() {
    if (!(await hasConnectionTable())) return null;
    return repository().connection();
  }

  async function credentials(input?: FrappeVerificationPayload) {
    const saved = (await connection())
      ? await repository().credentials(encryptionSecret)
      : null;
    const url = input?.url ?? saved?.settings.baseUrl ?? "";
    const apiKey = input?.apiKey || saved?.settings.apiKey || "";
    const apiSecret = input?.apiSecret || saved?.settings.apiSecret || "";
    if (!url || !apiKey || !apiSecret) {
      throw AppError.conflict("Configure the tenant Frappe connection first.");
    }
    return { url, apiKey, apiSecret };
  }

  async function verify(input: FrappeVerificationPayload): Promise<CatalogDataSourceConnectionResult> {
    const start = Date.now();
    const candidate = await credentials(input);
    const response = await requestFrappe<{ message?: unknown }>(
      "/api/method/frappe.auth.get_logged_user",
      "GET",
      { baseUrl: candidate.url, apiKey: candidate.apiKey, apiSecret: candidate.apiSecret, enabled: true }
    );
    if (typeof response.message !== "string" || !response.message.trim()) {
      throw AppError.conflict("Frappe did not identify the connected user.");
    }
    const row = await connection();
    if (row?.base_url === candidate.url && !input.apiKey && !input.apiSecret) {
      await repository().recordVerification("verified");
    }
    return {
      connected: true,
      latencyMs: Date.now() - start,
      message: `Connected as ${response.message.trim()}.`,
      provider: "frappe",
      providerLabel: "Frappe"
    };
  }

  async function settings() {
    const row = await connection();
    return {
      appKeyConfigured: Boolean(row?.api_key_ciphertext),
      appSecretConfigured: Boolean(row?.api_secret_ciphertext),
      connectionName: row?.connection_name ?? "Frappe",
      frappeConfigured: Boolean(
        row?.enabled && row.api_key_ciphertext && row.api_secret_ciphertext &&
          row.verification_status === "verified"
      ),
      frappeEnabled: Boolean(row?.enabled),
      frappeUrl: row?.base_url ?? null,
      lastVerifiedAt: row?.last_verified_at
        ? new Date(row.last_verified_at).toISOString()
        : null,
      saveToEnvironment: false,
      verificationStatus: row?.verification_status === "verified"
        ? "live" as const
        : row?.verification_status === "failed"
          ? "offline" as const
          : "unverified" as const,
      verifiedUser: null
    };
  }

  return {
    credentials: () => credentials(),
    settings,
    verify,
    async save(input: FrappeConnectionPayload, actorEmail: string) {
      if (!(await hasConnectionTable())) {
        throw AppError.conflict("Enable the CRM and Frappe apps before saving a shared Frappe connection.");
      }
      await repository().saveConnection(
        {
          baseUrl: input.url,
          connectionName: input.connectionName,
          enabled: input.enabled,
          apiKey: input.apiKey ?? "",
          apiSecret: input.apiSecret ?? ""
        },
        encryptionSecret
      );
      void actorEmail;
      return settings();
    },
    async test(provider) {
      if (provider === "own") {
        return {
          connected: true,
          latencyMs: 0,
          message: "Local catalog is available.",
          provider,
          providerLabel: "Local"
        };
      }
      return verify({ url: (await settings()).frappeUrl ?? "" });
    }
  };
}
