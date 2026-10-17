import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, SearchIcon, TagIcon, XIcon, ArrowRightIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@cxsun/ui/components/dropdown-menu";
import { listStorefrontCategories, listStorefrontProducts } from "./storefront.services";
import type {
  StorefrontCategory,
  StorefrontDiscovery,
  StorefrontFilters,
  StorefrontProduct,
  StorefrontSearchScope
} from "./storefront.types";
import type { StorefrontBranding } from "./storefront.types";

const scopes: Array<{
  label: string;
  value: StorefrontSearchScope;
}> = [
  { label: "Everything", value: "all" },
  { label: "Products", value: "products" },
  { label: "Brands", value: "brands" },
  { label: "Categories", value: "categories" }
];

const DEFAULT_POPULAR_SEARCHES = [
  "A4 Paper",
  "Access Point",
  "Adaptor",
  "Air Cooler",
  "Anti Virus",
  "Barcode Labels",
  "Acer",
  "ASUS",
  "Dell",
  "HP"
];

export function StorefrontSearch({
  branding,
  discovery,
  filters
}: {
  branding: StorefrontBranding | null;
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(filters.search);
  const [scope, setScope] = useState(filters.scope);
  const [results, setResults] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [extraCategories, setExtraCategories] = useState<StorefrontCategory[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fetch backend categories and backend product images to associate with categories
  useEffect(() => {
    listStorefrontCategories()
      .then((cats) => {
        if (cats && cats.length) setExtraCategories(cats);
      })
      .catch(() => {});

    listStorefrontProducts(
      {
        brand: "",
        category: "",
        maxPrice: null,
        minPrice: null,
        scope: "all",
        search: "",
        sort: "featured"
      },
      { limit: 80, offset: 0 }
    )
      .then((products) => {
        const map: Record<string, string> = {};
        for (const p of products) {
          const catKey = (p.category || "").trim().toLowerCase();
          if (catKey && p.imageUrl && !map[catKey]) {
            map[catKey] = p.imageUrl;
          }
        }
        setCategoryImages(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer);
    };
  }, [open]);

  // Query Backend API dynamically when search query is entered
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(() => {
      listStorefrontProducts({ ...filters, search: query.trim(), scope })
        .then((items) => setResults(items.slice(0, 8)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [filters, open, query, scope]);

  // Real backend categories from discovery or extraCategories
  const displayCategories = useMemo(() => {
    const source = discovery?.categories?.length ? discovery.categories : extraCategories;
    return source.slice(0, 12);
  }, [discovery, extraCategories]);

  // Combine backend API data (brands + categories) dynamically
  const popularSearches = useMemo(() => {
    const backendItems: string[] = [];
    if (discovery?.categories?.length) {
      discovery.categories.forEach((cat) => {
        if (cat.name?.trim()) backendItems.push(cat.name.trim());
      });
    } else if (extraCategories.length) {
      extraCategories.forEach((cat) => {
        if (cat.name?.trim()) backendItems.push(cat.name.trim());
      });
    }
    if (discovery?.brands?.length) {
      discovery.brands.forEach((brand) => {
        if (brand.name?.trim()) backendItems.push(brand.name.trim());
      });
    }
    if (backendItems.length > 0) {
      return [...new Set(backendItems)].slice(0, 12);
    }
    return DEFAULT_POPULAR_SEARCHES;
  }, [discovery, extraCategories]);

  // Filter backend matches for instant autocomplete
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    const sourceCategories = discovery?.categories?.length ? discovery.categories : extraCategories;
    const catMatches = (sourceCategories ?? [])
      .filter((item) => item.name.toLowerCase().includes(normalized))
      .map((item) => ({ kind: "Category", name: item.name }));
    const brandMatches = (discovery?.brands ?? [])
      .filter((item) => item.name.toLowerCase().includes(normalized))
      .map((item) => ({ kind: "Brand", name: item.name }));
    return [...catMatches, ...brandMatches].slice(0, 5);
  }, [discovery, extraCategories, query]);

  const submit = (term?: string) => {
    const value = (term ?? query).trim();
    if (!value) return;
    window.location.assign(
      `/search?q=${encodeURIComponent(value)}&scope=${encodeURIComponent(scope)}`
    );
  };

  const handleSelectPill = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleSelectCategory = (catName: string) => {
    setOpen(false);
    window.location.assign(`/shop/category/${encodeURIComponent(catName)}`);
  };

  return (
    <>
      {/* Top Header Inline Bar */}
      <div className="cx-store-search__bar">
        <button
          aria-label="Search catalog"
          className="cx-store-search__open"
          onClick={() => setOpen(true)}
          type="button"
        >
          <div className="cx-store-search__leading">
            <SearchIcon className="cx-store-search__icon" aria-hidden="true" />
            <span className="cx-store-search__placeholder">
              {query || "Find the right product for you"}
            </span>
          </div>

          <div className="cx-store-search__trailing">
            <kbd className="cx-store-search__kbd">Ctrl K</kbd>
            <span className="cx-store-search__action-btn" aria-hidden="true">
              Search
            </span>
          </div>
        </button>
      </div>

      {/* Redesigned Search Overlay Modal */}
      {open ? (
        <div
          aria-label="Catalog search"
          aria-modal="true"
          className="cx-store-search-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
        >
          <div className="cx-store-search-modal">
            {/* Mobile Drag Indicator Bar */}
            <div className="cx-store-search-modal__handle" aria-hidden="true" />

            {/* Input Row Header */}
            <div className="cx-store-search-modal__input-bar">
              <SearchIcon className="cx-store-search-modal__search-icon" aria-hidden="true" />
              <input
                aria-label="Search catalog"
                className="cx-store-search-modal__input"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submit()}
                placeholder="What can we help you find?"
                ref={inputRef}
                value={query}
              />

              <div className="cx-store-search-modal__controls">
                <ScopeMenu scope={scope} onScope={setScope} />
                <button
                  aria-label="Close search"
                  className="cx-store-search-modal__close"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <XIcon />
                </button>
              </div>
            </div>

            {/* Body: Default Views (Popular Searches + Trending Categories) OR Query Results */}
            <div className="cx-store-search-modal__content">
              {!query.trim() ? (
                <>
                  {/* POPULAR SEARCHES SECTION */}
                  <div className="cx-store-search-section">
                    <h3 className="cx-store-search-section__title">POPULAR SEARCHES</h3>
                    <div className="cx-store-search-pills">
                      {popularSearches.map((term) => (
                        <button
                          className="cx-store-search-pill"
                          key={term}
                          onClick={() => handleSelectPill(term)}
                          type="button"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TRENDING CATEGORIES SECTION */}
                  {displayCategories.length > 0 ? (
                    <div className="cx-store-search-section">
                      <h3 className="cx-store-search-section__title">TRENDING CATEGORIES</h3>
                      <div className="cx-store-search-categories-grid">
                        {displayCategories.map((cat) => {
                          const catKey = (cat.name || "").trim().toLowerCase();
                          const imageSrc = cat.imageUrl || categoryImages[catKey];
                          return (
                            <button
                              className="cx-store-search-category-card"
                              key={cat.name}
                              onClick={() => handleSelectCategory(cat.name)}
                              type="button"
                            >
                              <div className="cx-store-search-category-icon">
                                {imageSrc ? (
                                  <img
                                    alt={cat.name}
                                    className="cx-store-search-category-img"
                                    loading="lazy"
                                    src={imageSrc}
                                  />
                                ) : (
                                  <CategoryGraphic type={cat.name} />
                                )}
                              </div>
                              <div className="cx-store-search-category-info">
                                <strong className="cx-store-search-category-name">{cat.name}</strong>
                                <span className="cx-store-search-category-sub">
                                  {cat.productCount > 0
                                    ? `${cat.productCount} ${cat.productCount === 1 ? "product" : "products"}`
                                    : "Explore"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                /* LIVE QUERY RESULTS FROM BACKEND API */
                <div className="cx-store-search-results">
                  {loading ? (
                    <div className="cx-store-search-results__loading">
                      <div className="cx-store-search-spinner" />
                      <span>Searching backend catalog for &ldquo;{query}&rdquo;…</span>
                    </div>
                  ) : (
                    <>
                      {/* Backend Category/Brand Matches */}
                      {suggestions.length ? (
                        <div className="cx-store-search-results__matches">
                          <h4>Matching Categories & Brands</h4>
                          <div className="cx-store-search-pills">
                            {suggestions.map((item) => (
                              <button
                                className="cx-store-search-pill cx-store-search-pill--match"
                                key={`${item.kind}-${item.name}`}
                                onClick={() => handleSelectPill(item.name)}
                                type="button"
                              >
                                <TagIcon className="h-3 w-3" />
                                <span>{item.name}</span>
                                <small>({item.kind})</small>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Products List from Backend API */}
                      <div className="cx-store-search-results__products">
                        <h4>Products ({results.length})</h4>
                        {results.length ? (
                          <div className="cx-store-search-product-grid">
                            {results.map((product) => (
                              <a
                                className="cx-store-search-product-card"
                                href={`/shop/product/${product.slug}`}
                                key={product.slug}
                                onClick={() => setOpen(false)}
                              >
                                {product.imageUrl ? (
                                  <img alt="" src={product.imageUrl} />
                                ) : (
                                  <div className="cx-store-search-product-card__placeholder">
                                    <SearchIcon />
                                  </div>
                                )}
                                <div className="cx-store-search-product-card__details">
                                  <strong>{product.name}</strong>
                                  <small>{product.brand || product.category || "Catalog"}</small>
                                </div>
                                <ArrowRightIcon className="cx-store-search-product-card__arrow" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="cx-store-search-empty">
                            <p>No products found for &ldquo;{query}&rdquo;.</p>
                            <button
                              className="cx-store-search-empty__btn"
                              onClick={() => submit()}
                              type="button"
                            >
                              Search all catalog
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ScopeMenu({
  scope,
  onScope
}: {
  scope: StorefrontSearchScope;
  onScope: (scope: StorefrontSearchScope) => void;
}) {
  const active = scopes.find((item) => item.value === scope) ?? scopes[0]!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cx-store-search__scope" type="button">
        <span>{active.label}</span>
        <ChevronDownIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="cx-store-search__scope-menu">
        {scopes.map((item) => (
          <DropdownMenuItem key={item.value} onClick={() => onScope(item.value)}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* Crisp Category Visual Graphics matching category name */
function CategoryGraphic({ type }: { type: string }) {
  const norm = (type || "").toLowerCase().trim();
  if (
    norm.includes("laptop") ||
    norm.includes("computer") ||
    norm.includes("pc") ||
    norm.includes("macbook")
  ) {
    return (
      <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="10" width="32" height="22" rx="2" fill="#1e293b" />
        <rect x="10" y="12" width="28" height="18" rx="1" fill="#38bdf8" />
        <path d="M4 35h40a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#94a3b8" />
        <rect x="20" y="32" width="8" height="1.5" rx="0.75" fill="#e2e8f0" />
      </svg>
    );
  }
  if (
    norm.includes("audio") ||
    norm.includes("headphone") ||
    norm.includes("earphone") ||
    norm.includes("sound") ||
    norm.includes("speaker")
  ) {
    return (
      <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
        <path
          d="M12 26V20a12 12 0 0 1 24 0v6"
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="8" y="24" width="8" height="14" rx="4" fill="#0284c7" />
        <rect x="32" y="24" width="8" height="14" rx="4" fill="#0284c7" />
      </svg>
    );
  }
  if (
    norm.includes("monitor") ||
    norm.includes("display") ||
    norm.includes("screen") ||
    norm.includes("tv")
  ) {
    return (
      <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="8" width="36" height="24" rx="2" fill="#1e293b" />
        <rect x="8" y="10" width="32" height="20" rx="1" fill="#0284c7" />
        <path d="M22 32h4v7h-4z" fill="#64748b" />
        <path d="M16 39h16v2H16z" fill="#475467" />
      </svg>
    );
  }
  if (
    norm.includes("phone") ||
    norm.includes("mobile") ||
    norm.includes("smart")
  ) {
    return (
      <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
        <rect x="14" y="6" width="20" height="36" rx="4" fill="#1e293b" />
        <rect x="16" y="9" width="16" height="28" rx="2" fill="#38bdf8" />
        <circle cx="24" cy="40" r="1.5" fill="#cbd5e1" />
      </svg>
    );
  }
  if (norm.includes("print") || norm.includes("scan")) {
    return (
      <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="6" width="24" height="12" rx="1" fill="#94a3b8" />
        <path
          d="M8 18h32a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V21a3 3 0 0 1 3-3z"
          fill="#334155"
        />
        <rect x="12" y="28" width="24" height="14" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="37" cy="22" r="1.5" fill="#22c55e" />
      </svg>
    );
  }
  if (norm.includes("network") || norm.includes("wifi") || norm.includes("router")) {
    return (
      <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
        <path d="M11 8v16M37 8v16" stroke="#475467" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="6" y="24" width="36" height="14" rx="3" fill="#1e293b" />
        <circle cx="14" cy="31" r="1.5" fill="#38bdf8" />
        <circle cx="20" cy="31" r="1.5" fill="#38bdf8" />
        <circle cx="26" cy="31" r="1.5" fill="#22c55e" />
        <circle cx="32" cy="31" r="1.5" fill="#eab308" />
      </svg>
    );
  }
  if (
    norm.includes("accessor") ||
    norm.includes("mouse") ||
    norm.includes("keyboard") ||
    norm.includes("cable")
  ) {
    return (
      <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
        <rect x="14" y="8" width="20" height="32" rx="10" fill="#1e293b" />
        <path d="M24 8v12M14 20h20" stroke="#475467" strokeWidth="1" />
        <rect x="22.5" y="12" width="3" height="6" rx="1.5" fill="#cbd5e1" />
      </svg>
    );
  }
  if (norm.includes("soft") || norm.includes("app") || norm.includes("license")) {
    return (
      <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
        <path d="M12 9l20-3 6 4v26l-6 4-20-3V9z" fill="#0284c7" />
        <path d="M12 9l20-3v31l-20 3V9z" fill="#0369a1" />
        <circle cx="22" cy="24" r="6" fill="#e0f2fe" opacity="0.9" />
        <circle cx="22" cy="24" r="2.5" fill="#0369a1" />
      </svg>
    );
  }
  return (
    <svg className="cx-cat-icon" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="8" width="32" height="32" rx="6" fill="#1e293b" />
      <circle cx="24" cy="24" r="7" fill="#38bdf8" />
      <circle cx="24" cy="24" r="3" fill="#0f172a" />
    </svg>
  );
}
