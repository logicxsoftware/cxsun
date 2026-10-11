import type { Kysely } from "kysely";
import type { FrappeDatabase, FrappeSettings } from "./connection.types.js";
import { FrappeConnectionRepository } from "./connection.repository.js";

export class FrappeConnectionAccess {
  constructor(
    private readonly database: Kysely<FrappeDatabase>,
    private readonly encryptionSecret: string,
    private readonly defaults: FrappeSettings
  ) {}

  async state() {
    const tables = await this.database.introspection.getTables();
    if (!tables.some(({ name }) => name === "frappe_connection_settings"))
      return this.environmentState();
    const row = await new FrappeConnectionRepository(this.database).connection();
    if (!row) return this.environmentState();
    const configured = Boolean(row.base_url && row.api_key_ciphertext && row.api_secret_ciphertext);
    return {
      configured,
      enabled: Boolean(row.enabled),
      verified: row.verification_status === "verified",
      usable: configured && Boolean(row.enabled) && row.verification_status === "verified",
      baseUrl: row.base_url,
      verificationStatus: row.verification_status,
      source: "tenant" as const
    };
  }

  async credentials() {
    const state = await this.state();
    if (!state.usable) return null;
    if (state.source === "environment") return this.defaults;
    return (
      (await new FrappeConnectionRepository(this.database).credentials(this.encryptionSecret))
        ?.settings ?? null
    );
  }

  private environmentState() {
    const configured = Boolean(
      this.defaults.baseUrl && this.defaults.apiKey && this.defaults.apiSecret
    );
    return {
      configured,
      enabled: this.defaults.enabled,
      verified: false,
      usable: configured && this.defaults.enabled,
      baseUrl: this.defaults.baseUrl || null,
      verificationStatus: "unverified" as const,
      source: "environment" as const
    };
  }
}
