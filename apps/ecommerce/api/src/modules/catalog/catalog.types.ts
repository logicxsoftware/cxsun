import type { Kysely } from "kysely";
export const catalogPermissions = [
  "ecommerce.catalog.view",
  "ecommerce.catalog.create",
  "ecommerce.catalog.edit",
  "ecommerce.catalog.status",
  "ecommerce.catalog.delete"
] as const;
export type CatalogPermission = (typeof catalogPermissions)[number];
export type CatalogProduct = {
  id: number;
  uuid: string;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  unitName: string | null;
  taxRate: number | null;
  active: boolean;
};
export type CatalogCategory = { id: number; name: string; active: boolean };
export type CatalogInput = {
  productId: number;
  title: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  imageUrl: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  featured: boolean;
};
export type CatalogRow = CatalogInput & {
  id: number;
  uuid: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};
export type CatalogRecord = CatalogRow & { product: CatalogProduct; available: boolean };
export type CatalogActivity = {
  uuid: string;
  action: string;
  actorEmail: string;
  summary: string;
  createdAt: string;
};
export type CatalogDatabase = {
  ecommerce_catalog: { id: number };
  ecommerce_catalog_activity: { id: number };
};
export type CatalogContext = {
  database: Kysely<CatalogDatabase>;
  actorEmail: string;
  authorize: (permission: CatalogPermission) => Promise<void>;
  products: () => Promise<CatalogProduct[]>;
  categories: () => Promise<CatalogCategory[]>;
};
