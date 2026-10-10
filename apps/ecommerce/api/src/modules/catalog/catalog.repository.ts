import { randomBytes } from "node:crypto";
import { sql, type Kysely } from "kysely";
import { AppError } from "@cxsun/framework/errors";
import type {
  CatalogActivity,
  CatalogDatabase,
  CatalogInput,
  CatalogRow
} from "./catalog.types.js";
const projection = sql`id, uuid, product_id AS productId, title, slug, description, sku, price, compare_at_price AS compareAtPrice,
  currency, image_url AS imageUrl, image_alt AS imageAlt, seo_title AS seoTitle, seo_description AS seoDescription,
  published, featured, status, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS createdAt,
  DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS updatedAt`;
function record(row: CatalogRow): CatalogRow {
  return {
    ...row,
    id: Number(row.id),
    productId: Number(row.productId),
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice === null ? null : Number(row.compareAtPrice),
    published: Boolean(row.published),
    featured: Boolean(row.featured)
  };
}
export class CatalogRepository {
  constructor(
    private readonly database: Kysely<CatalogDatabase>,
    private readonly actor: string
  ) {}
  async list() {
    return (
      await sql<CatalogRow>`SELECT ${projection} FROM ecommerce_catalog ORDER BY title, id`.execute(
        this.database
      )
    ).rows.map(record);
  }
  async find(uuid: string) {
    const row = (
      await sql<CatalogRow>`SELECT ${projection} FROM ecommerce_catalog WHERE uuid=${uuid}`.execute(
        this.database
      )
    ).rows[0];
    return row ? record(row) : null;
  }
  async activity(uuid: string) {
    return (
      await sql<CatalogActivity>`SELECT uuid, action, actor_email AS actorEmail, summary, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS createdAt FROM ecommerce_catalog_activity WHERE catalog_uuid=${uuid} ORDER BY id DESC`.execute(
        this.database
      )
    ).rows;
  }
  private async audit(
    database: Kysely<CatalogDatabase>,
    uuid: string,
    action: string,
    title: string
  ) {
    await sql`INSERT INTO ecommerce_catalog_activity (uuid, catalog_uuid, action, actor_email, summary) VALUES (${randomBytes(4).toString("hex")}, ${uuid}, ${action}, ${this.actor}, ${`${action}: ${title}`})`.execute(
      database
    );
  }
  async save(input: CatalogInput, uuid?: string) {
    const identity = uuid ?? randomBytes(4).toString("hex");
    try {
      await this.database.transaction().execute(async (transaction) => {
        if (uuid) {
          const existing =
            await sql`SELECT id FROM ecommerce_catalog WHERE uuid=${uuid} FOR UPDATE`.execute(
              transaction
            );
          if (!existing.rows.length) throw AppError.notFound("Catalog entry was not found.");
          await sql`UPDATE ecommerce_catalog SET product_id=${input.productId}, title=${input.title}, slug=${input.slug}, description=${input.description}, sku=${input.sku}, price=${input.price}, compare_at_price=${input.compareAtPrice}, currency=${input.currency}, image_url=${input.imageUrl}, image_alt=${input.imageAlt}, seo_title=${input.seoTitle}, seo_description=${input.seoDescription}, published=${input.published}, featured=${input.featured} WHERE uuid=${uuid}`.execute(
            transaction
          );
        } else {
          await sql`INSERT INTO ecommerce_catalog (uuid, product_id, title, slug, description, sku, price, compare_at_price, currency, image_url, image_alt, seo_title, seo_description, published, featured, created_by) VALUES (${identity}, ${input.productId}, ${input.title}, ${input.slug}, ${input.description}, ${input.sku}, ${input.price}, ${input.compareAtPrice}, ${input.currency}, ${input.imageUrl}, ${input.imageAlt}, ${input.seoTitle}, ${input.seoDescription}, ${input.published}, ${input.featured}, ${this.actor})`.execute(
            transaction
          );
        }
        await this.audit(transaction, identity, uuid ? "updated" : "created", input.title);
      });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY")
        throw AppError.conflict("Product, slug, and SKU must each be unique in the catalog.");
      throw error;
    }
    return this.find(identity);
  }
  async lifecycle(uuid: string, action: "activate" | "deactivate" | "delete") {
    return this.database.transaction().execute(async (transaction) => {
      const row = (
        await sql<CatalogRow>`SELECT ${projection} FROM ecommerce_catalog WHERE uuid=${uuid} FOR UPDATE`.execute(
          transaction
        )
      ).rows[0];
      if (!row) throw AppError.notFound("Catalog entry was not found.");
      if (action === "delete") {
        if (row.status === "active" || Boolean(row.published))
          throw AppError.conflict("Unpublish and suspend this entry before permanent deletion.");
        // Database foreign keys also reject deletion if future commerce records depend on this entry.
        try {
          await sql`DELETE FROM ecommerce_catalog WHERE uuid=${uuid}`.execute(transaction);
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ER_ROW_IS_REFERENCED_2"
          )
            throw AppError.conflict("Catalog entry is used by another record.");
          throw error;
        }
      } else
        await sql`UPDATE ecommerce_catalog SET status=${action === "activate" ? "active" : "inactive"}, published=${action === "activate" ? Boolean(row.published) : false} WHERE uuid=${uuid}`.execute(
          transaction
        );
      await this.audit(transaction, uuid, action, row.title);
      return record(row);
    });
  }
}
