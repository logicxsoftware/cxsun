import assert from "node:assert/strict";
import { after, test } from "node:test";
import type { Kysely } from "kysely";
import { encryptFrappeCredential } from "./connection.secrets.js";
import { listLiveFrappeEnquiries } from "./connection.live-enquiries.js";
import type { FrappeDatabase } from "./connection.types.js";

const originalFetch = globalThis.fetch;
after(() => {
  globalThis.fetch = originalFetch;
});

function database(provider: "local" | "frappe") {
  const row = {
    base_url: "https://frappe.example/",
    api_key_ciphertext: encryptFrappeCredential("key", "test-secret", "key"),
    api_secret_ciphertext: encryptFrappeCredential("secret", "test-secret", "secret"),
    enabled: true,
    verification_status: "verified"
  };
  return {
    selectFrom: (table: string) => ({
      select: () => ({
        where: () => ({
          executeTakeFirst: async () => (table === "frappe_data_sources" ? { provider } : undefined)
        })
      }),
      selectAll: () => ({ where: () => ({ executeTakeFirst: async () => row }) })
    })
  } as unknown as Kysely<FrappeDatabase>;
}

const defaults = { baseUrl: "", apiKey: "", apiSecret: "", enabled: false };
const query = {
  scope: "assigned" as const,
  page: 2,
  pageSize: 1,
  search: "printer",
  status: "Pending"
};

test("live CRM query sends paged TechMedia enquiry filters to Frappe", async () => {
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.pathname, "/api/resource/Enquiry");
    if (url.searchParams.has("group_by")) {
      assert.equal(url.searchParams.get("group_by"), "status");
      assert.deepEqual(JSON.parse(url.searchParams.get("filters") ?? "[]"), [
        ["assigned_to_employee", "=", "EMP-1"],
        ["title", "like", "%printer%"]
      ]);
      return Response.json({ data: [{ status: "Pending", count: 12 }] });
    }
    assert.equal(url.searchParams.get("limit_start"), "1");
    assert.equal(url.searchParams.get("limit_page_length"), "2");
    assert.deepEqual(JSON.parse(url.searchParams.get("filters") ?? "[]"), [
      ["assigned_to_employee", "=", "EMP-1"],
      ["title", "like", "%printer%"],
      ["status", "=", "Pending"]
    ]);
    assert.equal(
      (init?.headers as Record<string, string> | undefined)?.Authorization,
      "token key:secret"
    );
    return Response.json({
      data: [
        { name: "ENQ-2", title: "Printer" },
        { name: "ENQ-3", title: "More" }
      ]
    });
  };
  const result = await listLiveFrappeEnquiries(
    database("frappe"),
    defaults,
    "test-secret",
    query,
    "EMP-1",
    false
  );
  assert.equal(result.hasMore, true);
  assert.equal(result.total, 12);
  assert.deepEqual(result.statusCounts, [{ code: "Pending", count: 12 }]);
  assert.deepEqual(
    result.items.map((item) => item.name),
    ["ENQ-2"]
  );
});

test("local source never makes a live Frappe request", async () => {
  globalThis.fetch = async () => {
    throw new Error("unexpected request");
  };
  await assert.rejects(
    () =>
      listLiveFrappeEnquiries(database("local"), defaults, "test-secret", query, "EMP-1", false),
    /set to Local/
  );
});

test("personal live views require a Frappe employee mapping", async () => {
  globalThis.fetch = async () => {
    throw new Error("unexpected request");
  };
  await assert.rejects(
    () => listLiveFrappeEnquiries(database("frappe"), defaults, "test-secret", query, null, false),
    /Map this CRM user/
  );
});

test("all enquiries for a restricted user use Frappe employee OR filters", async () => {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    assert.deepEqual(JSON.parse(url.searchParams.get("or_filters") ?? "[]"), [
      ["assigned_to_employee", "=", "EMP-1"],
      ["user_employee", "=", "EMP-1"]
    ]);
    return Response.json({ data: [] });
  };
  await listLiveFrappeEnquiries(
    database("frappe"),
    defaults,
    "test-secret",
    { ...query, scope: "all" },
    "EMP-1",
    false
  );
});

test("live report drilldown applies group, assignee, status and date filters", async () => {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    assert.deepEqual(JSON.parse(url.searchParams.get("filters") ?? "[]"), [
      ...(url.searchParams.has("group_by") ? [] : [["status", "=", "New"]]),
      ["group", "=", "Service"],
      ["assigned_to_employee", "=", "EMP-2"],
      ["date", ">=", "2026-10-01"],
      ["date", "<=", "2026-10-10"]
    ]);
    return Response.json({ data: [] });
  };
  await listLiveFrappeEnquiries(
    database("frappe"),
    defaults,
    "test-secret",
    {
      scope: "all",
      page: 1,
      pageSize: 50,
      search: "",
      status: "New",
      group: "Service",
      assignee: "EMP-2",
      fromDate: "2026-10-01",
      toDate: "2026-10-10"
    },
    null,
    true
  );
});
