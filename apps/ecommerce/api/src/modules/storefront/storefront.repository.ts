import { createHash, randomBytes } from "node:crypto";
import { sql, type Kysely } from "kysely";
import { AppError } from "@cxsun/framework/errors";
import type {
  QuoteInput,
  QuoteItem,
  QuoteRecord,
  StorefrontConfig,
  StorefrontConfigInput,
  StorefrontDatabase,
  StorefrontReceipt
} from "./storefront.types.js";
export class StorefrontRepository {
  constructor(private readonly database: Kysely<StorefrontDatabase>) {}
  async config() {
    const row = (
      await sql<StorefrontConfig>`SELECT uuid, brand_name AS brandName, tagline, location, phone, email, logo_url AS logoUrl, industry_key AS industryKey, industry_name AS industryName, enabled FROM ecommerce_storefront_config WHERE config_key='default' AND status='active'`.execute(
        this.database
      )
    ).rows[0];
    if (!row) throw AppError.notFound("Storefront is not configured.");
    return { ...row, enabled: Boolean(row.enabled) };
  }
  private async audit(
    database: Kysely<StorefrontDatabase>,
    uuid: string,
    action: string,
    actor: string,
    summary: string
  ) {
    await sql`INSERT INTO ecommerce_storefront_activity (uuid, record_uuid, action, actor, summary) VALUES (${randomBytes(4).toString("hex")}, ${uuid}, ${action}, ${actor}, ${summary})`.execute(
      database
    );
  }
  async saveConfig(input: StorefrontConfigInput, actor: string) {
    const current = await this.config();
    await this.database.transaction().execute(async (transaction) => {
      await sql`UPDATE ecommerce_storefront_config SET brand_name=${input.brandName}, tagline=${input.tagline}, location=${input.location}, phone=${input.phone}, email=${input.email}, logo_url=${input.logoUrl}, industry_key=${input.industryKey}, industry_name=${input.industryName}, enabled=${input.enabled} WHERE uuid=${current.uuid}`.execute(
        transaction
      );
      await this.audit(
        transaction,
        current.uuid,
        "config_updated",
        actor,
        `Storefront ${input.enabled ? "enabled" : "disabled"}: ${input.brandName}`
      );
    });
    return this.config();
  }
  async createQuote(
    input: QuoteInput,
    items: QuoteItem[],
    clientKey: string
  ): Promise<StorefrontReceipt> {
    const fingerprint = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    return this.database.transaction().execute(async (transaction) => {
      const config = (
        await sql<{
          enabled: number;
          uuid: string;
        }>`SELECT uuid, enabled FROM ecommerce_storefront_config WHERE config_key='default' AND status='active' FOR UPDATE`.execute(
          transaction
        )
      ).rows[0];
      if (!config?.enabled) throw AppError.notFound("Storefront is not available.");
      const existing = (
        await sql<{
          uuid: string;
          hash: string;
        }>`SELECT uuid, request_hash AS hash FROM ecommerce_storefront_quotes WHERE request_key=${input.requestKey}`.execute(
          transaction
        )
      ).rows[0];
      if (existing) {
        if (existing.hash !== fingerprint)
          throw AppError.conflict("Request key was already used for a different request.");
        return { reference: existing.uuid, status: "received", itemCount: items.length };
      }
      const rate = (
        await sql<{
          count: number;
        }>`SELECT COUNT(*) AS count FROM ecommerce_storefront_quotes WHERE client_hash=${clientKey} AND created_at > CURRENT_TIMESTAMP - INTERVAL 15 MINUTE`.execute(
          transaction
        )
      ).rows[0];
      if (Number(rate?.count) >= 10)
        throw new AppError({
          code: "QUOTE_RATE_LIMITED",
          message: "Too many quote requests. Please try again later.",
          statusCode: 429
        });
      const uuid = randomBytes(4).toString("hex");
      await sql`INSERT INTO ecommerce_storefront_quotes (uuid, request_key, request_hash, client_hash, customer_name, email, phone, notes) VALUES (${uuid}, ${input.requestKey}, ${fingerprint}, ${clientKey}, ${input.name}, ${input.email}, ${input.phone}, ${input.notes})`.execute(
        transaction
      );
      for (const item of items)
        await sql`INSERT INTO ecommerce_storefront_quote_items (uuid, quote_uuid, catalog_uuid, vendor_uuid, title, quantity, quoted_price, currency) VALUES (${randomBytes(4).toString("hex")}, ${uuid}, ${item.catalogUuid}, ${item.vendorUuid}, ${item.title}, ${item.quantity}, ${item.price}, ${item.currency})`.execute(
          transaction
        );
      await this.audit(
        transaction,
        uuid,
        "quote_received",
        "public:storefront",
        `Quote received for ${items.length} catalog entries.`
      );
      return { reference: uuid, status: "received", itemCount: items.length };
    });
  }
  async quotes(): Promise<QuoteRecord[]> {
    const rows = (
      await sql<
        Omit<QuoteRecord, "items">
      >`SELECT uuid, customer_name AS name, email, phone, notes, status, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS createdAt FROM ecommerce_storefront_quotes ORDER BY id DESC LIMIT 500`.execute(
        this.database
      )
    ).rows;
    const items = (
      await sql<
        QuoteItem & { quoteUuid: string }
      >`SELECT item.quote_uuid AS quoteUuid, item.catalog_uuid AS catalogUuid, item.vendor_uuid AS vendorUuid, item.title, item.quantity, item.quoted_price AS price, item.currency FROM ecommerce_storefront_quote_items item INNER JOIN (SELECT uuid FROM ecommerce_storefront_quotes ORDER BY id DESC LIMIT 500) quote ON quote.uuid=item.quote_uuid ORDER BY item.id`.execute(
        this.database
      )
    ).rows;
    return rows.map((row) => ({
      ...row,
      items: items
        .filter((item) => item.quoteUuid === row.uuid)
        .map(({ quoteUuid: _quoteUuid, ...item }) => ({
          ...item,
          quantity: Number(item.quantity),
          price: item.price === null ? null : Number(item.price)
        }))
    }));
  }
  async updateQuote(uuid: string, status: QuoteRecord["status"], actor: string) {
    await this.database.transaction().execute(async (transaction) => {
      const row = (
        await sql`SELECT id FROM ecommerce_storefront_quotes WHERE uuid=${uuid} FOR UPDATE`.execute(
          transaction
        )
      ).rows[0];
      if (!row) throw AppError.notFound("Quote request was not found.");
      await sql`UPDATE ecommerce_storefront_quotes SET status=${status} WHERE uuid=${uuid}`.execute(
        transaction
      );
      await this.audit(transaction, uuid, "quote_updated", actor, `Quote marked ${status}.`);
    });
    return { uuid, status };
  }
}
