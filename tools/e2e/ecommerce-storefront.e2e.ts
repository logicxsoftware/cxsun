import { request as httpRequest } from "node:http";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createConnection } from "mysql2/promise";
import { env } from "../../apps/platform/api/src/env.js";
assert.equal(env.NODE_ENV, "development");
assert.ok(env.DEFAULT_TENANT_DB_NAME.startsWith("cxsun_dev_"));
assert.ok(env.DB_MASTER_NAME.startsWith("cxsun_dev_"));
const base = `http://127.0.0.1:${env.PLATFORM_API_PORT}`;
const db = await createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DEFAULT_TENANT_DB_NAME
});
let reference: string | undefined;
try {
  const [ddlBefore] = await db.query("SHOW CREATE TABLE core_products");
  const response = await fetch(base + "/public/ecommerce/storefront", {
    headers: { "x-tenant-db": "another_tenant", "x-tenant-id": "ffffffff" }
  });
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data.store.brandName, "Tech Media");
  assert.ok(data.products.length > 0, "Publish at least one development catalog product");
  const product = data.products[0];
  assert.equal("productId" in product, false);
  assert.equal("permissions" in data, false);
  assert.equal("activity" in product, false);
  assert.equal(product.offers[0].availability, "confirm_with_seller");
  const unknownHostStatus = await new Promise<number | undefined>((resolve, reject) => {
    const request = httpRequest(
      base + "/public/ecommerce/storefront",
      { headers: { host: "unverified.invalid" } },
      (response) => {
        response.resume();
        resolve(response.statusCode);
      }
    );
    request.on("error", reject);
    request.end();
  });
  assert.equal(unknownHostStatus, 404);
  assert.equal(
    (
      await fetch(base + "/ecommerce/storefront/quotes", {
        headers: { "x-tenant-db": env.DEFAULT_TENANT_DB_NAME }
      })
    ).status,
    401
  );
  const input = {
    requestKey: randomBytes(16).toString("hex"),
    name: "Storefront E2E",
    email: "storefront-e2e@example.test",
    phone: "+919999999999",
    notes: "Isolated quote validation",
    consent: true,
    items: [{ catalogUuid: product.uuid, vendorUuid: product.offers[0].vendorUuid, quantity: 2 }]
  };
  async function submit(body: unknown, origin = "http://127.0.0.1:7040") {
    return fetch(base + "/public/ecommerce/quotes", {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify(body)
    });
  }
  assert.equal((await submit(input, "https://unverified.invalid")).status, 403);
  assert.equal(
    (await submit({ ...input, items: [{ ...input.items[0], quantity: 0 }] })).status,
    400
  );
  assert.equal(
    (await submit({ ...input, items: [{ ...input.items[0], vendorUuid: "ffffffff" }] })).status,
    400
  );
  const created = await submit(input);
  assert.equal(created.status, 200);
  const receipt = (await created.json()).data;
  reference = receipt.reference;
  assert.match(reference!, /^[a-f0-9]{8}$/);
  const replay = await submit(input);
  assert.equal(replay.status, 200);
  assert.equal((await replay.json()).data.reference, reference);
  assert.equal((await submit({ ...input, name: "Changed request" })).status, 409);
  const [rows] = await db.query(
    "SELECT customer_name, status FROM ecommerce_storefront_quotes WHERE uuid=?",
    [reference]
  );
  assert.equal((rows as { customer_name: string; status: string }[])[0]?.customer_name, input.name);
  const [items] = await db.query(
    "SELECT title, quantity, quoted_price FROM ecommerce_storefront_quote_items WHERE quote_uuid=?",
    [reference]
  );
  assert.equal((items as { quantity: number }[])[0]?.quantity, 2);
  const [ddlAfter] = await db.query("SHOW CREATE TABLE core_products");
  assert.deepEqual(ddlAfter, ddlBefore);
  console.log(
    "Storefront E2E passed: published products, host isolation, protected inbox, origin validation, quote persistence, idempotency and Core schema preservation."
  );
} finally {
  if (reference) {
    await db.query("DELETE FROM ecommerce_storefront_quote_items WHERE quote_uuid=?", [reference]);
    await db.query("DELETE FROM ecommerce_storefront_quotes WHERE uuid=?", [reference]);
    await db.query("DELETE FROM ecommerce_storefront_activity WHERE record_uuid=?", [reference]);
  }
  await db.end();
}
