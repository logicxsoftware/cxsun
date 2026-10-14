import { defineModule } from "@cxsun/framework/modules";
import type { PlatformModuleDependencies } from "../../module-dependencies.js";
import { registerQCafeRoutes } from "./q-cafe.routes.js";

export const qCafeModule = defineModule<PlatformModuleDependencies>({
  key: "q-cafe",
  label: "Q Cafe",
  register({ app }) {
    return registerQCafeRoutes(app);
  }
});
