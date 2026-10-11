import assert from "node:assert/strict";
import { test } from "node:test";
import { crmRequest } from "../../crm-request";
import { saveCrmEnquiryDataSource } from "./data-source.services";

test("empty CRM responses are reported and an uncertain source save is checked", async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { __CXSUN_RUNTIME_CONFIG__: { VITE_PLATFORM_API_URL: "http://localhost/api/app" } }
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: { getItem: () => null }
  });

  try {
    globalThis.fetch = async () => new Response("", { status: 200 });
    await assert.rejects(crmRequest("/crm/enquiries/source"), /empty response \(HTTP 200\)/);

    const methods: string[] = [];
    globalThis.fetch = async (_url, options) => {
      methods.push(options?.method ?? "GET");
      return options?.method === "PUT"
        ? new Response("", { status: 200 })
        : Response.json({ success: true, data: { moduleKey: "crm.enquiries", provider: "local" } });
    };
    const saved = await saveCrmEnquiryDataSource("local");
    assert.equal(saved.provider, "local");
    assert.deepEqual(methods, ["PUT", "GET"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (originalStorage) Object.defineProperty(globalThis, "sessionStorage", originalStorage);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
});
