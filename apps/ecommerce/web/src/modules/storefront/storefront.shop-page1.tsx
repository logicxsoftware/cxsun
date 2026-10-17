import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CpuIcon,
  FilterIcon,
  HardDriveIcon,
  HeartIcon,
  LayersIcon,
  RotateCcwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  SmartphoneIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  TvIcon,
  Volume2Icon,
  XIcon,
  LaptopIcon,
  HeadphonesIcon,
  MouseIcon,
  BatteryChargingIcon,
  CableIcon,
  ShoppingCartIcon
} from "lucide-react";
import {
  getStorefrontAnnouncement,
  getStorefrontBranding,
  getStorefrontDiscovery,
  getStorefrontSiteNavigation
} from "./storefront.services";
import { StoreHeader } from "./storefront.navigation1";
import { BackToTopButton, StoreFooter } from "./storefront.components1";
import { useStorefrontCatalog } from "./storefront.catalog";
import { addStorefrontCartItem } from "./storefront.cart";
import { money } from "./storefront.formatters";
import { setStorefrontSeo } from "./storefront.seo";
import type {
  StorefrontAnnouncement,
  StorefrontBranding,
  StorefrontCategory,
  StorefrontDiscovery,
  StorefrontFilters,
  StorefrontProduct,
  StorefrontSiteNavigation
} from "./storefront.types";
import "./storefront.shop-page1.css";

const emptyDiscovery: StorefrontDiscovery = {
  brands: [],
  categories: [],
  priceRange: { maximum: 0, minimum: 0 }
};

type PricePreset = {
  label: string;
  min: number | null;
  max: number | null;
};

const PRICE_PRESETS: PricePreset[] = [
  { label: "All Prices", min: null, max: null },
  { label: "Under ₹10,000", min: null, max: 10000 },
  { label: "₹10,000 - ₹30,000", min: 10000, max: 30000 },
  { label: "₹30,000 - ₹75,000", min: 30000, max: 75000 },
  { label: "₹75,000 - ₹1,50,000", min: 75000, max: 150000 },
  { label: "Above ₹1,50,000", min: 150000, max: null }
];

export function ShopCatalogPage({
  initialCategory = ""
}: {
  initialCategory?: string;
}) {
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("q") ?? "";
  const initialBrand = searchParams.get("brand") ?? "";
  const initialSort = (searchParams.get("sort") as StorefrontFilters["sort"]) ?? "featured";

  const [discovery, setDiscovery] = useState<StorefrontDiscovery>(emptyDiscovery);
  const [siteNavigation, setSiteNavigation] = useState<StorefrontSiteNavigation | null>(null);
  const [announcement, setAnnouncement] = useState<StorefrontAnnouncement | null>(null);
  const [branding, setBranding] = useState<StorefrontBranding | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<StorefrontFilters>({
    brand: initialBrand,
    category: initialCategory,
    maxPrice: null,
    minPrice: null,
    scope: "all",
    search: initialSearch,
    sort: initialSort
  });

  // Load common shell data
  useEffect(() => {
    let active = true;
    Promise.all([
      getStorefrontDiscovery().catch(() => emptyDiscovery),
      getStorefrontSiteNavigation().catch(() => null),
      getStorefrontAnnouncement().catch(() => null),
      getStorefrontBranding().catch(() => null)
    ]).then(([disc, nav, ann, brand]) => {
      if (!active) return;
      setDiscovery(disc);
      setSiteNavigation(nav);
      setAnnouncement(ann);
      setBranding(brand);
    });
    return () => {
      active = false;
    };
  }, []);

  // Update SEO
  useEffect(() => {
    const brandName = branding?.brandName || "Tech Media";
    const categoryTitle = filters.category ? `${filters.category} Products` : "Shop Products";
    const title = `${categoryTitle} | ${brandName} Tiruppur`;
    setStorefrontSeo({
      description: `Explore computers, laptops, smartphones, accessories, and IT infrastructure from ${brandName} in Tiruppur.`,
      path: window.location.pathname,
      title
    });
  }, [branding?.brandName, filters.category]);

  // Hook for products with pagination and active filters
  const { error, hasMore, loading, loadingMore, loadMore, products } = useStorefrontCatalog(filters);

  // Filter count badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.search) count++;
    if (filters.minPrice != null || filters.maxPrice != null) count++;
    if (filters.sort && filters.sort !== "featured") count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      brand: "",
      category: "",
      maxPrice: null,
      minPrice: null,
      scope: "all",
      search: "",
      sort: "featured"
    });
  };

  const handleCategorySelect = (categoryName: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === categoryName ? "" : categoryName
    }));
  };

  const handleBrandSelect = (brandName: string) => {
    setFilters((prev) => ({
      ...prev,
      brand: prev.brand === brandName ? "" : brandName
    }));
  };

  const pageTitle = filters.category
    ? filters.category
    : filters.search
      ? `Results for "${filters.search}"`
      : "Shop All Products";

  return (
    <div className="cx-store cx-shop-page-wrapper">
      <StoreHeader
        announcement={announcement}
        branding={branding}
        discovery={discovery}
        filters={filters}
      />

      <main className="cx-shop-main">
        <div className="cx-shop-container">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="cx-shop-breadcrumbs">
            <a href="/">Home</a>
            <ChevronRightIcon aria-hidden="true" />
            <a href="/shop">Shop</a>
            {filters.category ? (
              <>
                <ChevronRightIcon aria-hidden="true" />
                <span aria-current="page">{filters.category}</span>
              </>
            ) : null}
          </nav>

          {/* Page Banner & Headline */}
          <header className="cx-shop-header">
            <div className="cx-shop-header__top">
            <div className="cx-shop-header__content">
              <div className="cx-shop-header__badge-row">
                <span className="cx-shop-header__eyebrow">STOREFRONT CATALOG</span>
                <span className="cx-shop-header__count-badge">
                  {loading ? "Loading…" : `${products.length} Products`}
                </span>
              </div>
              <h1 className="cx-shop-header__title">{pageTitle}</h1>
              <p className="cx-shop-header__desc">
                {filters.category
                  ? `Browse genuine ${filters.category.toLowerCase()} with official manufacturer warranty, expert support, and fast delivery in Tiruppur.`
                  : "Discover our curated collection of verified computers, laptops, smartphones, audio gear, and office technology solutions."}
              </p>
            </div>
              <div className="cx-shop-header__art" aria-hidden="true">
                <LaptopIcon className="cx-shop-header__art-laptop" />
                <span className="cx-shop-header__art-chip"><CpuIcon /></span>
                <SparklesIcon className="cx-shop-header__art-sparkle" />
                <span className="cx-shop-header__art-caption">Expert-picked tech</span>
              </div>
            </div>

            {/* Quick Category Bar (Scrollable Pills on Top) */}
            <div className="cx-shop-cat-strip" aria-label="Category quick filter">
              <button
                className={`cx-shop-cat-pill${!filters.category ? " is-active" : ""}`}
                onClick={() => setFilters((prev) => ({ ...prev, category: "" }))}
                type="button"
              >
                All Categories
              </button>
              {discovery.categories.map((cat) => (
                <button
                  className={`cx-shop-cat-pill${filters.category === cat.name ? " is-active" : ""}`}
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  type="button"
                >
                  {cat.name}
                  {cat.productCount > 0 ? (
                    <span className="cx-shop-cat-pill__count">{cat.productCount}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </header>

          {/* Controls Bar: Mobile Filter Toggle, Active Chips, Sort Dropdown */}
          <div className="cx-shop-controls">
            <div className="cx-shop-controls__left">
              {/* Mobile Filter Trigger */}
              <button
                aria-label="Open filter sidebar"
                className="cx-shop-mobile-filter-btn"
                onClick={() => setMobileDrawerOpen(true)}
                type="button"
              >
                <SlidersHorizontalIcon aria-hidden="true" />
                <span>Filters</span>
                {activeFilterCount > 0 ? (
                  <span className="cx-shop-filter-badge">{activeFilterCount}</span>
                ) : null}
              </button>

              {/* Result Summary */}
              <span className="cx-shop-results-summary">
                {loading
                  ? "Searching catalog…"
                  : `Showing ${products.length} item${products.length === 1 ? "" : "s"}`}
              </span>
            </div>

            <div className="cx-shop-controls__right">
              {/* Search Within Catalog */}
              <div className="cx-shop-search-field">
                <SearchIcon aria-hidden="true" />
                <input
                  aria-label="Search within products"
                  placeholder="Search products, brands…"
                  type="search"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
                {filters.search ? (
                  <button
                    aria-label="Clear search"
                    className="cx-shop-search-clear"
                    onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                    type="button"
                  >
                    <XIcon aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              {/* Sort Dropdown */}
              <div className="cx-shop-sort-wrap">
                <label htmlFor="cx-shop-sort-select">Sort by:</label>
                <div className="cx-shop-select-box">
                  <select
                    id="cx-shop-sort-select"
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sort: e.target.value as StorefrontFilters["sort"]
                      }))
                    }
                  >
                    <option value="featured">Featured & Best Deals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Largest Savings (%)</option>
                    <option value="name">Product Name (A-Z)</option>
                  </select>
                  <ChevronDownIcon className="cx-shop-select-chevron" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 ? (
            <div className="cx-shop-active-filters" aria-label="Active filters">
              <span className="cx-shop-active-label">Active Filters:</span>

              {filters.category ? (
                <button
                  className="cx-shop-chip"
                  onClick={() => setFilters((prev) => ({ ...prev, category: "" }))}
                  type="button"
                >
                  Category: <strong>{filters.category}</strong>
                  <XIcon aria-hidden="true" />
                </button>
              ) : null}

              {filters.brand ? (
                <button
                  className="cx-shop-chip"
                  onClick={() => setFilters((prev) => ({ ...prev, brand: "" }))}
                  type="button"
                >
                  Brand: <strong>{filters.brand}</strong>
                  <XIcon aria-hidden="true" />
                </button>
              ) : null}

              {filters.search ? (
                <button
                  className="cx-shop-chip"
                  onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                  type="button"
                >
                  Keyword: <strong>"{filters.search}"</strong>
                  <XIcon aria-hidden="true" />
                </button>
              ) : null}

              {filters.minPrice != null || filters.maxPrice != null ? (
                <button
                  className="cx-shop-chip"
                  onClick={() => setFilters((prev) => ({ ...prev, minPrice: null, maxPrice: null }))}
                  type="button"
                >
                  Price:{" "}
                  <strong>
                    {filters.minPrice != null ? money(filters.minPrice) : "₹0"} -{" "}
                    {filters.maxPrice != null ? money(filters.maxPrice) : "Any"}
                  </strong>
                  <XIcon aria-hidden="true" />
                </button>
              ) : null}

              <button
                className="cx-shop-clear-all-btn"
                onClick={handleResetFilters}
                type="button"
              >
                Clear all filters
              </button>
            </div>
          ) : null}

          {/* Main 2-Column Catalog Layout */}
          <div className="cx-shop-layout">
            {/* Desktop Filter Sidebar */}
            <aside className="cx-shop-sidebar" aria-label="Product filters">
              <ShopFilterPanel
                discovery={discovery}
                filters={filters}
                onBrandSelect={handleBrandSelect}
                onCategorySelect={handleCategorySelect}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
              />
            </aside>

            {/* Mobile Filter Drawer Overlay */}
            {mobileDrawerOpen ? (
              <div className="cx-shop-drawer-backdrop" onClick={() => setMobileDrawerOpen(false)}>
                <div
                  aria-label="Filter products"
                  aria-modal="true"
                  className="cx-shop-drawer"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                >
                  <div className="cx-shop-drawer__header">
                    <div className="cx-shop-drawer__title">
                      <FilterIcon aria-hidden="true" />
                      <strong>Filters & Options</strong>
                    </div>
                    <button
                      aria-label="Close filters"
                      className="cx-shop-drawer__close-btn"
                      onClick={() => setMobileDrawerOpen(false)}
                      type="button"
                    >
                      <XIcon aria-hidden="true" />
                    </button>
                  </div>
                  <div className="cx-shop-drawer__body">
                    <ShopFilterPanel
                      discovery={discovery}
                      filters={filters}
                      onBrandSelect={handleBrandSelect}
                      onCategorySelect={handleCategorySelect}
                      onFiltersChange={setFilters}
                      onReset={handleResetFilters}
                    />
                  </div>
                  <div className="cx-shop-drawer__footer">
                    <button
                      className="cx-shop-drawer__reset-btn"
                      onClick={handleResetFilters}
                      type="button"
                    >
                      Reset All
                    </button>
                    <button
                      className="cx-shop-drawer__apply-btn"
                      onClick={() => setMobileDrawerOpen(false)}
                      type="button"
                    >
                      Show {products.length} Results
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Right Product Grid Area */}
            <div className="cx-shop-grid-area">
              {loading && products.length === 0 ? (
                <div className="cx-shop-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ShopProductSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="cx-shop-empty-state">
                  <div className="cx-shop-empty-state__icon">
                    <SearchIcon aria-hidden="true" />
                  </div>
                  <h3 className="cx-shop-empty-state__title">No matching products found</h3>
                  <p className="cx-shop-empty-state__desc">
                    We couldn't find any products matching your active filters. Try adjusting your search
                    keyword, category, or price range.
                  </p>
                  <button
                    className="cx-shop-empty-state__btn"
                    onClick={handleResetFilters}
                    type="button"
                  >
                    <RotateCcwIcon aria-hidden="true" />
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={`cx-shop-grid${products.length === 1 ? " cx-shop-grid--single" : ""}`}>
                    {products.map((item, index) => (
                      <ShopProductCard
                        eagerImage={index < 6}
                        key={item.slug}
                        product={item}
                      />
                    ))}
                  </div>

                  {hasMore ? (
                    <div className="cx-shop-load-more">
                      <button
                        className="cx-shop-load-more__button"
                        disabled={loadingMore || loading}
                        onClick={() => void loadMore()}
                        type="button"
                      >
                        {loadingMore ? (
                          <>
                            <span className="cx-shop-spinner" />
                            Loading more products…
                          </>
                        ) : (
                          <>
                            Load more products <ArrowRightIcon aria-hidden="true" />
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <BackToTopButton />
      <StoreFooter branding={branding} navigation={siteNavigation} />
    </div>
  );
}

/* ==========================================================================
   SIDEBAR FILTER PANEL
   ========================================================================== */

function ShopFilterPanel({
  discovery,
  filters,
  onBrandSelect,
  onCategorySelect,
  onFiltersChange,
  onReset
}: {
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
  onBrandSelect: (brand: string) => void;
  onCategorySelect: (cat: string) => void;
  onFiltersChange: React.Dispatch<React.SetStateAction<StorefrontFilters>>;
  onReset: () => void;
}) {
  const activePricePreset = useMemo(() => {
    return PRICE_PRESETS.find(
      (p) => p.min === filters.minPrice && p.max === filters.maxPrice
    );
  }, [filters.minPrice, filters.maxPrice]);

  return (
    <div className="cx-filter-card">
      {/* Header */}
      <div className="cx-filter-card__header">
        <div className="cx-filter-card__title-row">
          <FilterIcon aria-hidden="true" />
          <h3>Filter Products</h3>
        </div>
        <button
          className="cx-filter-card__reset-link"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>

      {/* Categories */}
      <div className="cx-filter-group">
        <h4 className="cx-filter-group__title">Categories</h4>
        <div className="cx-filter-group__list">
          <button
            className={`cx-filter-option${!filters.category ? " is-active" : ""}`}
            onClick={() => onFiltersChange((prev) => ({ ...prev, category: "" }))}
            type="button"
          >
            <span className="cx-filter-option__radio">
              {!filters.category ? <span className="cx-filter-option__dot" /> : null}
            </span>
            <span className="cx-filter-option__name">All Categories</span>
          </button>

          {discovery.categories.map((cat) => {
            const active = filters.category === cat.name;
            return (
              <button
                className={`cx-filter-option${active ? " is-active" : ""}`}
                key={cat.name}
                onClick={() => onCategorySelect(cat.name)}
                type="button"
              >
                <span className="cx-filter-option__radio">
                  {active ? <span className="cx-filter-option__dot" /> : null}
                </span>
                <span className="cx-filter-option__name">{cat.name}</span>
                {cat.productCount > 0 ? (
                  <span className="cx-filter-option__count">{cat.productCount}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      {discovery.brands.length > 0 ? (
        <div className="cx-filter-group">
          <h4 className="cx-filter-group__title">Brands</h4>
          <div className="cx-filter-group__list cx-filter-group__list--scrollable">
            {discovery.brands.map((brand) => {
              const active = filters.brand === brand.name;
              return (
                <button
                  className={`cx-filter-option${active ? " is-active" : ""}`}
                  key={brand.name}
                  onClick={() => onBrandSelect(brand.name)}
                  type="button"
                >
                  <span className={`cx-filter-option__checkbox${active ? " is-checked" : ""}`}>
                    {active ? <CheckIcon aria-hidden="true" /> : null}
                  </span>
                  <span className="cx-filter-option__name">{brand.name}</span>
                  {brand.productCount > 0 ? (
                    <span className="cx-filter-option__count">{brand.productCount}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Price Range */}
      <div className="cx-filter-group">
        <h4 className="cx-filter-group__title">Price Range</h4>

        {/* Quick Presets */}
        <div className="cx-filter-price-presets">
          {PRICE_PRESETS.map((preset) => {
            const isSelected = activePricePreset?.label === preset.label;
            return (
              <button
                className={`cx-filter-price-btn${isSelected ? " is-active" : ""}`}
                key={preset.label}
                onClick={() =>
                  onFiltersChange((prev) => ({
                    ...prev,
                    minPrice: preset.min,
                    maxPrice: preset.max
                  }))
                }
                type="button"
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Inputs */}
        <div className="cx-filter-price-inputs">
          <div className="cx-filter-input-wrap">
            <span className="cx-filter-curr">₹</span>
            <input
              aria-label="Minimum price"
              min={0}
              placeholder="Min"
              type="number"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                onFiltersChange((prev) => ({
                  ...prev,
                  minPrice: e.target.value ? Number(e.target.value) : null
                }))
              }
            />
          </div>
          <span className="cx-filter-dash">–</span>
          <div className="cx-filter-input-wrap">
            <span className="cx-filter-curr">₹</span>
            <input
              aria-label="Maximum price"
              min={0}
              placeholder="Max"
              type="number"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                onFiltersChange((prev) => ({
                  ...prev,
                  maxPrice: e.target.value ? Number(e.target.value) : null
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Special Deals Filter */}
      <div className="cx-filter-group">
        <h4 className="cx-filter-group__title">Offers & Deals</h4>
        <button
          className={`cx-filter-option${filters.sort === "discount" ? " is-active" : ""}`}
          onClick={() =>
            onFiltersChange((prev) => ({
              ...prev,
              sort: prev.sort === "discount" ? "featured" : "discount"
            }))
          }
          type="button"
        >
          <span className={`cx-filter-option__checkbox${filters.sort === "discount" ? " is-checked" : ""}`}>
            {filters.sort === "discount" ? <CheckIcon aria-hidden="true" /> : null}
          </span>
          <span className="cx-filter-option__name">On Sale & Discounted Items</span>
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   PRODUCT CARD COMPONENT (Clean, Symmetrical, Aligned)
   ========================================================================== */

type SpecEntry = {
  icon: ReactNode;
  text: string;
};

export function ShopProductCard({
  eagerImage = false,
  product
}: {
  eagerImage?: boolean;
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
    setTimeout(() => setAdded(false), 1800);
  };

  // Specs extracted cleanly for at most 2 short micro-chips
  const specs = useMemo<SpecEntry[]>(() => {
    const list: SpecEntry[] = [];
    if (product.bulletPoints && product.bulletPoints.length > 0) {
      for (const bp of product.bulletPoints.slice(0, 2)) {
        list.push({
          icon: pickCardSpecIcon(bp),
          text: cleanCardSpecText(bp)
        });
      }
      return list;
    }

    const textBlob = `${product.shortDescription || ""} ${product.subtitle || ""}`.trim();
    if (textBlob) {
      const parts = textBlob
        .split(/[,|•;]/)
        .map((p) => p.trim())
        .filter((p) => p.length > 2 && p.length < 24);

      for (const part of parts.slice(0, 2)) {
        list.push({
          icon: pickCardSpecIcon(part),
          text: cleanCardSpecText(part)
        });
      }
    }
    return list.slice(0, 2);
  }, [product]);

  const compare = product.compareAtPrice;
  const hasDiscount = Boolean(compare && compare > product.price);
  const discountPct = hasDiscount && compare ? Math.round(((compare - product.price) / compare) * 100) : 0;

  return (
    <article className="cx-shop-card">
      {/* Top Media Showcase */}
      <div className="cx-shop-card__media">
        {/* Floating Badges */}
        <div className="cx-shop-card__badges">
          {product.badge ? (
            <span className={`cx-shop-card__badge cx-shop-card__badge--${product.badge.type}`}>
              {product.badge.type === "bestseller" ? <StarIcon aria-hidden="true" /> : null}
              {product.badge.type === "limited" ? <TagIcon aria-hidden="true" /> : null}
              {product.badge.type === "new" ? <SparklesIcon aria-hidden="true" /> : null}
              <span>{product.badge.text}</span>
            </span>
          ) : hasDiscount && discountPct > 0 ? (
            <span className="cx-shop-card__badge cx-shop-card__badge--discount">
              <TagIcon aria-hidden="true" />
              <span>{discountPct}% OFF</span>
            </span>
          ) : <span />}

          <button
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`cx-shop-card__wishlist${wishlisted ? " is-active" : ""}`}
            onClick={handleToggleWishlist}
            type="button"
          >
            <HeartIcon aria-hidden="true" />
          </button>
        </div>

        {/* Product Image Link */}
        <a
          aria-label={`View ${product.name}`}
          className="cx-shop-card__img-link"
          href={`/shop/product/${product.slug}`}
        >
          <img
            alt={product.imageAlt || product.name}
            className="cx-shop-card__img"
            decoding="async"
            loading={eagerImage ? "eager" : "lazy"}
            src={product.imageUrl}
          />
        </a>
      </div>

      {/* Card Info & Content */}
      <div className="cx-shop-card__body">
        {/* Category & Brand Eyebrow */}
        <div className="cx-shop-card__meta">
          {[product.brand, product.category].filter(Boolean).join(" • ").toUpperCase()}
        </div>

        {/* Product Title (2-line clamped with uniform height) */}
        <h3 className="cx-shop-card__title">
          <a href={`/shop/product/${product.slug}`}>{product.name}</a>
        </h3>

        {/* Horizontal Spec Micro-Pills (Never squished) */}
        <div className="cx-shop-card__specs-row">
          {specs.length > 0 ? (
            specs.map((spec, i) => (
              <span className="cx-shop-card__spec-pill" key={i} title={spec.text}>
                {spec.icon}
                <span>{spec.text}</span>
              </span>
            ))
          ) : (
            <span className="cx-shop-card__spec-pill cx-shop-card__spec-pill--fallback">
              <SparklesIcon aria-hidden="true" />
              <span>Verified Hardware</span>
            </span>
          )}
        </div>

        {/* Price & Savings Row */}
        <div className="cx-shop-card__price-row">
          <div className="cx-shop-card__price-box">
            <span className="cx-shop-card__price">{money(product.price)}</span>
            {hasDiscount && compare ? (
              <del className="cx-shop-card__compare-price">{money(compare)}</del>
            ) : null}
          </div>
          {hasDiscount && discountPct > 0 ? (
            <span className="cx-shop-card__save-badge">{discountPct}% OFF</span>
          ) : null}
        </div>

        {/* Symmetrical Action Buttons (Locked to bottom) */}
        <div className="cx-shop-card__actions">
          <button
            className={`cx-shop-card__btn-cart${added ? " is-added" : ""}`}
            onClick={handleAddToCart}
            type="button"
          >
            {added ? (
              <>
                <CheckIcon aria-hidden="true" /> Added!
              </>
            ) : (
              <>
                <ShoppingCartIcon aria-hidden="true" /> Add to Cart
              </>
            )}
          </button>

          <a
            className="cx-shop-card__btn-details"
            href={`/shop/product/${product.slug}`}
          >
            <span>View Details</span>
            <ArrowRightIcon aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

/* ==========================================================================
   LOADING SKELETON COMPONENT
   ========================================================================== */

function ShopProductSkeleton() {
  return (
    <div className="cx-shop-card cx-shop-card--skeleton" aria-hidden="true">
      <div className="cx-shop-skeleton__image" />
      <div className="cx-shop-card__body">
        <div className="cx-shop-skeleton__line cx-shop-skeleton__line--short" />
        <div className="cx-shop-skeleton__line cx-shop-skeleton__line--title" />
        <div className="cx-shop-skeleton__line cx-shop-skeleton__line--title" />
        <div className="cx-shop-skeleton__pills">
          <div className="cx-shop-skeleton__pill" />
          <div className="cx-shop-skeleton__pill" />
        </div>
        <div className="cx-shop-skeleton__line cx-shop-skeleton__line--price" />
        <div className="cx-shop-skeleton__actions">
          <div className="cx-shop-skeleton__btn" />
          <div className="cx-shop-skeleton__btn" />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */

function pickCardSpecIcon(text: string): ReactNode {
  const norm = text.toLowerCase();
  if (norm.includes("oled") || norm.includes("display") || norm.includes("screen") || norm.includes("4k") || norm.includes("hdr")) {
    return <TvIcon aria-hidden="true" />;
  }
  if (norm.includes("core") || norm.includes("intel") || norm.includes("ryzen") || norm.includes("m3") || norm.includes("cpu") || norm.includes("rtx")) {
    return <CpuIcon aria-hidden="true" />;
  }
  if (norm.includes("ram") || norm.includes("memory") || norm.includes("unified")) {
    return <LayersIcon aria-hidden="true" />;
  }
  if (norm.includes("ssd") || norm.includes("storage") || norm.includes("1tb") || norm.includes("512gb")) {
    return <HardDriveIcon aria-hidden="true" />;
  }
  if (norm.includes("battery") || norm.includes("hrs") || norm.includes("mah")) {
    return <BatteryChargingIcon aria-hidden="true" />;
  }
  if (norm.includes("mouse") || norm.includes("dpi") || norm.includes("sensor")) {
    return <MouseIcon aria-hidden="true" />;
  }
  if (norm.includes("sound") || norm.includes("audio") || norm.includes("speaker") || norm.includes("anc")) {
    return <Volume2Icon aria-hidden="true" />;
  }
  if (norm.includes("port") || norm.includes("usb") || norm.includes("thunderbolt")) {
    return <CableIcon aria-hidden="true" />;
  }
  return <SparklesIcon aria-hidden="true" />;
}

function cleanCardSpecText(text: string): string {
  const cleaned = text
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length > 24) {
    const parts = cleaned.split(/[,(]/);
    if (parts[0] && parts[0].trim().length > 3 && parts[0].trim().length <= 24) {
      return parts[0].trim();
    }
    return cleaned.slice(0, 22) + "…";
  }
  return cleaned;
}
