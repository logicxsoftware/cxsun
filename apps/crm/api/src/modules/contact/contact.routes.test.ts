import assert from "node:assert/strict";
import { test } from "node:test";
import Fastify from "fastify";
import { registerCrmContactRoutes } from "./contact.routes.js";

test("CRM contacts forwards reads through Core with the caller identity", async () => {
  const app = Fastify();
  let coreSearch = "";
  let coreAuthorization = "";
  let coreSessionSlot = "";
  let coreCookie = "";
  let coreHost = "";
  let coreOrigin = "";
  let authorized = false;
  app.get("/core/master/contacts", async (request) => {
    coreSearch = String((request.query as { search?: string }).search ?? "");
    coreAuthorization = request.headers.authorization ?? "";
    coreSessionSlot = String(request.headers["x-cxsun-session-slot"] ?? "");
    coreCookie = String(request.headers.cookie ?? "");
    coreHost = String(request.headers.host ?? "");
    coreOrigin = String(request.headers.origin ?? "");
    return { success: true, data: [{ id: 17, name: "Acme" }] };
  });
  registerCrmContactRoutes(app, async () => {
    authorized = true;
  });

  const response = await app.inject({
    method: "GET",
    url: "/crm/contacts?search=Acme",
    headers: {
      authorization: "Bearer test-session",
      cookie: "cxsun_session_slot=encrypted-session",
      host: "127.0.0.1:7010",
      origin: "http://127.0.0.1:7020",
      "x-cxsun-session-slot": "0123456789abcdef0123456789abcdef",
      "x-tenant-db": "tenant_test"
    }
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().data, [{ id: 17, name: "Acme" }]);
  assert.equal(coreSearch, "Acme");
  assert.equal(coreAuthorization, "Bearer test-session");
  assert.equal(coreSessionSlot, "0123456789abcdef0123456789abcdef");
  assert.equal(coreCookie, "cxsun_session_slot=encrypted-session");
  assert.equal(coreHost, "127.0.0.1:7010");
  assert.equal(coreOrigin, "http://127.0.0.1:7020");
  assert.equal(authorized, true);
  await app.close();
});

test("CRM contacts forwards create payloads to Core", async () => {
  const app = Fastify();
  let corePayload: unknown;
  app.post("/core/master/contacts", async (request) => {
    corePayload = request.body;
    return { success: true, data: { id: 18, name: "New customer" } };
  });
  registerCrmContactRoutes(app, async () => undefined);
  const payload = { name: "New customer", typeId: 1 };

  const response = await app.inject({ method: "POST", url: "/crm/contacts", payload });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(corePayload, payload);
  assert.deepEqual(response.json().data, { id: 18, name: "New customer" });
  await app.close();
});

test("CRM contacts preserves expired-session errors from Core", async () => {
  const app = Fastify();
  app.setErrorHandler((error, _request, reply) => {
    const apiError = error as Error & { code: string; statusCode: number };
    return reply.code(apiError.statusCode).send({
      success: false,
      error: { code: apiError.code, message: apiError.message }
    });
  });
  app.get("/core/master/contacts", async (_request, reply) =>
    reply.code(401).send({
      success: false,
      error: { code: "AUTH_SESSION_EXPIRED", message: "Session expired. Please sign in again." }
    })
  );
  registerCrmContactRoutes(app, async () => undefined);

  const response = await app.inject({ method: "GET", url: "/crm/contacts" });

  assert.equal(response.statusCode, 401);
  assert.equal(response.json().error.code, "AUTH_SESSION_EXPIRED");
  assert.equal(response.json().error.message, "Session expired. Please sign in again.");
  await app.close();
});
