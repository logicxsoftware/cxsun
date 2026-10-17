import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  HeadphonesIcon,
  MessageCircleIcon,
  PackageCheckIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  ZapIcon
} from "lucide-react";
import {
  getStorefrontAnnouncement,
  getStorefrontBootstrap,
  getStorefrontBranding,
  getStorefrontDiscovery,
  getStorefrontProduct,
  getStorefrontSiteNavigation,
  getStorefrontSliders,
  getStorefrontPromotions,
  getStorefrontFeaturedCards,
  listLatestBlogPosts,
  listStorefrontProducts
} from "./storefront.services";
import {
  BackToTopButton,
  CatalogFilters,
  CollectionFilter,
  ProductCard,
  StoreFooter
} from "./storefront.components1";
import {
  PopularPicksCard,
  PopularPicksSection,
  ShopByCategoryBar
} from "./storefront.popular-picks1";
import { StorefrontHomeSections } from "./storefront.home-sections1";
import { CampaignsCollection, resolveStorefrontCampaigns } from "./storefront.campaigns1";
import { StoreHeader } from "./storefront.navigation1";
import type {
  StorefrontAnnouncement,
  StorefrontBranding,
  StorefrontDiscovery,
  StorefrontFilters,
  StorefrontProduct,
  StorefrontProductDetail,
  StorefrontBlogPost,
  StorefrontSiteNavigation,
  StorefrontSlider,
  StorefrontPromotion
} from "./storefront.types";
import type { StorefrontFeaturedCard } from "./storefront.types";
import {
  hasStorefrontPrice,
  money,
  responsiveImageSrcSet,
  whatsappLink
} from "./storefront.formatters";
import "./storefront.css";
import "./storefront.navigation1.css";
import "./storefront.home-redesign1.css";
import "./storefront.hero1.css";
import "./storefront.promotions1.css";
import "./storefront.collection-redesign1.css";
import "./storefront.responsive1.css";
import "./storefront.product-detail1.css";
import "./storefront.offer-layout.css";
import "./storefront.popular-picks1.css";
import "./storefront.home-layout.css";
import { PikoStoreAssistant } from "./storefront.assistant";
import { addStorefrontCartItem } from "./storefront.cart";
import { createProductStructuredData, setStorefrontSeo } from "./storefront.seo";
import { observeStorefrontVitals } from "./storefront.performance";
import { StorefrontCartPage } from "./storefront.cart.page";
import { useStorefrontCatalog } from "./storefront.catalog";

import { ShopCatalogPage } from "./storefront.shop-page1";

const emptyDiscovery: StorefrontDiscovery = {
  brands: [],
  categories: [],
  priceRange: { maximum: 0, minimum: 0 }
};

export function StorefrontPage() {
  useEffect(() => observeStorefrontVitals(), []);
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const queryCategory = searchParams.get("category") ?? "";

  const productSlug = path.startsWith("/shop/product/")
    ? decodeURIComponent(path.slice(14))
    : path.startsWith("/product/")
      ? decodeURIComponent(path.slice(9))
      : "";

  const pathCategory = path.startsWith("/shop/category/")
    ? decodeURIComponent(path.slice(15))
    : path.startsWith("/category/")
      ? decodeURIComponent(path.slice(10))
      : "";

  const category = pathCategory || queryCategory;

  // Home route explicitly matching /, "", or /home
  const isHomeRoute = path === "/" || path === "" || path === "/home";

  // Shop catalog route matching /shop, /products, /catalog, /search, or filtered queries
  const isShopCatalogRoute =
    !isHomeRoute &&
    (path === "/shop" ||
      path === "/products" ||
      path === "/catalog" ||
      path === "/search" ||
      Boolean(pathCategory) ||
      Boolean(queryCategory) ||
      Boolean(searchParams.get("q")) ||
      Boolean(searchParams.get("brand")));

  const page = productSlug ? (
    <ProductPage slug={productSlug} />
  ) : path === "/cart" ? (
    <StorefrontCartPage />
  ) : path === "/campaigns" ? (
    <CampaignsPage />
  ) : isShopCatalogRoute ? (
    <ShopCatalogPage initialCategory={category} />
  ) : (
    // Default fallback to Home Landing Page (Hero showcase, Category bar, Popular picks)
    <CatalogPage category="" />
  );
  return (
    <>
      {page}
      <PikoStoreAssistant />
    </>
  );
}

function CampaignsPage() {
  const [campaignEvents, setCampaignEvents] = useState<StorefrontPromotion[]>([]);
  const [campaigns, setCampaigns] = useState<StorefrontPromotion[]>([]);
  const [campaignCards, setCampaignCards] = useState<StorefrontFeaturedCard[]>([]);
  const [campaignSlides, setCampaignSlides] = useState<StorefrontSlider[]>([]);
  const [discovery, setDiscovery] = useState<StorefrontDiscovery>(emptyDiscovery);
  const [siteNavigation, setSiteNavigation] = useState<StorefrontSiteNavigation | null>(null);
  const [announcement, setAnnouncement] = useState<StorefrontAnnouncement | null>(null);
  const [branding, setBranding] = useState<StorefrontBranding | null>(null);

  useEffect(() => {
    void loadOptional(
      getStorefrontBootstrap().then((value) => value.campaignEvents),
      setCampaignEvents
    );
    void loadOptional(getStorefrontPromotions(), setCampaigns);
    void loadOptional(getStorefrontFeaturedCards(), setCampaignCards);
    void loadOptional(getStorefrontSliders(), setCampaignSlides);
    void loadOptional(getStorefrontDiscovery(), setDiscovery);
    void loadOptional(getStorefrontSiteNavigation(), setSiteNavigation);
    void loadOptional(getStorefrontAnnouncement(), setAnnouncement);
    void loadOptional(getStorefrontBranding(), setBranding);
  }, []);
  useEffect(() => {
    setStorefrontSeo({
      description:
        "Explore active Tech Media campaigns, events, launches, seasonal offers, and customer programmes in Tiruppur.",
      path: "/campaigns",
      title: `Campaigns and Events | ${branding?.brandName || "Tech Media"}`
    });
  }, [branding?.brandName]);

  return (
    <div className="cx-store">
      <StoreHeader
        announcement={announcement}
        branding={branding}
        discovery={discovery}
        filters={defaultFilters("", "")}
      />
      <CampaignsCollection
        campaigns={
          campaignEvents.length
            ? campaignEvents
            : resolveStorefrontCampaigns(campaigns, campaignCards, campaignSlides)
        }
      />
      <BackToTopButton />
      <StoreFooter branding={branding} navigation={siteNavigation} />
    </div>
  );
}

function CatalogPage({ category, searchPage = false }: { category: string; searchPage?: boolean }) {
  const initialSearch = new URLSearchParams(window.location.search).get("q") ?? "";
  const initialScope = searchScope();
  const [discovery, setDiscovery] = useState<StorefrontDiscovery>(emptyDiscovery);
  const [filters, setFilters] = useState<StorefrontFilters>({
    ...defaultFilters(category, searchPage ? initialSearch : ""),
    scope: searchPage ? initialScope : "all"
  });
  const [loadMoreMarker, setLoadMoreMarker] = useState<HTMLDivElement | null>(null);
  const [blogPosts, setBlogPosts] = useState<StorefrontBlogPost[]>([]);
  const [siteNavigation, setSiteNavigation] = useState<StorefrontSiteNavigation | null>(null);
  const [announcement, setAnnouncement] = useState<StorefrontAnnouncement | null>(null);
  const [branding, setBranding] = useState<StorefrontBranding | null>(null);
  const [slides, setSlides] = useState<StorefrontSlider[]>([]);
  const [promotions, setPromotions] = useState<StorefrontPromotion[]>([]);
  const [featuredCards, setFeaturedCards] = useState<StorefrontFeaturedCard[]>([]);
  const [brandStrips, setBrandStrips] = useState<StorefrontDiscovery["brands"]>([]);
  const [seasonStrips, setSeasonStrips] = useState<StorefrontPromotion[]>([]);
  const [campaignEvents, setCampaignEvents] = useState<StorefrontPromotion[]>([]);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    let active = true;
    void loadCatalogPageContent(searchPage).then((content) => {
      if (!active) return;
      setDiscovery(content.discovery);
      setSiteNavigation(content.siteNavigation);
      setAnnouncement(content.announcement);
      setBranding(content.branding);
      setSlides(content.slides);
      setPromotions(content.promotions);
      setFeaturedCards(content.featuredCards);
      setBrandStrips(content.brandStrips);
      setSeasonStrips(content.seasonStrips);
      setCampaignEvents(content.campaignEvents);
      setBlogPosts(content.blogPosts);
      setContentReady(true);
    });
    return () => {
      active = false;
    };
  }, [searchPage]);
  useEffect(() => {
    if (!branding?.brandName) return;
    setStorefrontSeo({
      description:
        "Tech Media provides computers, laptops, networking, IT infrastructure, business technology, and dependable service in Tiruppur.",
      path: searchPage ? "/search" : window.location.pathname,
      ...(searchPage ? { robots: "noindex,follow" } : {}),
      title: category
        ? `${category} Products in Tiruppur | ${branding.brandName}`
        : `${branding.brandName} | Computers and IT Solutions in Tiruppur`
    });
  }, [branding?.brandName, category, searchPage]);
  const { error, hasMore, loading, loadingMore, loadMore, products } =
    useStorefrontCatalog(filters);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [featuredPageSize, setFeaturedPageSize] = useState(() =>
    window.matchMedia("(max-width: 768px)").matches
      ? 3
      : window.matchMedia("(max-width: 1140px)").matches
        ? 2
        : 4
  );
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)");
    const tablet = window.matchMedia("(max-width: 1140px)");
    const updatePageSize = () => setFeaturedPageSize(mobile.matches ? 3 : tablet.matches ? 2 : 4);
    mobile.addEventListener("change", updatePageSize);
    tablet.addEventListener("change", updatePageSize);
    return () => {
      mobile.removeEventListener("change", updatePageSize);
      tablet.removeEventListener("change", updatePageSize);
    };
  }, []);
  useEffect(() => {
    setFeaturedPage(0);
  }, [featuredPageSize]);
  useEffect(() => {
    setFeaturedPage(0);
  }, [filters.category, filters.sort]);
  const featuredPageCount = Math.max(1, Math.ceil(products.length / featuredPageSize));
  const featuredProducts = products.slice(
    featuredPage * featuredPageSize,
    (featuredPage + 1) * featuredPageSize
  );
  useEffect(() => {
    if (featuredPage >= featuredPageCount) setFeaturedPage(Math.max(0, featuredPageCount - 1));
  }, [featuredPage, featuredPageCount]);
  const paginationStart = Math.max(0, Math.min(featuredPage - 2, featuredPageCount - 5));
  const paginationPages = Array.from(
    { length: Math.min(featuredPageCount, 5) },
    (_, index) => paginationStart + index
  );
  const goToFeaturedPage = (page: number) => {
    if (page < 0 || loadingMore) return;
    if (page < featuredPageCount) {
      setFeaturedPage(page);
      return;
    }
    if (page === featuredPageCount && hasMore) {
      void loadMore().then(() => setFeaturedPage(page));
    }
  };
  useEffect(() => {
    if (!loadMoreMarker || !hasMore || loading) return;
    const rootMargin = `${catalogPreloadDistance(loadMoreMarker)}px 0px`;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin }
    );
    observer.observe(loadMoreMarker);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loadMoreMarker, loading]);

  const catalogSection = (
    <section
      className={`cx-store__catalog${searchPage ? "" : " cx-store__catalog--redesign"}`}
      id="catalog"
    >
      {!searchPage ? (
        <div className="cx-catalog-redesign-container">
          {/* 1. Shop by Category (First Image style) */}
          <ShopByCategoryBar
            categories={discovery.categories}
            filters={filters}
            onFilters={setFilters}
          />

          {/* 2. Popular Products (Paged product cards) */}
          <PopularPicksSection
            currentPage={featuredPage}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onNextPage={() => goToFeaturedPage(featuredPage + 1)}
            onPrevPage={() => goToFeaturedPage(featuredPage - 1)}
            products={featuredProducts}
            totalPages={featuredPageCount}
          />
        </div>
      ) : (
        <>
          <div className="cx-store__section-title">
            <div>
              <span>Search and filter</span>
              <h2>{loading ? "Loading products…" : "Find products that match what you need"}</h2>
            </div>
            <button onClick={() => setFilters(defaultFilters("", ""))}>Clear all</button>
          </div>
          <div className="cx-store__catalog-layout">
            <CatalogFilters discovery={discovery} filters={filters} onFilters={setFilters} />
            <div>
              <div className="cx-store__grid">
                {loading ? <ProductSkeletons count={8} /> : null}
                {products.map((item, index) => (
                  <PopularPicksCard
                    eagerImage={index < 4}
                    index={index}
                    key={item.slug}
                    product={item}
                  />
                ))}
                {loadingMore ? <ProductSkeletons count={4} /> : null}
              </div>
              <div ref={setLoadMoreMarker} className="cx-store__load-marker" aria-hidden="true" />
              {!loading && products.length === 0 ? (
                <p className="cx-store__empty">{error || "No products match this selection."}</p>
              ) : null}
            </div>
          </div>
        </>
      )}
    </section>
  );

  if (!contentReady) {
    return <div className="cx-store cx-store--initializing" aria-busy="true" />;
  }

  return (
    <div className="cx-store">
      <StoreHeader
        announcement={announcement}
        branding={branding}
        discovery={discovery}
        filters={filters}
      />
      <main className={searchPage ? "cx-store__search-main" : "cx-store__home-main"}>
        {searchPage ? (
          catalogSection
        ) : (
          <StorefrontHomeSections
            blogPosts={blogPosts}
            brandName={branding?.brandName}
            brands={discovery.brands}
            brandStrips={brandStrips}
            campaignEvents={campaignEvents}
            catalog={catalogSection}
            discovery={discovery}
            featuredCards={featuredCards}
            promotions={promotions}
            seasonStrips={seasonStrips}
            siteNavigation={siteNavigation}
            slides={slides}
          />
        )}
      </main>
      <BackToTopButton />
      <StoreFooter branding={branding} navigation={siteNavigation} />
    </div>
  );
}

function catalogPreloadDistance(marker: HTMLDivElement) {
  const grid = marker.previousElementSibling;
  const card = grid?.firstElementChild;
  if (!(grid instanceof HTMLElement) || !(card instanceof HTMLElement)) return 1000;
  const rowGap = Number.parseFloat(window.getComputedStyle(grid).rowGap) || 0;
  return Math.max(800, Math.ceil((card.getBoundingClientRect().height + rowGap) * 2));
}

function ProductSkeletons({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <div className="cx-product-skeleton" key={index} aria-hidden="true">
      <div className="cx-product-skeleton__image" />
      <div className="cx-product-skeleton__line cx-product-skeleton__line--short" />
      <div className="cx-product-skeleton__line" />
      <div className="cx-product-skeleton__line" />
    </div>
  ));
}

function ProductPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<StorefrontProductDetail | null>(null);
  const [similarProducts, setSimilarProducts] = useState<StorefrontProduct[]>([]);
  const [discovery, setDiscovery] = useState<StorefrontDiscovery>(emptyDiscovery);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeDetailTab, setActiveDetailTab] = useState("overview");
  const [error, setError] = useState("");
  const [siteNavigation, setSiteNavigation] = useState<StorefrontSiteNavigation | null>(null);
  const [announcement, setAnnouncement] = useState<StorefrontAnnouncement | null>(null);
  const [branding, setBranding] = useState<StorefrontBranding | null>(null);
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    setActiveImageIndex(0);
    setActiveDetailTab("overview");
    Promise.all([getStorefrontProduct(slug), getStorefrontDiscovery()])
      .then(async ([item, data]) => {
        setProduct(item);
        setDiscovery(data);
        const related = await listStorefrontProducts(defaultFilters(item.category, ""));
        setSimilarProducts(related.filter((candidate) => candidate.slug !== item.slug).slice(0, 4));
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Product unavailable")
      );
  }, [slug]);
  useEffect(() => {
    Promise.all([
      getStorefrontSiteNavigation(),
      getStorefrontAnnouncement(),
      getStorefrontBranding()
    ]).then(([navigation, activeAnnouncement, activeBranding]) => {
      setSiteNavigation(navigation);
      setAnnouncement(activeAnnouncement);
      setBranding(activeBranding);
    });
  }, []);
  useEffect(() => {
    if (!product) return;
    const footer = document.querySelector(".cx-store-luxury-footer, .cx-store__footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -68px 0px",
      threshold: 0
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, [product]);
  useEffect(() => {
    if (!product) return;
    const description =
      product.shortDescription ||
      product.description ||
      `${product.name} from Tech Media, Tiruppur.`;
    setStorefrontSeo({
      description,
      path: `/shop/product/${encodeURIComponent(product.slug)}`,
      structuredData: createProductStructuredData({
        brand: product.brand,
        description,
        imageUrl: product.imageUrl,
        name: product.name,
        price: product.price,
        slug: product.slug
      }),
      title: `${product.name} | Tech Media Tiruppur`
    });
  }, [product]);
  const header = (
    <StoreHeader
      announcement={announcement}
      branding={branding}
      discovery={discovery}
      filters={defaultFilters("", "")}
    />
  );
  if (error)
    return (
      <div className="cx-store">
        {header}
        <main className="cx-store__empty">{error}</main>
      </div>
    );
  if (!product)
    return (
      <div className="cx-store">
        {header}
        <main className="cx-store__empty">Loading product…</main>
      </div>
    );
  const enquiry = whatsappLink(
    `Hello${branding?.brandName ? ` ${branding.brandName}` : ""}, I would like to know more about ${product.name}.`,
    branding?.primaryPhone
  );
  const priced = hasStorefrontPrice(product.price);
  const bulletPoints = product.bulletPoints.filter(Boolean);
  const productImages = product.images.length
    ? product.images
    : product.imageUrl
      ? [{ altText: product.imageAlt, caption: "", url: product.imageUrl, variantId: null }]
      : [];
  const activeImage = productImages[Math.min(activeImageIndex, productImages.length - 1)];
  const hasSpecifications = Boolean(bulletPoints.length || product.variants.length);
  const hasPolicies = Boolean(product.warranty || product.returnPolicy);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;
  const detailTabs = [
    { id: "overview", label: "Overview" },
    ...(hasSpecifications ? [{ id: "specifications", label: "Highlights & options" }] : []),
    ...(hasPolicies ? [{ id: "policies", label: "Warranty & returns" }] : [])
  ];
  return (
    <div className="cx-store">
      {header}
      <main className="cx-pdp">
        <nav className="cx-pdp__breadcrumbs" aria-label="Breadcrumb">
          <a href="/shop">Home</a>
          <ChevronRightIcon aria-hidden="true" />
          {product.category ? (
            <>
              <a href={`/shop/category/${encodeURIComponent(product.category)}`}>
                {product.category}
              </a>
              <ChevronRightIcon aria-hidden="true" />
            </>
          ) : null}
          {product.brand ? (
            <>
              <span>{product.brand}</span>
              <ChevronRightIcon aria-hidden="true" />
            </>
          ) : null}
          <span aria-current="page">{product.name}</span>
        </nav>
        <div className="cx-pdp__layout">
          <div className="cx-pdp__primary">
            <section className="cx-pdp__gallery" aria-label="Product images">
              <div className="cx-pdp__image-frame">
                {activeImage ? (
                  <img
                    key={activeImage.url}
                    alt={activeImage.altText || product.imageAlt || product.name}
                    decoding="async"
                    fetchPriority="high"
                    src={activeImage.url}
                    srcSet={responsiveImageSrcSet(activeImage.url, [480, 768, 960, 1200])}
                    sizes="(max-width: 900px) 100vw, (max-width: 1280px) 48vw, 580px"
                  />
                ) : (
                  <div className="cx-pdp__no-image">Product image coming soon</div>
                )}
                {product.featured ? <span className="cx-pdp__featured">Featured</span> : null}
                {productImages.length > 1 ? (
                  <>
                    <button
                      aria-label="Previous product image"
                      className="cx-pdp__gallery-arrow cx-pdp__gallery-arrow--previous"
                      onClick={() =>
                        setActiveImageIndex(
                          (index) => (index - 1 + productImages.length) % productImages.length
                        )
                      }
                      type="button"
                    >
                      <ChevronLeftIcon aria-hidden="true" />
                    </button>
                    <button
                      aria-label="Next product image"
                      className="cx-pdp__gallery-arrow cx-pdp__gallery-arrow--next"
                      onClick={() =>
                        setActiveImageIndex((index) => (index + 1) % productImages.length)
                      }
                      type="button"
                    >
                      <ChevronRightIcon aria-hidden="true" />
                    </button>
                  </>
                ) : null}
              </div>
              {productImages.length > 1 ? (
                <div className="cx-pdp__thumbnails" aria-label="Choose a product image">
                  {productImages.map((image, index) => (
                    <button
                      aria-label={`Show image ${index + 1}${image.caption ? `: ${image.caption}` : ""}`}
                      aria-pressed={activeImageIndex === index}
                      className={activeImageIndex === index ? "is-active" : ""}
                      key={`${image.url}-${index}`}
                      onClick={() => setActiveImageIndex(index)}
                      type="button"
                    >
                      <img alt="" loading="lazy" src={image.url} />
                    </button>
                  ))}
                </div>
              ) : null}
              {activeImage?.caption ? (
                <p className="cx-pdp__caption">{activeImage.caption}</p>
              ) : null}
            </section>

            <section className="cx-pdp__summary" aria-labelledby="cx-pdp-title">
              <div className="cx-pdp__eyebrow">
                {product.brand ? <span>{product.brand}</span> : null}
                {product.brand && product.category ? <i aria-hidden="true" /> : null}
                {product.category ? <span>{product.category}</span> : null}
                {product.featured ? <BadgeCheckIcon aria-label="Featured product" /> : null}
              </div>
              <h1 id="cx-pdp-title">{product.name}</h1>
              {product.shortDescription ? (
                <p className="cx-pdp__lead">{product.shortDescription}</p>
              ) : null}
              {product.subtitle ? (
                <p className="cx-pdp__availability">
                  <CheckIcon aria-hidden="true" />
                  {product.subtitle}
                </p>
              ) : null}
              {priced ? (
                <div className="cx-pdp__price-row">
                  <strong>{money(product.price)}</strong>
                  {hasStorefrontPrice(product.compareAtPrice) ? (
                    <del>{money(product.compareAtPrice ?? product.price)}</del>
                  ) : null}
                  {discountPercent > 0 ? <span>{discountPercent}% off</span> : null}
                </div>
              ) : (
                <p className="cx-pdp__enquiry-price">Contact us for current pricing</p>
              )}
              {bulletPoints.length ? (
                <div className="cx-pdp__key-specs-highlight">
                  <h3>Key Features & Specifications</h3>
                  <ul>
                    {bulletPoints.map((point) => (
                      <li key={point}>
                        <CheckIcon aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {productImages.length > 1 ? (
                <p className="cx-pdp__image-count">{productImages.length} product images</p>
              ) : null}
            </section>
          </div>

          <aside className="cx-pdp__purchase" aria-label="Purchase options">
            <div className="cx-pdp__purchase-heading">
              <span>Price</span>
              {priced ? <strong>{money(product.price)}</strong> : <strong>Ask for price</strong>}
              {discountPercent > 0 ? <small>Save {discountPercent}% at checkout</small> : null}
            </div>
            {product.subtitle ? (
              <p className="cx-pdp__purchase-note">
                <PackageCheckIcon aria-hidden="true" />
                {product.subtitle}
              </p>
            ) : null}
            <div className="cx-pdp__purchase-actions">
              {priced ? (
                <button
                  className="cx-pdp__add-button"
                  onClick={() => addStorefrontCartItem(product)}
                  type="button"
                >
                  <ShoppingCartIcon aria-hidden="true" /> Add to basket
                </button>
              ) : null}
              <a className="cx-pdp__contact-button" href={enquiry} rel="noreferrer" target="_blank">
                Enquire on WhatsApp <ArrowRightIcon aria-hidden="true" />
              </a>
            </div>
            <div className="cx-pdp__assurances">
              {product.warranty ? (
                <p>
                  <ShieldCheckIcon aria-hidden="true" />
                  <span>
                    <strong>Warranty</strong>
                    {product.warranty}
                  </span>
                </p>
              ) : null}
              {product.returnPolicy ? (
                <p>
                  <RotateCcwIcon aria-hidden="true" />
                  <span>
                    <strong>Returns</strong>
                    {product.returnPolicy}
                  </span>
                </p>
              ) : null}
              {product.variants.length ? (
                <p>
                  <CreditCardIcon aria-hidden="true" />
                  <span>
                    <strong>Configurations</strong>
                    {product.variants.length} available
                  </span>
                </p>
              ) : null}
            </div>
          </aside>
        </div>

        {detailTabs.length > 0 ? (
          <section className="cx-pdp__details" aria-label="Product information">
            <div className="cx-pdp__tabs" role="tablist" aria-label="Product information sections">
              {detailTabs.map((tab) => (
                <button
                  aria-controls={`cx-pdp-panel-${tab.id}`}
                  aria-selected={activeDetailTab === tab.id}
                  id={`cx-pdp-tab-${tab.id}`}
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              aria-labelledby={`cx-pdp-tab-${activeDetailTab}`}
              className="cx-pdp__tab-panel"
              id={`cx-pdp-panel-${activeDetailTab}`}
              role="tabpanel"
              tabIndex={0}
            >
              {activeDetailTab === "overview" ? (
                <div className="cx-pdp__overview">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p>{product.shortDescription || product.name}</p>
                  )}
                  {product.brand || product.category ? (
                    <dl>
                      {product.brand ? (
                        <div>
                          <dt>Brand</dt>
                          <dd>{product.brand}</dd>
                        </div>
                      ) : null}
                      {product.category ? (
                        <div>
                          <dt>Category</dt>
                          <dd>{product.category}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt>Product code</dt>
                        <dd>{product.slug}</dd>
                      </div>
                    </dl>
                  ) : null}
                </div>
              ) : null}
              {activeDetailTab === "specifications" ? (
                <div className="cx-pdp__specifications">
                  {bulletPoints.length ? (
                    <div>
                      <h2>Highlights</h2>
                      <ul>
                        {bulletPoints.map((point) => (
                          <li key={point}>
                            <CheckIcon aria-hidden="true" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {product.variants.length ? (
                    <div>
                      <h2>Available configurations</h2>
                      <ul className="cx-pdp__variants">
                        {product.variants.map((variant) => (
                          <li key={variant.id}>
                            <span>
                              {variant.title}
                              <small>{variant.sku}</small>
                            </span>
                            {hasStorefrontPrice(variant.price) ? (
                              <strong>{money(variant.price)}</strong>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {activeDetailTab === "policies" ? (
                <div className="cx-pdp__policy-grid">
                  {product.warranty ? (
                    <article>
                      <ShieldCheckIcon aria-hidden="true" />
                      <div>
                        <h2>Warranty</h2>
                        <p>{product.warranty}</p>
                      </div>
                    </article>
                  ) : null}
                  {product.returnPolicy ? (
                    <article>
                      <RotateCcwIcon aria-hidden="true" />
                      <div>
                        <h2>Returns</h2>
                        <p>{product.returnPolicy}</p>
                      </div>
                    </article>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {similarProducts.length ? (
          <div className="cx-pdp__similar">
            <ProductSection
              brandName={branding?.brandName}
              label="Similar items"
              products={similarProducts}
              title="More products you may like"
              whatsappNumber={branding?.primaryPhone}
            />
          </div>
        ) : null}
      </main>
      <div
        aria-hidden={footerVisible}
        aria-label="Quick product actions"
        className={`cx-pdp__mobile-actions${footerVisible ? " is-hidden" : ""}`}
        inert={footerVisible}
        role="group"
      >
        {priced ? (
          <button
            className="cx-pdp__mobile-add"
            onClick={() => addStorefrontCartItem(product)}
            type="button"
          >
            <ShoppingCartIcon aria-hidden="true" />
            Add to basket
          </button>
        ) : null}
        <a className="cx-pdp__mobile-contact" href={enquiry} rel="noreferrer" target="_blank">
          <MessageCircleIcon aria-hidden="true" />
          WhatsApp
        </a>
      </div>
      <BackToTopButton />
      <StoreFooter branding={branding} navigation={siteNavigation} />
    </div>
  );
}

function ProductSection({
  brandName,
  label,
  products,
  title,
  whatsappNumber
}: {
  brandName?: string | undefined;
  label: string;
  products: StorefrontProduct[];
  title: string;
  whatsappNumber?: string | null | undefined;
}) {
  return (
    <section className="cx-store__featured-products">
      <div className="cx-store__section-title">
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>
        <a href="/search?sort=featured">
          <span>Browse and filter all</span>
          <ArrowRightIcon aria-hidden="true" />
        </a>
      </div>
      <div className="cx-store__grid">
        {products.map((product) => (
          <ProductCard
            brandName={brandName}
            key={product.slug}
            product={product}
            whatsappNumber={whatsappNumber}
          />
        ))}
      </div>
    </section>
  );
}

function searchScope(): StorefrontFilters["scope"] {
  const value = new URLSearchParams(window.location.search).get("scope");
  return value === "products" || value === "brands" || value === "categories" ? value : "all";
}

function defaultFilters(category: string, search: string): StorefrontFilters {
  return {
    brand: "",
    category,
    maxPrice: null,
    minPrice: null,
    scope: "all",
    search,
    sort: "featured"
  };
}

async function loadOptional<T>(request: Promise<T>, apply: (value: T) => void) {
  try {
    apply(await request);
  } catch {
    // Optional storefront regions fail independently so the primary catalog remains usable.
  }
}

async function loadCatalogPageContent(searchPage: boolean) {
  const optional = <T,>(request: Promise<T>, fallback: T) => request.catch(() => fallback);
  const [bootstrap, branding, blogPosts] = await Promise.all([
    optional(getStorefrontBootstrap(), {
      announcement: null,
      brandStrips: [],
      campaignEvents: [],
      discovery: emptyDiscovery,
      featuredCards: [],
      promotions: [],
      seasonStrips: [],
      siteNavigation: null,
      sliders: []
    }),
    optional(getStorefrontBranding(), null),
    searchPage
      ? Promise.resolve([])
      : optional(
          listLatestBlogPosts().then((items) => items.slice(0, 3)),
          []
        )
  ]);
  return {
    announcement: bootstrap.announcement,
    blogPosts,
    branding,
    discovery: bootstrap.discovery,
    brandStrips: searchPage ? [] : bootstrap.brandStrips,
    campaignEvents: searchPage ? [] : bootstrap.campaignEvents,
    featuredCards: searchPage ? [] : bootstrap.featuredCards,
    promotions: searchPage ? [] : bootstrap.promotions,
    seasonStrips: searchPage ? [] : bootstrap.seasonStrips,
    siteNavigation: bootstrap.siteNavigation,
    slides: searchPage ? [] : bootstrap.sliders
  };
}
