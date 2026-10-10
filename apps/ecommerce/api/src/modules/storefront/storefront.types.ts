import type { Kysely } from "kysely";
export const storefrontPermissions = [
  "ecommerce.storefront.view",
  "ecommerce.storefront.manage",
  "ecommerce.storefront.quotes"
] as const;
export type StorefrontPermission = (typeof storefrontPermissions)[number];
export type StorefrontConfigInput = {
  brandName: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  logoUrl: string;
  industryKey: string;
  industryName: string;
  enabled: boolean;
};
export type StorefrontConfig = StorefrontConfigInput & { uuid: string };
// Minimal public lookup owned by this child. Core identities and audit fields never leave the public storefront.
export type StorefrontCatalogLookup = {
  uuid: string;
  slug: string;
  title: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
  categoryName: string | null;
  seoTitle: string;
  seoDescription: string;
};
export type StorefrontOffer = {
  uuid: string;
  vendorUuid: string;
  vendorName: string;
  price: number | null;
  compareAtPrice: number | null;
  currency: string;
  availability: "confirm_with_seller";
};
export type StorefrontProduct = Omit<
  StorefrontCatalogLookup,
  "price" | "compareAtPrice" | "currency"
> & { industryKey: string; offers: StorefrontOffer[] };
export type QuoteInput = {
  requestKey: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  consent: true;
  items: { catalogUuid: string; vendorUuid: string; quantity: number }[];
};
export type QuoteItem = {
  catalogUuid: string;
  vendorUuid: string;
  title: string;
  quantity: number;
  price: number | null;
  currency: string;
};
export type QuoteRecord = {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: "received" | "reviewing" | "closed";
  createdAt: string;
  items: QuoteItem[];
};
export type StorefrontReceipt = { reference: string; status: "received"; itemCount: number };
export type StorefrontDatabase = {
  ecommerce_storefront_config: { id: number };
  ecommerce_storefront_quotes: { id: number };
  ecommerce_storefront_quote_items: { id: number };
  ecommerce_storefront_activity: { id: number };
};
export type StorefrontPublicContext = {
  database: Kysely<StorefrontDatabase>;
  clientKey: string;
  catalog: () => Promise<StorefrontCatalogLookup[]>;
};
export type StorefrontAdminContext = {
  database: Kysely<StorefrontDatabase>;
  actorEmail: string;
  authorize: (permission: StorefrontPermission) => Promise<void>;
};
