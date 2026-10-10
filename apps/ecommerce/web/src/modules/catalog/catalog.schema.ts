import { z } from "zod";
export const catalogSchema = z
  .object({
    productId: z.number().int().positive("Select a Core product."),
    title: z.string().trim().min(1, "Storefront title is required.").max(191),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required.")
      .max(191)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens."),
    sku: z.string().trim().min(1, "SKU is required.").max(100),
    description: z.string().trim().max(20000),
    price: z
      .number()
      .min(0, "Price cannot be negative.")
      .max(9999999999999.99)
      .multipleOf(0.01, "Use at most two decimal places."),
    compareAtPrice: z.number().min(0).max(9999999999999.99).multipleOf(0.01).nullable(),
    currency: z.string().regex(/^[A-Z]{3}$/, "Enter a three-letter currency code."),
    imageUrl: z.union([
      z.literal(""),
      z
        .url()
        .max(2048)
        .refine((value) => /^https?:\/\//.test(value), "Use an HTTP or HTTPS image URL.")
    ]),
    imageAlt: z.string().trim().max(191),
    seoTitle: z.string().trim().max(191),
    seoDescription: z.string().trim().max(320),
    published: z.boolean(),
    featured: z.boolean()
  })
  .refine((value) => value.compareAtPrice === null || value.compareAtPrice >= value.price, {
    path: ["compareAtPrice"],
    message: "Compare-at price must be at least the selling price."
  })
  .refine((value) => !value.imageUrl || !!value.imageAlt, {
    path: ["imageAlt"],
    message: "Image alternative text is required."
  });
