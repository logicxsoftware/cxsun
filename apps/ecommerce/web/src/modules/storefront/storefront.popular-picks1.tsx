import { useState, useMemo, type ReactNode } from "react";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  LayoutGridIcon,
  LaptopIcon,
  MonitorIcon,
  HeadphonesIcon,
  PrinterIcon,
  CableIcon,
  Gamepad2Icon,
  HardDriveIcon,
  HomeIcon,
  TagIcon,
  TvIcon,
  CpuIcon,
  LayersIcon,
  BatteryChargingIcon,
  Volume2Icon,
  MouseIcon,
  SmartphoneIcon,
  ShoppingCartIcon,
  CheckIcon,
  StarIcon,
  SparklesIcon
} from "lucide-react";
import type { StorefrontDiscovery, StorefrontFilters, StorefrontProduct } from "./storefront.types";
import { money } from "./storefront.formatters";
import { addStorefrontCartItem } from "./storefront.cart";
import "./storefront.popular-picks1.css";

/* --------------------------------------------------------------------------
   1. SHOP BY CATEGORY SECTION
   -------------------------------------------------------------------------- */

type CategoryItem = {
  key: string;
  name: string;
  value: string;
  icon: ReactNode;
  themeClass: string;
  isDeals?: boolean;
};

const STANDARD_CATEGORIES: Array<{
  aliases: string[];
  icon: (cls: string) => ReactNode;
  name: string;
  themeClass: string;
}> = [
  {
    name: "Laptops",
    aliases: ["laptop", "notebook", "macbook"],
    icon: () => <LaptopIcon />,
    themeClass: "cx-cat-pill--laptops"
  },
  {
    name: "Desktop Computers",
    aliases: ["desktop", "computer", "aio", "workstation", "pc"],
    icon: () => <MonitorIcon />,
    themeClass: "cx-cat-pill--desktop-computers"
  },
  {
    name: "Monitors",
    aliases: ["monitor", "display", "screen"],
    icon: () => <TvIcon />,
    themeClass: "cx-cat-pill--monitors"
  },
  {
    name: "Accessories",
    aliases: ["accessor", "mouse", "keyboard"],
    icon: () => <HeadphonesIcon />,
    themeClass: "cx-cat-pill--accessories"
  },
  {
    name: "Printers",
    aliases: ["printer", "scanner", "copier"],
    icon: () => <PrinterIcon />,
    themeClass: "cx-cat-pill--printers"
  },
  {
    name: "Cables & Connectors",
    aliases: ["cable", "connector", "adapter", "wire"],
    icon: () => <CableIcon />,
    themeClass: "cx-cat-pill--cables-connectors"
  },
  {
    name: "Gaming",
    aliases: ["game", "gaming", "console"],
    icon: () => <Gamepad2Icon />,
    themeClass: "cx-cat-pill--gaming"
  },
  {
    name: "Storage",
    aliases: ["storage", "ssd", "hdd", "drive"],
    icon: () => <HardDriveIcon />,
    themeClass: "cx-cat-pill--storage"
  },
  {
    name: "Smart Home",
    aliases: ["smart", "home", "iot"],
    icon: () => <HomeIcon />,
    themeClass: "cx-cat-pill--smart-home"
  }
];

export function ShopByCategoryBar({
  categories,
  filters,
  onFilters
}: {
  categories: StorefrontDiscovery["categories"];
  filters: StorefrontFilters;
  onFilters: (value: StorefrontFilters) => void;
}) {
  const items = useMemo(() => {
    const list: CategoryItem[] = [];

    // 1. All Collections
    list.push({
      key: "all",
      name: "All Collections",
      value: "",
      icon: <LayoutGridIcon />,
      themeClass: "cx-cat-pill--all"
    });

    // 2. Standard categories mapped to backend categories
    const mappedBackendNames = new Set<string>();

    for (const def of STANDARD_CATEGORIES) {
      // Find matching backend category
      const matched = categories.find((cat) => {
        const catNorm = cat.name.toLowerCase();
        return (
          catNorm === def.name.toLowerCase() ||
          def.aliases.some((alias) => catNorm.includes(alias))
        );
      });

      if (matched) {
        mappedBackendNames.add(matched.name);
        list.push({
          key: matched.name,
          name: def.name,
          value: matched.name,
          icon: def.icon(""),
          themeClass: def.themeClass
        });
      }
    }

    // 3. Extra backend categories from admin panel not covered in standard list
    for (const cat of categories) {
      if (!mappedBackendNames.has(cat.name) && !list.some((i) => i.value === cat.name)) {
        const norm = cat.name.toLowerCase();
        let icon = <TagIcon />;
        let themeClass = "cx-cat-pill--accessories";
        if (norm.includes("phone") || norm.includes("mobile")) {
          icon = <SmartphoneIcon />;
          themeClass = "cx-cat-pill--smart-home";
        } else if (norm.includes("audio") || norm.includes("sound") || norm.includes("speaker")) {
          icon = <HeadphonesIcon />;
          themeClass = "cx-cat-pill--accessories";
        }
        list.push({
          key: cat.name,
          name: cat.name,
          value: cat.name,
          icon,
          themeClass
        });
      }
    }

    // 4. Deals pill
    list.push({
      key: "deals",
      name: "Deals",
      value: "",
      icon: <TagIcon />,
      themeClass: "cx-cat-pill--deals",
      isDeals: true
    });

    return list;
  }, [categories]);

  const handleSelect = (item: CategoryItem) => {
    if (item.isDeals) {
      onFilters({
        ...filters,
        category: "",
        sort: "discount"
      });
      return;
    }
    onFilters({
      ...filters,
      category: item.value,
      sort: filters.sort === "discount" ? "featured" : filters.sort
    });
  };

  return (
    <div className="cx-shop-by-cat">
      <div className="cx-shop-by-cat__header">
        <a className="cx-shop-by-cat__title-wrap" href="/search?scope=categories">
          <h2 className="cx-shop-by-cat__title">Shop by Category</h2>
          <ChevronRightIcon className="cx-shop-by-cat__title-chevron" aria-hidden="true" />
        </a>
        <a className="cx-shop-by-cat__all-link" href="/search?scope=categories">
          View all categories <ArrowRightIcon aria-hidden="true" />
        </a>
      </div>

      <div className="cx-shop-by-cat__pills-wrapper">
        <div className="cx-shop-by-cat__pills">
          {items.map((item) => {
            const isDeals = item.isDeals;
            const active = isDeals
              ? filters.sort === "discount"
              : filters.category === item.value && filters.sort !== "discount";

            return (
              <button
                className={`cx-cat-pill ${item.themeClass}${active ? " is-active" : ""}`}
                key={item.key}
                onClick={() => handleSelect(item)}
                type="button"
              >
                <span className="cx-cat-pill__icon">{item.icon}</span>
                <span className="cx-cat-pill__name">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   2. POPULAR PICKS FOR YOU SECTION & CARDS
   -------------------------------------------------------------------------- */

export function PopularPicksSection({
  currentPage,
  hasMore,
  loadingMore,
  onPrevPage,
  onNextPage,
  products,
  totalPages
}: {
  currentPage: number;
  hasMore: boolean;
  loadingMore: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  products: StorefrontProduct[];
  totalPages: number;
}) {
  return (
    <section className="cx-popular-picks" id="popular-picks">
      <div className="cx-popular-picks__header">
        <div className="cx-popular-picks__left">
          <span className="cx-popular-picks__eyebrow">
            <span className="cx-popular-picks__eyebrow-bar" /> FEATURED PRODUCTS
          </span>
          <h2 className="cx-popular-picks__title">Popular Products</h2>
          <p className="cx-popular-picks__subtitle">
            Handpicked products with the best performance, features, and value.
          </p>
        </div>

        <div className="cx-popular-picks__right">
          <button
            aria-label="Previous products"
            className="cx-popular-picks__nav-btn"
            disabled={currentPage === 0 || loadingMore}
            onClick={onPrevPage}
            type="button"
          >
            <ChevronLeftIcon />
          </button>
          <button
            aria-label="Next products"
            className="cx-popular-picks__nav-btn"
            disabled={(!hasMore && currentPage >= totalPages - 1) || loadingMore}
            onClick={onNextPage}
            type="button"
          >
            <ChevronRightIcon />
          </button>
          <a className="cx-popular-picks__view-all-btn" href="/search?sort=featured">
            View all products <ArrowRightIcon />
          </a>
        </div>
      </div>

      <div
        aria-live="polite"
        className="cx-popular-picks__grid"
        key={currentPage}
      >
        {products.map((product, index) => (
          <PopularPicksCard
            eagerImage={index < 4}
            key={product.slug}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   2B. FEATURED PRODUCTS SECTION (Short Product Cards, Handpicked Highlights)
   -------------------------------------------------------------------------- */

export function FeaturedProductsSection({
  products
}: {
  products: StorefrontProduct[];
}) {
  const featured = useMemo(() => {
    const list = products.filter((p) => p.featured);
    return list.length > 0 ? list.slice(0, 4) : products.slice(0, 4);
  }, [products]);

  if (featured.length === 0) return null;

  return (
    <section aria-label="Featured Products" className="cx-featured-products-section">
      <div className="cx-popular-picks__header">
        <div>
          <span className="cx-popular-picks__eyebrow">CURATED HARDWARE</span>
          <h2 className="cx-popular-picks__title">Featured Products</h2>
          <p className="cx-popular-picks__desc">
            Flagship laptops, workstations, and high-performance computing verified by our engineers.
          </p>
        </div>
        <div className="cx-popular-picks__controls">
          <a className="cx-popular-picks__view-all-btn" href="/shop?sort=featured">
            View all featured <ArrowRightIcon />
          </a>
        </div>
      </div>

      <div className="cx-popular-picks__grid">
        {featured.map((product, index) => (
          <PopularPicksCard
            eagerImage={index < 4}
            key={`featured-${product.slug}`}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   3. INDIVIDUAL POPULAR PICK CARD (SHORT, COMPACT, NO MORE BULKY EXPLANATIONS)
   -------------------------------------------------------------------------- */

type SpecEntry = {
  icon: ReactNode;
  text: string;
};

export function PopularPicksCard({
  eagerImage = false,
  index: _index,
  product
}: {
  eagerImage?: boolean;
  index?: number;
  product: StorefrontProduct;
}) {
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => {
    try {
      const saved = localStorage.getItem("cxsun.wishlist");
      return saved ? JSON.parse(saved).includes(product.slug) : false;
    } catch {
      return false;
    }
  });

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !wishlisted;
    setWishlisted(next);
    try {
      const saved = localStorage.getItem("cxsun.wishlist");
      const list: string[] = saved ? JSON.parse(saved) : [];
      const updated = next ? [...new Set([...list, product.slug])] : list.filter((s) => s !== product.slug);
      localStorage.setItem("cxsun.wishlist", JSON.stringify(updated));
    } catch {}
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addStorefrontCartItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Discount computation
  const compare = product.compareAtPrice;
  const hasDiscount = Boolean(compare && compare > product.price);
  const discountPct = hasDiscount && compare ? Math.round(((compare - product.price) / compare) * 100) : 0;

  // Short feature highlight (at most 1 clean line)
  const shortHighlight = product.subtitle || (product.bulletPoints && product.bulletPoints[0] ? cleanSpecText(product.bulletPoints[0]) : null);

  return (
    <article className="cx-pick-card">
      {/* Top Row: Badge + Wishlist */}
      <div className="cx-pick-card__top">
        {product.badge ? (
          <span className={`cx-pick-card__badge cx-pick-card__badge--${product.badge.type}`}>
            <span className="cx-pick-card__badge-icon" aria-hidden="true">
              {renderProductBadgeIcon(product.badge.type)}
            </span>
            {product.badge.text}
          </span>
        ) : <span aria-hidden="true" />}

        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`cx-pick-card__wishlist-btn${wishlisted ? " is-active" : ""}`}
          onClick={handleToggleWishlist}
          type="button"
        >
          <HeartIcon />
        </button>
      </div>

      {/* Image Showcase Area */}
      <div className="cx-pick-card__img-stage">
        <a
          aria-label={`View ${product.name}`}
          className="cx-pick-card__img-wrap"
          href={`/shop/product/${product.slug}`}
          tabIndex={-1}
        >
          <img
            alt={product.imageAlt || product.name}
            className="cx-pick-card__img"
            decoding="async"
            loading={eagerImage ? "eager" : "lazy"}
            src={product.imageUrl}
          />
        </a>
      </div>

      {/* Details: Meta, Title, Short Subtitle */}
      <div className="cx-pick-card__details">
        <div className="cx-pick-card__meta">
          {[product.brand, product.category].filter(Boolean).join(" • ").toUpperCase()}
        </div>

        <a className="cx-pick-card__title" href={`/shop/product/${product.slug}`}>
          {product.name}
        </a>

        {/* Short Highlight (Single line, concise, no long multi-paragraph explanation on homepage) */}
        {shortHighlight ? (
          <div className="cx-pick-card__subtitle">
            <CheckIcon aria-hidden="true" />
            <span>{shortHighlight}</span>
          </div>
        ) : (
          <div className="cx-pick-card__subtitle cx-pick-card__subtitle--warranty">
            <SparklesIcon aria-hidden="true" />
            <span>Official Warranty</span>
          </div>
        )}

        {/* Price Row */}
        <div className="cx-pick-card__price-row">
          <strong className="cx-pick-card__price">{money(product.price)}</strong>
          {hasDiscount && compare ? (
            <del className="cx-pick-card__compare-price">{money(compare)}</del>
          ) : null}
          {hasDiscount && discountPct > 0 ? (
            <span className="cx-pick-card__discount-pill">{discountPct}% OFF</span>
          ) : null}
        </div>
      </div>

      {/* Action Buttons: Add to Cart + View Details */}
      <div className="cx-pick-card__actions">
        <button
          className={`cx-pick-card__btn-cart${added ? " is-added" : ""}`}
          onClick={handleAddToCart}
          type="button"
        >
          {added ? (
            <>
              <CheckIcon /> Added!
            </>
          ) : (
            <>
              <ShoppingCartIcon /> Add to Cart
            </>
          )}
        </button>

        <a className="cx-pick-card__btn-details" href={`/shop/product/${product.slug}`}>
          View Details <ArrowRightIcon />
        </a>
      </div>
    </article>
  );
}

function pickSpecIcon(text: string): ReactNode {
  const norm = text.toLowerCase();
  if (norm.includes("oled") || norm.includes("display") || norm.includes("screen") || norm.includes("4k") || norm.includes("hdr") || norm.includes("retina")) {
    return <TvIcon className="cx-pick-card__spec-icon" />;
  }
  if (norm.includes("core") || norm.includes("intel") || norm.includes("ryzen") || norm.includes("m3") || norm.includes("cpu") || norm.includes("chip") || norm.includes("rtx") || norm.includes("gpu")) {
    return <CpuIcon className="cx-pick-card__spec-icon" />;
  }
  if (norm.includes("ram") || norm.includes("memory") || norm.includes("unified")) {
    return <LayersIcon className="cx-pick-card__spec-icon" />;
  }
  if (norm.includes("ssd") || norm.includes("storage") || norm.includes("hdd") || norm.includes("1tb") || norm.includes("512gb")) {
    return <HardDriveIcon className="cx-pick-card__spec-icon" />;
  }
  if (norm.includes("battery") || norm.includes("hrs") || norm.includes("hours")) {
    return <BatteryChargingIcon className="cx-pick-card__spec-icon" />;
  }
  if (norm.includes("dpi") || norm.includes("clicks") || norm.includes("mouse") || norm.includes("sensor")) {
    return <MouseIcon className="cx-pick-card__spec-icon" />;
  }
  if (norm.includes("sound") || norm.includes("speaker") || norm.includes("audio")) {
    return <Volume2Icon className="cx-pick-card__spec-icon" />;
  }
  if (norm.includes("usb") || norm.includes("cable") || norm.includes("port") || norm.includes("hz")) {
    return <CableIcon className="cx-pick-card__spec-icon" />;
  }
  return <SparklesIcon className="cx-pick-card__spec-icon" />;
}

function renderProductBadgeIcon(type: NonNullable<StorefrontProduct["badge"]>["type"]): ReactNode {
  switch (type) {
    case "bestseller":
      return <StarIcon />;
    case "limited":
    case "discount":
      return <TagIcon />;
    case "new":
      return <SparklesIcon />;
    default:
      return null;
  }
}

function cleanSpecText(text: string): string {
  return text
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}
