import { z } from "zod";

export const crmDataSourceProviderSchema = z.enum(["local", "frappe"]);
