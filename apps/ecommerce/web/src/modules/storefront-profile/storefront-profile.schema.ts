import { z } from "zod";

const optionalUrl = z.union([
  z.literal(""),
  z.string().url("Enter a complete https:// link.").max(500),
  z.string().startsWith("/api/platform/storefront/product-images/").max(500)
]);
export const storefrontProfileSchema = z.object({
  aboutUs: z.string().max(2000),
  homeCtaActionLabel: z.string().max(120),
  homeCtaActionUrl: z.string().max(500),
  homeCtaDescription: z.string().max(500),
  homeCtaEyebrow: z.string().max(120),
  homeCtaTitle: z.string().max(240),
  copyrightText: z.string().max(240),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  paymentMethods: z
    .array(
      z.object({
        logoUrl: optionalUrl,
        name: z.string().trim().min(1, "Enter a payment method name.").max(80)
      })
    )
    .max(12, "Add no more than 12 payment methods."),
  poweredByText: z.string().max(240),
  serviceActionLabel: z.string().max(120),
  serviceActionUrl: z.string().max(500),
  serviceDescription: z.string().max(500),
  serviceEyebrow: z.string().max(120),
  serviceTitle: z.string().max(240),
  tagline: z.string().max(240),
  trustedDescription: z.string().max(500),
  trustedEyebrow: z.string().max(120),
  trustedProofPoints: z.string().max(1000),
  trustedPanels: z
    .array(
      z.object({
        action: z.string().trim().min(1).max(120),
        description: z.string().trim().min(1).max(500),
        details: z.array(z.string().trim().min(1).max(160)).min(1).max(5),
        href: z.string().trim().min(1).max(500),
        title: z.string().trim().min(1).max(160)
      })
    )
    .length(5),
  trustedTitle: z.string().max(240),
  threadsUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  xUrl: optionalUrl,
  youtubeUrl: optionalUrl
});
