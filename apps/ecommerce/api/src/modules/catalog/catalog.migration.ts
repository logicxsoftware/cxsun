import { sql, type Kysely } from "kysely";
import {
  runMigrationBatch,
  rollbackMigrationBatch,
  type MigrationBatch
} from "@cxsun/framework/db";
import type { CatalogDatabase } from "./catalog.types.js";
async function createCatalog(database: Kysely<CatalogDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS ecommerce_catalog (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(8) NOT NULL UNIQUE,
    product_id INT NOT NULL UNIQUE,
    title VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(15,2) NOT NULL,
    compare_at_price DECIMAL(15,2) NULL,
    currency CHAR(3) NOT NULL,
    image_url VARCHAR(2048) NOT NULL DEFAULT '',
    image_alt VARCHAR(191) NOT NULL DEFAULT '',
    seo_title VARCHAR(191) NOT NULL DEFAULT '',
    seo_description VARCHAR(320) NOT NULL DEFAULT '',
    published BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_by VARCHAR(191) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX ecommerce_catalog_status_published (status, published),
    CONSTRAINT ecommerce_catalog_product_fk FOREIGN KEY (product_id) REFERENCES core_products(id) ON DELETE RESTRICT,
    CONSTRAINT ecommerce_catalog_price_check CHECK (price >= 0 AND (compare_at_price IS NULL OR compare_at_price >= price))
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
  // Retain audit history after removing an Ecommerce entry; Core records remain untouched.
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS ecommerce_catalog_activity (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(8) NOT NULL UNIQUE,
    catalog_uuid CHAR(8) NOT NULL,
    action VARCHAR(24) NOT NULL,
    actor_email VARCHAR(191) NOT NULL,
    summary VARCHAR(255) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX ecommerce_catalog_activity_parent (catalog_uuid, created_at)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
}
async function dropCatalog(database: Kysely<CatalogDatabase>) {
  await sql`DROP TABLE IF EXISTS ecommerce_catalog_activity`.execute(database);
  await sql`DROP TABLE IF EXISTS ecommerce_catalog`.execute(database);
}
const batch: MigrationBatch<CatalogDatabase> = {
  batch: 1,
  description: "Ecommerce catalog extensions for existing Core products.",
  scope: "ecommerce.catalog",
  version: "1.0.81",
  steps: [
    {
      checksum: "ecommerce.catalog.database-v1:v1",
      description: "Create catalog extensions and retained activity.",
      name: "ecommerce.catalog.database-v1",
      version: 1,
      up: createCatalog,
      down: dropCatalog
    }
  ]
};
export const catalogMigrations = batch.steps.map(({ name, description }) => ({
  name,
  description
}));
export const migrateCatalogDatabase = (database: Kysely<CatalogDatabase>) =>
  runMigrationBatch(database, batch);

export const rollbackCatalogDatabase = (database: Kysely<CatalogDatabase>) =>
  rollbackMigrationBatch(database, batch);
