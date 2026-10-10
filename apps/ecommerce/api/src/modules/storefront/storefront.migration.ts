import { sql, type Kysely } from "kysely";
import {
  runMigrationBatch,
  rollbackMigrationBatch,
  type MigrationBatch
} from "@cxsun/framework/db";
import type { StorefrontDatabase } from "./storefront.types.js";
async function up(database: Kysely<StorefrontDatabase>) {
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS ecommerce_storefront_config (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE,
    config_key VARCHAR(24) NOT NULL UNIQUE DEFAULT 'default', brand_name VARCHAR(191) NOT NULL,
    tagline VARCHAR(191) NOT NULL DEFAULT '', location VARCHAR(191) NOT NULL DEFAULT '',
    phone VARCHAR(32) NOT NULL DEFAULT '', email VARCHAR(191) NOT NULL DEFAULT '', logo_url VARCHAR(2048) NOT NULL DEFAULT '',
    industry_key VARCHAR(64) NOT NULL DEFAULT 'computers-it', industry_name VARCHAR(191) NOT NULL DEFAULT 'Computers & IT',
    enabled BOOLEAN NOT NULL DEFAULT FALSE, status VARCHAR(24) NOT NULL DEFAULT 'active',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS ecommerce_storefront_quotes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE, request_key CHAR(32) NOT NULL UNIQUE,
    request_hash CHAR(64) NOT NULL, client_hash CHAR(64) NOT NULL,
    customer_name VARCHAR(191) NOT NULL, email VARCHAR(191) NOT NULL, phone VARCHAR(32) NOT NULL,
    notes TEXT NOT NULL, consent_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    status VARCHAR(24) NOT NULL DEFAULT 'received', created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX ecommerce_storefront_quotes_client (client_hash, created_at), INDEX ecommerce_storefront_quotes_status (status, created_at)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS ecommerce_storefront_quote_items (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE,
    quote_uuid CHAR(8) NOT NULL, catalog_uuid CHAR(8) NOT NULL, vendor_uuid CHAR(8) NOT NULL,
    title VARCHAR(191) NOT NULL, quantity INT NOT NULL, quoted_price DECIMAL(15,2) NULL, currency CHAR(3) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'active', created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY ecommerce_storefront_quote_item_unique (quote_uuid, catalog_uuid, vendor_uuid),
    CONSTRAINT ecommerce_storefront_quote_parent_fk FOREIGN KEY (quote_uuid) REFERENCES ecommerce_storefront_quotes(uuid) ON DELETE RESTRICT,
    CONSTRAINT ecommerce_storefront_quote_catalog_fk FOREIGN KEY (catalog_uuid) REFERENCES ecommerce_catalog(uuid) ON DELETE RESTRICT,
    CONSTRAINT ecommerce_storefront_quote_vendor_fk FOREIGN KEY (vendor_uuid) REFERENCES ecommerce_storefront_config(uuid) ON DELETE RESTRICT,
    CONSTRAINT ecommerce_storefront_quote_quantity_check CHECK (quantity BETWEEN 1 AND 99)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
  await sql
    .raw(
      `CREATE TABLE IF NOT EXISTS ecommerce_storefront_activity (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, uuid CHAR(8) NOT NULL UNIQUE, record_uuid CHAR(8) NOT NULL,
    action VARCHAR(24) NOT NULL, actor VARCHAR(191) NOT NULL, summary VARCHAR(255) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'active', created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX ecommerce_storefront_activity_record (record_uuid, created_at)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    .execute(database);
}
async function down(database: Kysely<StorefrontDatabase>) {
  await sql`DROP TABLE IF EXISTS ecommerce_storefront_activity`.execute(database);
  await sql`DROP TABLE IF EXISTS ecommerce_storefront_quote_items`.execute(database);
  await sql`DROP TABLE IF EXISTS ecommerce_storefront_quotes`.execute(database);
  await sql`DROP TABLE IF EXISTS ecommerce_storefront_config`.execute(database);
}
const batch: MigrationBatch<StorefrontDatabase> = {
  batch: 1,
  scope: "ecommerce.storefront",
  description: "Public storefront configuration and quote intake.",
  version: "1.0.81",
  steps: [
    {
      name: "ecommerce.storefront.database-v1",
      description: "Create storefront configuration and audited quote requests.",
      checksum: "ecommerce.storefront.database-v1:v1",
      version: 1,
      up,
      down
    }
  ]
};
export const storefrontMigrations = batch.steps.map(({ name, description }) => ({
  name,
  description
}));
export const migrateStorefrontDatabase = (database: Kysely<StorefrontDatabase>) =>
  runMigrationBatch(database, batch);
export const rollbackStorefrontDatabase = (database: Kysely<StorefrontDatabase>) =>
  rollbackMigrationBatch(database, batch);
