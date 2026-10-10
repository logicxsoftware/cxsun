import { createHash } from "node:crypto";
import { sql, type Kysely } from "kysely";
import { storefrontPermissions, type StorefrontDatabase } from "./storefront.types.js";
import type { EcommercePermissionDatabase } from "../overview/index.js";
export async function seedStorefront(
  database: Kysely<StorefrontDatabase>,
  tenant: { code: string; name: string }
) {
  const uuid = createHash("sha256").update(`storefront:${tenant.code}`).digest("hex").slice(0, 8);
  // Tenant-specific defaults are private until an authorised publisher enables the store.
  await sql`INSERT IGNORE INTO ecommerce_storefront_config (uuid, config_key, brand_name) VALUES (${uuid}, 'default', ${tenant.name})`.execute(
    database
  );
}
export async function seedStorefrontPermissions(database: Kysely<EcommercePermissionDatabase>) {
  for (const key of storefrontPermissions) {
    const uuid = createHash("sha256").update(key).digest("hex").slice(0, 8);
    const grant = createHash("sha256")
      .update(`role-permission:admin:${key}`)
      .digest("hex")
      .slice(0, 8);
    await sql`INSERT INTO app_permissions (uuid, \`key\`, label, description, status, is_protected) VALUES (${uuid}, ${key}, ${key.replaceAll(".", " ")}, ${`Allows ${key}.`}, 'active', TRUE) ON DUPLICATE KEY UPDATE label=VALUES(label), description=VALUES(description)`.execute(
      database
    );
    await sql`INSERT INTO app_role_permissions (uuid, role_id, permission_id, status, is_protected) SELECT ${grant}, role.id, permission.id, 'active', TRUE FROM app_roles role INNER JOIN app_permissions permission ON permission.\`key\`=${key} WHERE role.\`key\`='admin' ON DUPLICATE KEY UPDATE uuid=app_role_permissions.uuid`.execute(
      database
    );
  }
}
