import assert from "node:assert/strict";
import { test } from "node:test";
import type { EnquiryService } from "./enquiry.service.js";
import { EnquiryReadService, type EnquiryRemoteSource } from "./enquiry.read-source.js";

const query = { scope: "all" as const, page: 1, pageSize: 50, search: "", filter: "all" };

test("Local source reads only the local repository", async () => {
  const local = {
    listPage: async () => ({ items: [], total: 3, statusCounts: [] })
  } as unknown as EnquiryService;
  const remote = {
    provider: async () => "local" as const,
    list: async () => {
      throw new Error("unexpected Frappe read");
    }
  } as unknown as EnquiryRemoteSource;
  const page = await new EnquiryReadService(local, remote).list(query);
  assert.equal(page.source, "local");
  assert.equal(page.total, 3);
});

test("Frappe source reads only the live adapter and forwards report filters", async () => {
  const local = {
    listPage: async () => {
      throw new Error("unexpected local read");
    }
  } as unknown as EnquiryService;
  const remote = {
    provider: async () => "frappe" as const,
    list: async (input: Record<string, unknown>) => {
      assert.equal(input.group, "Service");
      assert.equal(input.status, "New");
      assert.equal(input.fromDate, "2026-10-01");
      return { source: "frappe" as const, page: 1, pageSize: 50, hasMore: false, items: [] };
    }
  } as unknown as EnquiryRemoteSource;
  const page = await new EnquiryReadService(local, remote).list({
    ...query,
    filter: "New",
    group: "Service",
    fromDate: "2026-10-01"
  });
  assert.equal(page.source, "frappe");
  await assert.rejects(() => new EnquiryReadService(local, remote).assertLocal(), /Select Local/);
});
