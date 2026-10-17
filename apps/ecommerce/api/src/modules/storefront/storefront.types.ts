export type StorefrontProduct = {
  badge: StorefrontProductBadge | null;
  brand: string | null;
  category: string;
  compareAtPrice: number | null;
  description: string;
  featured: boolean;
  featuredOrder: number | null;
  imageAlt: string;
  imageUrl: string;
  name: string;
  price: number;
  shortDescription: string;
  slug: string;
  subtitle: string;
  variantCount: number;
  bulletPoints?: string[];
};

export type StorefrontProductBadge = {
  text: string;
  type: "bestseller" | "limited" | "new" | "discount" | "default";
};

export type StorefrontSlider = {
  actionLabel: string;
  actionUrl: string;
  description: string;
  displayOrder: number;
  eyebrow: string;
  imageAlt: string;
  imageUrl: string;
  linkedItem: string | null;
  sliderCode: string;
  title: string;
};
export type StorefrontPromotion = {
  actionLabel: string;
  actionUrl: string;
  badge: string;
  badgePosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  badgeTint: string;
  badgeTextColor: string;
  description: string;
  displayOrder: number;
  eyebrow: string;
  imageAlt: string;
  imageUrl: string;
  linkedItem: string | null;
  offerPrice: number;
  originalPrice: number | null;
  promotionCode: string;
  title: string;
};
export type StorefrontFeaturedCard = Omit<StorefrontPromotion, "promotionCode"> & {
  featuredCode: string;
};

export type StorefrontProductDetail = StorefrontProduct & {
  bulletPoints: string[];
  images: StorefrontProductImage[];
  returnPolicy: string;
  variants: Array<{ id: number; sku: string; title: string; price: number }>;
  warranty: string;
};

export type StorefrontProductImage = {
  altText: string;
  caption: string;
  url: string;
  variantId: number | null;
};

export type StorefrontCatalogFilters = {
  brand?: string | undefined;
  category?: string | undefined;
  maxPrice?: number | undefined;
  minPrice?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  scope?: StorefrontSearchScope | undefined;
  search?: string | undefined;
  sort?: StorefrontSort | undefined;
};

export type StorefrontSearchScope = "all" | "products" | "brands" | "categories";
export type StorefrontSort = "featured" | "name" | "price-asc" | "price-desc" | "discount";

export type StorefrontDiscovery = {
  brands: Array<{ logoAlt: string; logoUrl: string; name: string; productCount: number }>;
  categories: Array<{ imageUrl?: string; name: string; productCount: number }>;
  priceRange: { maximum: number; minimum: number };
};
export type StorefrontSiteNavigation = {
  about: string;
  closingCta: {
    actionLabel: string;
    actionUrl: string;
    description: string;
    eyebrow: string;
    title: string;
  };
  copyrightText: string;
  groups: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
  paymentMethods: Array<{ logoUrl: string; name: string }>;
  socialLinks: Array<{ label: string; href: string }>;
  poweredByText: string;
  serviceBanner: {
    actionLabel: string;
    actionUrl: string;
    description: string;
    eyebrow: string;
    title: string;
  };
  tagline: string;
  trustedStrip: {
    description: string;
    eyebrow: string;
    panels: Array<{
      action: string;
      description: string;
      details: string[];
      href: string;
      title: string;
    }>;
    proofPoints: string[];
    title: string;
  };
};

