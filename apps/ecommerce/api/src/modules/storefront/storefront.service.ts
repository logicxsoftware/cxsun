import { AppError } from "@cxsun/framework/errors";
import { StorefrontRepository } from "./storefront.repository.js";
import type { QuoteInput, StorefrontPublicContext, StorefrontProduct } from "./storefront.types.js";
export class StorefrontService {
  private readonly repository: StorefrontRepository;
  constructor(private readonly context: StorefrontPublicContext) {
    this.repository = new StorefrontRepository(context.database);
  }
  async bootstrap() {
    const config = await this.repository.config();
    if (!config.enabled) throw AppError.notFound("Storefront is not available.");
    const catalog = await this.context.catalog();
    const products: StorefrontProduct[] = catalog.map(
      ({ price, compareAtPrice, currency, ...entry }) => ({
        ...entry,
        industryKey: config.industryKey,
        offers: [
          {
            uuid: entry.uuid,
            vendorUuid: config.uuid,
            vendorName: config.brandName,
            price: price > 0 ? price : null,
            compareAtPrice,
            currency,
            availability: "confirm_with_seller"
          }
        ]
      })
    );
    const counts = new Map<string, number>();
    for (const product of products) {
      const category =
        product.categoryName?.trim() === "-"
          ? "Uncategorised"
          : (product.categoryName ?? "Uncategorised");
      product.categoryName = category;
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return {
      store: {
        brandName: config.brandName,
        tagline: config.tagline,
        location: config.location,
        phone: config.phone,
        email: config.email,
        logoUrl: config.logoUrl
      },
      industries: [{ key: config.industryKey, name: config.industryName }],
      vendors: [{ uuid: config.uuid, name: config.brandName, location: config.location }],
      categories: [...counts]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      products
    };
  }
  async quote(input: QuoteInput) {
    const snapshot = await this.bootstrap();
    const keys = new Set<string>();
    const items = input.items.map((selection) => {
      const key = `${selection.catalogUuid}:${selection.vendorUuid}`;
      if (keys.has(key))
        throw AppError.validation("Combine duplicate quote items into a single quantity.");
      keys.add(key);
      const product = snapshot.products.find((entry) => entry.uuid === selection.catalogUuid);
      const offer = product?.offers.find((entry) => entry.vendorUuid === selection.vendorUuid);
      if (!product || !offer)
        throw AppError.validation(
          "One or more selected products or sellers are no longer available. Refresh your basket."
        );
      return {
        catalogUuid: product.uuid,
        vendorUuid: offer.vendorUuid,
        title: product.title,
        quantity: selection.quantity,
        price: offer.price,
        currency: offer.currency
      };
    });
    return this.repository.createQuote(input, items, this.context.clientKey);
  }
}
