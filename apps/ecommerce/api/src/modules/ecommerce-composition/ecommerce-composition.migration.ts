import { sql, type Kysely } from "kysely";
import { runMigrationBatch, type MigrationBatch } from "@cxsun/framework/db";
import type { EcommerceDatabase } from "../../database/ecommerce-database.js";
import {
  migrateProductInformationModule,
  upgradeProductInformationDetails
} from "../product-information/product-information.migration.js";
import { migrateProductVariantModule } from "../product-variant/product-variant.migration.js";
import { migrateProductImageModule } from "../product-image/product-image.migration.js";
import { migrateStorefrontSliderModule } from "../storefront-slider/storefront-slider.migration.js";
import {
  migratePromotionCardModule,
  upgradePromotionCardBadgeTextColor
} from "../promotion-card/promotion-card.migration.js";
import { migrateFeaturedCardModule } from "../featured-card/featured-card.migration.js";
import {
  migrateSeasonStripModule,
  upgradeStorefrontSectionVisibility
} from "../season-strip/season-strip.migration.js";
import { migrateStorefrontAnnouncementModule } from "../storefront-announcement/storefront-announcement.migration.js";
import {
  migrateStorefrontProfileModule,
  upgradeStorefrontProfileSocialLinks,
  upgradeStorefrontProfileUxContent,
  upgradeStorefrontProfilePaymentMethods
} from "../storefront-profile/storefront-profile.migration.js";
import {
  migrateCatalogMatchingModule,
  upgradeCatalogMatchingUuidWidth
} from "../catalog-matching/catalog-matching.migration.js";
import {
  migrateCatalogDataSourceSync,
  upgradeCatalogDataSourceAudit,
  migrateCatalogModuleDataSources,
  upgradeCatalogStorefrontSourceCompatibility,
  upgradeCatalogStorefrontUxSources,
  upgradeCatalogStorefrontErpnextLinks,
  upgradeCatalogDataSourceCompatibility,
  upgradeCatalogDataSourceSeedCompatibility,
  upgradeCatalogStorefrontSlider
} from "../catalog-data-source/catalog-data-source.migration.js";
import { standardizeStorefrontSchema } from "../storefront/storefront-schema.migration.js";
import { upgradeStorefrontReadPerformance } from "../storefront/storefront-performance.migration.js";

const steps = [
  ["product-information", migrateProductInformationModule],
  ["product-information-details", upgradeProductInformationDetails],
  ["product-variant", migrateProductVariantModule],
  ["product-image", migrateProductImageModule],
  ["storefront-slider", migrateStorefrontSliderModule],
  ["promotion-card", migratePromotionCardModule],
  ["promotion-card-badge", upgradePromotionCardBadgeTextColor],
  ["featured-card", migrateFeaturedCardModule],
  ["season-strip", migrateSeasonStripModule],
  ["storefront-announcement", migrateStorefrontAnnouncementModule],
  ["storefront-profile", migrateStorefrontProfileModule],
  ["storefront-profile-social", upgradeStorefrontProfileSocialLinks],
  ["storefront-profile-content", upgradeStorefrontProfileUxContent],
  ["storefront-profile-payments", upgradeStorefrontProfilePaymentMethods],
  ["catalog-matching", migrateCatalogMatchingModule],
  ["catalog-matching-uuid", upgradeCatalogMatchingUuidWidth],
  ["catalog-data-source", migrateCatalogDataSourceSync],
  ["catalog-data-source-audit", upgradeCatalogDataSourceAudit],
  ["catalog-module-sources", migrateCatalogModuleDataSources],
  ["catalog-source-compatibility", upgradeCatalogStorefrontSourceCompatibility],
  ["catalog-ux-sources", upgradeCatalogStorefrontUxSources],
  ["catalog-erpnext-links", upgradeCatalogStorefrontErpnextLinks],
  ["catalog-cache-compatibility", upgradeCatalogDataSourceCompatibility],
  ["catalog-cache-seed-compatibility", upgradeCatalogDataSourceSeedCompatibility],
  ["catalog-storefront-slider", upgradeCatalogStorefrontSlider],
  ["storefront-section-visibility", upgradeStorefrontSectionVisibility],
  ["storefront-schema", standardizeStorefrontSchema],
  ["storefront-performance", upgradeStorefrontReadPerformance],
  ["legacy-cleanup", dropLegacyEcommerceTables]
] as const;

const versionedSteps = steps.map(([name, up], index) => ({
  name: `ecommerce.modules.${name}`,
  description: `Migrate ecommerce ${name}.`,
  checksum: `ecommerce.modules.${name}:v1`,
  version: index + 1,
  up
}));
const sourcePreferenceStep = versionedSteps.find(
  (step) => step.name === "ecommerce.modules.catalog-module-sources"
);
if (!sourcePreferenceStep) throw new Error("Ecommerce source preference migration is missing.");
const orderedSteps = [
  ...versionedSteps.slice(0, 2),
  sourcePreferenceStep,
  ...versionedSteps.slice(2).filter((step) => step !== sourcePreferenceStep)
];

const batch: MigrationBatch<EcommerceDatabase> = {
  batch: 1,
  scope: "ecommerce.modules",
  description: "Install the copied ecommerce modules and retire legacy catalog and quote data.",
  version: "1.0.83",
  steps: orderedSteps
};

export const ecommerceTenantMigrations = batch.steps.map(({ name, description }) => ({
  name,
  description
}));

export async function migrateEcommerceTenantDatabase(database: Kysely<EcommerceDatabase>) {
  return runMigrationBatch(database, batch);
}

export async function rollbackEcommerceTenantDatabase(database: Kysely<EcommerceDatabase>) {
  for (const table of [
    "ecommerce_catalog_match_outbox",
    "ecommerce_catalog_match_requests",
    "ecommerce_catalog_items",
    "ecommerce_catalog_sync_runs",
    "ecommerce_catalog_module_data_sources",
    "ecommerce_storefront_announcements",
    "ecommerce_storefront_profiles",
    "ecommerce_storefront_season_strips",
    "ecommerce_storefront_featured_cards",
    "ecommerce_storefront_promotions",
    "ecommerce_storefront_sliders",
    "ecommerce_product_images",
    "ecommerce_product_variants",
    "ecommerce_ishop_catalogs",
    "ecommerce_product_information"
  ]) {
    await sql.raw(`DROP TABLE IF EXISTS ${table}`).execute(database);
  }
  await sql`DELETE FROM migration_schema WHERE name LIKE 'ecommerce.modules.%'`.execute(database);
}

async function dropLegacyEcommerceTables(database: Kysely<EcommerceDatabase>) {
  for (const table of [
    "ecommerce_storefront_quote_items",
    "ecommerce_storefront_quotes",
    "ecommerce_storefront_activity",
    "ecommerce_storefront_config",
    "ecommerce_catalog_activity",
    "ecommerce_catalog"
  ]) {
    await sql.raw(`DROP TABLE IF EXISTS ${table}`).execute(database);
  }
}
