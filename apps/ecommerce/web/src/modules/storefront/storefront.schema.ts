import { z } from "zod";
export const storeConfigSchema = z.object({
  brandName: z.string().trim().min(1).max(191),
  tagline: z.string().max(191),
  location: z.string().max(191),
  phone: z.string().max(32),
  email: z.union([z.literal(""), z.email().max(191)]),
  logoUrl: z.union([
    z.literal(""),
    z
      .url()
      .max(2048)
      .refine((v) => /^https?:\/\//.test(v))
  ]),
  industryKey: z
    .string()
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  industryName: z.string().min(1).max(191),
  enabled: z.boolean()
});
