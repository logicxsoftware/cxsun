import { AppError } from "@cxsun/framework/errors";
import { CatalogRepository } from "./catalog.repository.js";
import type {
  CatalogContext,
  CatalogInput,
  CatalogRow,
  CatalogPermission
} from "./catalog.types.js";
export class CatalogService {
  private readonly repository: CatalogRepository;
  constructor(private readonly context: CatalogContext) {
    this.repository = new CatalogRepository(context.database, context.actorEmail);
  }
  async lookups() {
    const [products, categories] = await Promise.all([
      this.context.products(),
      this.context.categories()
    ]);
    const allowed = async (permission: CatalogPermission) => {
      try {
        await this.context.authorize(permission);
        return true;
      } catch (error) {
        if (error && typeof error === "object" && "statusCode" in error && error.statusCode === 403)
          return false;
        throw error;
      }
    };
    const [create, edit, status, remove] = await Promise.all([
      allowed("ecommerce.catalog.create"),
      allowed("ecommerce.catalog.edit"),
      allowed("ecommerce.catalog.status"),
      allowed("ecommerce.catalog.delete")
    ]);
    return { products, categories, permissions: { create, edit, status, remove } };
  }
  private async enrich(rows: CatalogRow[]) {
    const [products, categories] = await Promise.all([
      this.context.products(),
      this.context.categories()
    ]);
    const productMap = new Map(products.map((product) => [product.id, product]));
    const activeCategories = new Set(
      categories.filter((category) => category.active).map((category) => category.id)
    );
    return rows.map((row) => {
      const product = productMap.get(row.productId);
      if (!product) throw AppError.conflict("Linked Core product is unavailable.");
      const categoryActive =
        product.categoryId === null || activeCategories.has(product.categoryId);
      return {
        ...row,
        product,
        available: row.status === "active" && row.published && product.active && categoryActive
      };
    });
  }
  async list(search = "", categoryId?: number) {
    const rows = await this.enrich(await this.repository.list());
    const term = search.toLowerCase();
    return rows.filter(
      (row) =>
        (!categoryId || row.product.categoryId === categoryId) &&
        (!term ||
          [row.title, row.slug, row.sku, row.product.name, row.product.categoryName ?? ""].some(
            (value) => value.toLowerCase().includes(term)
          ))
    );
  }
  async get(uuid: string) {
    const row = await this.repository.find(uuid);
    if (!row) throw AppError.notFound("Catalog entry was not found.");
    return (await this.enrich([row]))[0]!;
  }
  async save(input: CatalogInput, uuid?: string) {
    const { products, categories } = await this.lookups();
    const product = products.find(
      (item) => item.id === input.productId && item.active && item.name.trim() !== "-"
    );
    if (!product) throw AppError.validation("Select an active Core product.");
    if (
      product.categoryId !== null &&
      !categories.some((category) => category.id === product.categoryId && category.active)
    )
      throw AppError.validation("The Core product category is inactive or unavailable.");
    if (uuid && input.published && (await this.get(uuid)).status !== "active")
      throw AppError.validation("Reactivate this catalog entry before publishing.");
    const saved = await this.repository.save(input, uuid);
    if (!saved) throw AppError.internal("Catalog entry could not be saved.");
    return this.get(saved.uuid);
  }
  async lifecycle(uuid: string, action: "activate" | "deactivate" | "delete") {
    const current = await this.get(uuid);
    if (action === "activate" && !current.product.active)
      throw AppError.validation("Reactivate the Core product first.");
    await this.repository.lifecycle(uuid, action);
    return action === "delete" ? current : this.get(uuid);
  }
  async activity(uuid: string) {
    await this.get(uuid);
    return this.repository.activity(uuid);
  }
}

export async function listPublishedCatalogForStorefront(
  context: Pick<CatalogContext, "database" | "products" | "categories">
) {
  const service = new CatalogService({
    ...context,
    actorEmail: "public:storefront",
    authorize: async () => {
      throw AppError.forbidden("Public catalog lookups cannot authorise mutations.");
    }
  });
  return (await service.list())
    .filter((entry) => entry.available && entry.product.name.trim() !== "-")
    .map((entry) => ({
      uuid: entry.uuid,
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      sku: entry.sku,
      price: entry.price,
      compareAtPrice: entry.compareAtPrice,
      currency: entry.currency,
      imageUrl: entry.imageUrl,
      imageAlt: entry.imageAlt,
      featured: entry.featured,
      categoryName: entry.product.categoryName,
      seoTitle: entry.seoTitle,
      seoDescription: entry.seoDescription
    }));
}
