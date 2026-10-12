import assert from "node:assert/strict";
import test from "node:test";
import { crmDataSourceProviderSchema } from "./data-source.schema";

test("CRM data source accepts only the supported providers", () => {
  assert.equal(crmDataSourceProviderSchema.parse("local"), "local");
  assert.equal(crmDataSourceProviderSchema.parse("frappe"), "frappe");
  assert.equal(crmDataSourceProviderSchema.safeParse("other").success, false);
});
