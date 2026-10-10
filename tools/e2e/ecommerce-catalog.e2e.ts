import assert from "node:assert/strict";
import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";
import {
  migrateCatalogDatabase,
  type CatalogDatabase
} from "../../apps/ecommerce/api/src/index.js";
import { createConnection } from "mysql2/promise";
import { env } from "../../apps/platform/api/src/env.js";

assert.equal(env.NODE_ENV, "development", "Run only against an isolated development tenant");
assert.ok(env.DB_MASTER_NAME.startsWith("cxsun_dev_"));
assert.ok(env.DEFAULT_TENANT_DB_NAME.startsWith("cxsun_dev_"));
const origin = new URL(env.PLATFORM_WEB_ORIGIN);
origin.port = String(env.PLATFORM_WEB_PORT);
const base = `${origin.origin}/api/platform`;
const login = await fetch(`${base}/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: origin.origin },
  body: JSON.stringify({
    desk: "tenant",
    corporateId: env.DEFAULT_TENANT_CORPORATE_ID,
    email: env.DEFAULT_TENANT_ADMIN_EMAIL,
    password: env.DEFAULT_TENANT_ADMIN_PASSWORD
  })
});
assert.equal(login.status, 200);
const session = await login.json();
const headers = {
  cookie: login.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; "),
  "x-cxsun-session-slot": session.data.sessionSlot,
  origin: origin.origin
};
const db = await createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DEFAULT_TENANT_DB_NAME
});
let productId: number | undefined;
let categoryId: number | undefined;
let catalogUuid: string | undefined;
const suffix = `${Date.now()}`;
async function call(path: string, method = "GET", payload?: unknown, expected = 200) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...headers,
      ...(payload !== undefined ? { "content-type": "application/json" } : {})
    },
    ...(payload !== undefined ? { body: JSON.stringify(payload) } : {})
  });
  const envelope = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(envelope)}`);
  return envelope.data;
}
const [beforeProducts] = await db.query("SELECT * FROM core_products ORDER BY id");
const [beforeCategories] = await db.query("SELECT * FROM core_product_categories ORDER BY id");
const [productDDL] = await db.query("SHOW CREATE TABLE core_products");
const [categoryDDL] = await db.query("SHOW CREATE TABLE core_product_categories");
try {
  const [ledgerBefore] = await db.query("SELECT * FROM migration_schema ORDER BY id");
  const catalogDatabase = new Kysely<CatalogDatabase>({
    dialect: new MysqlDialect({
      pool: createPool({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DEFAULT_TENANT_DB_NAME
      })
    })
  });
  try {
    await migrateCatalogDatabase(catalogDatabase);
    await migrateCatalogDatabase(catalogDatabase);
  } finally {
    await catalogDatabase.destroy();
  }
  const [ledgerAfter] = await db.query("SELECT * FROM migration_schema ORDER BY id");
  assert.deepEqual(ledgerAfter, ledgerBefore, "Repeat migrations changed the ledger.");
  assert.equal(
    (
      await fetch(`${base}/ecommerce/catalog`, {
        headers: { "x-tenant-db": env.DEFAULT_TENANT_DB_NAME }
      })
    ).status,
    401
  );
  const category = await call("/core/common/products/product-categories", "POST", {
    name: `Catalog test category ${suffix}`,
    sortOrder: 1000,
    isActive: true
  });
  categoryId = category.id;
  const product = await call("/core/master/products", "POST", {
    name: `Catalog test product ${suffix}`,
    productCategoryId: categoryId
  });
  productId = product.id;
  const payload = {
    productId,
    title: `Catalog test ${suffix}`,
    slug: `catalog-test-${suffix}`,
    description: "Test linked catalog metadata.",
    sku: `TEST-${suffix}`,
    price: 99.95,
    compareAtPrice: 120,
    currency: "INR",
    imageUrl: "",
    imageAlt: "",
    seoTitle: "Test title",
    seoDescription: "Test description",
    published: false,
    featured: false
  };
  const lookup = await call("/ecommerce/catalog/lookups");
  assert.equal(
    lookup.products.find((item: { id: number }) => item.id === productId)?.categoryId,
    categoryId
  );
  assert.equal(lookup.permissions.create, true);
  const reserved = lookup.products.find((item: { name: string }) => item.name.trim() === "-");
  if (reserved)
    await call("/ecommerce/catalog", "POST", { ...payload, productId: reserved.id }, 400);
  await call("/ecommerce/catalog", "POST", { ...payload, productId: 2147483647 }, 400);
  await call("/ecommerce/catalog", "POST", { ...payload, compareAtPrice: 1 }, 400);
  await call("/ecommerce/catalog", "POST", { ...payload, slug: "invalid slug" }, 400);
  await call("/ecommerce/catalog", "POST", { ...payload, imageUrl: "javascript:alert(1)" }, 400);
  await call("/ecommerce/catalog", "POST", { ...payload, tenantId: "forged" }, 400);
  const entry = await call("/ecommerce/catalog", "POST", payload);
  catalogUuid = entry.uuid;
  assert.equal(entry.product.categoryName, category.name);
  assert.equal(entry.product.uuid, product.uuid);
  assert.equal(entry.available, false);
  await call("/ecommerce/catalog", "POST", payload, 409);
  await assert.rejects(db.execute("DELETE FROM core_products WHERE id=?", [productId]), {
    code: "ER_ROW_IS_REFERENCED_2"
  });
  const updated = await call(`/ecommerce/catalog/${catalogUuid}`, "PUT", {
    ...payload,
    published: true,
    featured: true
  });
  assert.equal(updated.available, true);
  assert.equal(updated.price, 99.95);
  await call(`/ecommerce/catalog/${catalogUuid}/force`, "DELETE", undefined, 409);
  const list = await call(`/ecommerce/catalog?categoryId=${categoryId}&search=${suffix}`);
  assert.equal(list.length, 1);
  const forged = await fetch(`${base}/ecommerce/catalog/${catalogUuid}`, {
    headers: { ...headers, "x-tenant-db": env.DB_MASTER_NAME, "x-tenant-id": "forged" }
  });
  assert.equal(forged.status, 200);
  assert.equal((await forged.json()).data.uuid, catalogUuid);
  await db.execute("UPDATE core_product_categories SET name=? WHERE id=?", [
    `Renamed category ${suffix}`,
    categoryId
  ]);
  assert.equal(
    (await call(`/ecommerce/catalog/${catalogUuid}`)).product.categoryName,
    `Renamed category ${suffix}`
  );
  await db.execute("UPDATE core_product_categories SET status='inactive' WHERE id=?", [categoryId]);
  assert.equal((await call(`/ecommerce/catalog/${catalogUuid}`)).available, false);
  await call(`/ecommerce/catalog/${catalogUuid}`, "PUT", payload, 400);
  await db.execute("UPDATE core_product_categories SET status='active' WHERE id=?", [categoryId]);
  await db.execute("UPDATE core_products SET status='inactive' WHERE id=?", [productId]);
  assert.equal((await call(`/ecommerce/catalog/${catalogUuid}`)).available, false);
  await call(`/ecommerce/catalog/${catalogUuid}`, "PUT", payload, 400);
  await db.execute(
    "UPDATE core_products SET status='active', deleted_at=CURRENT_TIMESTAMP WHERE id=?",
    [productId]
  );
  assert.equal((await call(`/ecommerce/catalog/${catalogUuid}`)).available, false);
  await db.execute("UPDATE core_products SET deleted_at=NULL WHERE id=?", [productId]);
  await db.execute(
    "UPDATE app_permissions SET status='inactive' WHERE `key`='ecommerce.catalog.create'"
  );
  try {
    await call("/ecommerce/catalog", "POST", payload, 403);
    assert.equal((await call("/ecommerce/catalog/lookups")).permissions.create, false);
  } finally {
    await db.execute(
      "UPDATE app_permissions SET status='active' WHERE `key`='ecommerce.catalog.create'"
    );
  }
  await db.execute("UPDATE app_module_settings SET enabled=FALSE WHERE module_key='ecommerce'");
  try {
    await call("/ecommerce/catalog", "GET", undefined, 403);
  } finally {
    await db.execute("UPDATE app_module_settings SET enabled=TRUE WHERE module_key='ecommerce'");
  }
  const suspended = await call(`/ecommerce/catalog/${catalogUuid}/deactivate`, "POST");
  assert.equal(suspended.status, "inactive");
  assert.equal(suspended.published, false);
  await call(`/ecommerce/catalog/${catalogUuid}`, "PUT", { ...payload, published: true }, 400);
  const active = await call(`/ecommerce/catalog/${catalogUuid}/activate`, "POST");
  assert.equal(active.status, "active");
  assert.equal(active.published, false);
  await call(`/ecommerce/catalog/${catalogUuid}/deactivate`, "POST");
  const activity = await call(`/ecommerce/catalog/${catalogUuid}/activity`);
  assert.equal(activity.length, 5);
  assert.ok(
    activity.every(
      (item: { actorEmail: string }) => item.actorEmail === env.DEFAULT_TENANT_ADMIN_EMAIL
    )
  );
  await call(`/ecommerce/catalog/${catalogUuid}/force`, "DELETE");
  await call(`/ecommerce/catalog/${catalogUuid}`, "GET", undefined, 404);
  assert.equal((await call(`/core/master/products/${productId}`)).uuid, product.uuid);
  const [history] = await db.query(
    "SELECT action FROM ecommerce_catalog_activity WHERE catalog_uuid=? ORDER BY id",
    [catalogUuid]
  );
  assert.equal((history as { action: string }[]).at(-1)?.action, "delete");
  console.log(
    "Catalog integration passed: repeatable migration ledger, Core links and live category, validated extensions, uniqueness, persistence, permissions, forged-header isolation, lifecycle, retained audit, Core preservation."
  );
} finally {
  if (catalogUuid) {
    await db.execute("DELETE FROM ecommerce_catalog WHERE uuid=?", [catalogUuid]);
    await db.execute("DELETE FROM ecommerce_catalog_activity WHERE catalog_uuid=?", [catalogUuid]);
  }
  if (productId) await db.execute("DELETE FROM core_products WHERE id=?", [productId]);
  if (categoryId) await db.execute("DELETE FROM core_product_categories WHERE id=?", [categoryId]);
  const [afterProducts] = await db.query("SELECT * FROM core_products ORDER BY id");
  const [afterCategories] = await db.query("SELECT * FROM core_product_categories ORDER BY id");
  assert.deepEqual(afterProducts, beforeProducts);
  assert.deepEqual(afterCategories, beforeCategories);
  const [afterProductDDL] = await db.query("SHOW CREATE TABLE core_products");
  const [afterCategoryDDL] = await db.query("SHOW CREATE TABLE core_product_categories");
  function structure(value: unknown) {
    return JSON.stringify(value).replace(/AUTO_INCREMENT=\d+/g, "AUTO_INCREMENT=fixture");
  }
  assert.equal(structure(afterProductDDL), structure(productDDL));
  assert.equal(structure(afterCategoryDDL), structure(categoryDDL));
  await db.end();
}
