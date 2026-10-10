import { z } from "zod";
const uuid = z.string().regex(/^[a-f0-9]{8}$/);
export const quoteSchema = z.object({
  requestKey: z.string().regex(/^[a-f0-9]{32}$/),
  name: z.string().trim().min(1, "Enter your name").max(191),
  email: z.email(),
  phone: z.string().regex(/^[+\d][\d\s()-]{6,31}$/, "Enter a valid phone number"),
  notes: z.string().max(2000),
  consent: z.literal(true),
  items: z
    .array(
      z.object({ catalogUuid: uuid, vendorUuid: uuid, quantity: z.number().int().min(1).max(99) })
    )
    .min(1)
    .max(50)
});
