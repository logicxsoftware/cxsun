export interface Offer {
  uuid: string;
  vendorUuid: string;
  vendorName: string;
  price: number | null;
  compareAtPrice: number | null;
  currency: string;
  availability: "confirm_with_seller";
}
export interface ShopProduct {
  uuid: string;
  slug: string;
  title: string;
  description: string;
  sku: string;
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
  categoryName: string | null;
  seoTitle: string;
  seoDescription: string;
  industryKey: string;
  offers: Offer[];
}
export interface ShopSnapshot {
  store: {
    brandName: string;
    tagline: string;
    location: string;
    phone: string;
    email: string;
    logoUrl: string;
  };
  industries: { key: string; name: string }[];
  vendors: { uuid: string; name: string; location: string }[];
  categories: { name: string; count: number }[];
  products: ShopProduct[];
}
export interface BasketItem {
  catalogUuid: string;
  vendorUuid: string;
  quantity: number;
}
export interface QuoteInput {
  requestKey: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  consent: true;
  items: BasketItem[];
}
export interface QuoteReceipt {
  reference: string;
  status: "received";
  itemCount: number;
}
export interface ShopGateway {
  load: () => Promise<ShopSnapshot>;
  quote: (input: QuoteInput) => Promise<QuoteReceipt>;
}
export function money(value: number | null, currency = "INR") {
  return value === null
    ? "Price on request"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }).format(value);
}
