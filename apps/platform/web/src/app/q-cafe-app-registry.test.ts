import assert from "node:assert/strict";
import test from "node:test";
import { appRootUrl, enabledAppIds, platformAppRegistry } from "./app-registry";

test("Q Cafe opens from the tenant launcher only when its module is enabled", () => {
  assert.equal(appRootUrl("q-cafe"), "/app/q-cafe");
  assert.equal(enabledAppIds(["q-cafe"]).includes("q-cafe"), true);
  assert.equal(enabledAppIds(["crm"]).includes("q-cafe"), false);
  assert.equal(platformAppRegistry.find((app) => app.id === "q-cafe")?.moduleKey, "q-cafe");
});
