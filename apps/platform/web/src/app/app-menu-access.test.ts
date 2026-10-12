import assert from "node:assert/strict";
import test from "node:test";
import { appMenuFor, appMenuItemsFor, enabledAppIds } from "./app-registry";

test("legacy Accounts entitlement remains visible in the tenant desk", () => {
  assert.equal(enabledAppIds(["accounts.accounting"]).includes("accounts"), true);
});

test("LogicX Schemes is shown only when Billing is enabled", () => {
  const select = () => {};
  const menu = (billingEnabled: boolean) =>
    appMenuItemsFor(
      "logicx-erp",
      "logicx-erp.overview",
      select,
      undefined,
      undefined,
      billingEnabled
    );
  const launcherMenu = (billingEnabled: boolean) =>
    appMenuFor("logicx-erp", "logicx-erp.overview", select, undefined, undefined, billingEnabled);

  assert.deepEqual(
    menu(false).map((item) => item.title),
    ["Overview"]
  );
  assert.deepEqual(
    menu(true).map((item) => item.title),
    ["Overview", "Schemes"]
  );
  assert.deepEqual(
    launcherMenu(false).items?.map((item) => item.title),
    ["Overview"]
  );
  assert.deepEqual(
    launcherMenu(true).items?.map((item) => item.title),
    ["Overview", "Schemes"]
  );
});
