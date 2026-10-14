import type { FastifyInstance } from "fastify";
import { defineModule } from "@cxsun/framework/modules";
import { ChatConnectionManager, ChatRealtimeBus, registerChatRealtime } from "./chat.realtime.js";
import { registerChatRoutes } from "./chat.routes.js";
import type { ChatModuleDependencies } from "./chat.types.js";

export function createChatModule(dependencies: ChatModuleDependencies) {
  return defineModule<{ app: FastifyInstance }>({
    key: "chat",
    label: "Chat",
    register: async ({ app }) => {
      const manager = new ChatConnectionManager();
      const bus = new ChatRealtimeBus(manager);
      registerChatRoutes(app, { ...dependencies, events: bus });
      await registerChatRealtime(app, { ...dependencies, events: bus, manager });
    }
  });
}
