export type PlatformAppId =
  | "application"
  | "billing"
  | "accounts"
  | "devkit"
  | "project-manager"
  | "mail"
  | "notes"
  | "chat"
  | "task-manager"
  | "blog"
  | "auditor"
  | "crm"
  | "frappe"
  | "zetro"
  | "logicx-erp"
  | "ecommerce"
  | "q-cafe"
  | "hrms"
  | "docs"
  | "himsx"
  | "codexsun";

export type PlatformAppDefinition = {
  alwaysEnabled: boolean;
  defaultLanding: boolean;
  description: string;
  id: number;
  appId: PlatformAppId;
  label: string;
  moduleKey: string;
  stack:
    | "platform"
    | "billing"
    | "accounts"
    | "devkit"
    | "project-manager"
    | "mail"
    | "notes"
    | "chat"
    | "platform-task-manager"
    | "blog"
    | "auditor"
    | "crm"
    | "frappe"
    | "zetro"
    | "logicx-erp"
    | "ecommerce"
    | "q-cafe"
    | "hrms"
    | "docs"
    | "himsx"
    | "codexsun";
  uuid: string;
};

export type PlatformAppSavePayload = Omit<PlatformAppDefinition, "id" | "uuid">;
