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
export type CatalogRecord = CatalogInput & {
  id: number;
  uuid: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  product: CatalogProduct;
  available: boolean;
};
export type CatalogActivity = {
  uuid: string;
  action: string;
  actorEmail: string;
  summary: string;
  createdAt: string;
};
export type CatalogCapabilities = {
  create: boolean;
  edit: boolean;
  status: boolean;
  remove: boolean;
};
export type CatalogLookups = {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  permissions: CatalogCapabilities;
};
