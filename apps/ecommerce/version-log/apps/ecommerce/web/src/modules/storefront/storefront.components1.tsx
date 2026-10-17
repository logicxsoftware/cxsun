import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight as ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  HeadphonesIcon,
  CameraIcon,
  Mail as MailIcon,
  MessageCircleIcon,
  MenuIcon,
  Globe2Icon,
  LaptopIcon,
  NetworkIcon,
  RotateCcwIcon,
  Server as ServerIcon,
  ShieldIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchIcon,
  XIcon,
  Cog as CogIcon,
  Monitor as MonitorIcon,
  Zap as ZapIcon
} from "lucide-react";
import type {
  StorefrontDiscovery,
  StorefrontBranding,
  StorefrontFilters,
  StorefrontProduct,
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
import { StorefrontCollectionIcon } from "./storefront.collection-icons";
import { StorefrontSocialIcon } from "./storefront.social-icon";
import "./storefront.home-redesign1.css";

type FilterProps = {
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
  onFilters: (value: StorefrontFilters) => void;
};

export function HeroSlider({ slides }: { slides: StorefrontSlider[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6800);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const slide = slides[active];
  if (!slide) return null;
  return (
    <section
      aria-label="Storefront highlights"
      aria-roledescription="carousel"
      className="cx-store__hero"
    >
      <div className="cx-store__hero-copy" key={`copy-${slide.sliderCode}`}>
        {slide.eyebrow ? <span className="cx-store__hero-reveal">{slide.eyebrow}</span> : null}
        <h1 className="cx-store__hero-reveal">{slide.title}</h1>
        {slide.description ? <p className="cx-store__hero-reveal">{slide.description}</p> : null}
        <a className="cx-store__hero-reveal" href={slide.actionUrl}>
          {slide.actionLabel}
        </a>
      </div>
      <div className="cx-store__hero-media" key={`media-${slide.sliderCode}`}>
        <img
          alt={slide.imageAlt || slide.title}
          decoding="async"
          fetchPriority="high"
          height={720}
          sizes="(max-width: 900px) 100vw, 50vw"
          src={slide.imageUrl}
          srcSet={responsiveImageSrcSet(slide.imageUrl, [480, 768, 1200, 1600])}
          width={1200}
        />
        <div aria-label="Choose storefront highlight" className="cx-store__hero-bullets">
          {slides.map((item, index) => (
            <button
              aria-label={`Show ${item.title}`}
              aria-current={index === active ? "true" : undefined}
              className={index === active ? "is-active" : undefined}
              key={item.sliderCode}
              onClick={() => setActive(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TechMediaTrustSection({
  content
}: {
  content?: StorefrontSiteNavigation["trustedStrip"] | undefined;
}) {
  const [activePanel, setActivePanel] = useState(0);

  const panels = [
    {
      action: "Explore products",
      description:
        "Practical systems selected around your workload, budget, service needs, and future upgrades.",
      details: [
        "Business and student laptops",
        "Desktops and workstations",
        "Custom systems and accessories"
      ],
      href: "/shop",
      icon: LaptopIcon,
      number: "01",
      title: "Computers and laptops",
      shortTitle: ["Computers and", "laptops"]
    },
    {
      action: "Explore solutions",
      description:
        "Connected technology for offices, factories, retailers, institutions, and growing teams.",
      details: [
        "Networking, Wi-Fi and storage",
        "CCTV, biometric and access",
        "POS, VoIP and displays"
      ],
      href: "/features",
      icon: NetworkIcon,
      number: "02",
      title: "Business IT solutions",
      shortTitle: ["Business IT", "solutions"]
    },
    {
      action: "Get local support",
      description:
        "Reach a Tiruppur team that can help before the purchase and after the installation.",
      details: [
        "Computer and laptop service",
        "Installation and upgrades",
        "Maintenance and warranty help"
      ],
      href: "/support",
      icon: WrenchIcon,
      number: "03",
      title: "Service and support",
      shortTitle: ["Service and", "support"]
    },
    {
      action: "Plan security",
      description:
        "Practical protection and access systems designed for the site, people, and daily workflow.",
      details: [
        "CCTV and remote monitoring",
        "Biometric attendance",
        "Face recognition and access control"
      ],
      href: "/features",
      icon: ShieldIcon,
      number: "04",
      title: "Security and access",
      shortTitle: ["Security", "and access"]
    },
    {
      action: "Discuss infrastructure",
      description:
        "A connected foundation for teams that depend on reliable systems, communication, and support.",
      details: [
        "Servers, storage and backup",
        "VoIP and video conferencing",
        "AMC and planned maintenance"
      ],
      href: "/contact",
      icon: ServerIcon,
      number: "05",
      title: "Managed infrastructure",
      shortTitle: ["Managed", "infrastructure"]
    }
  ] as const;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 45) {
      setActivePanel((p) => (p + 1) % panels.length);
    } else if (diff < -45) {
      setActivePanel((p) => (p - 1 + panels.length) % panels.length);
    }
    setTouchStart(null);
  };

  const current = panels[activePanel] ?? panels[0];

  return (
    <section className="cx-trust-section" aria-labelledby="trust-section-title">
      {/* Desktop & Main Row */}
      <div className="cx-trust-header-row">
        {/* Left Column: Intro Copy + Proof Points + 3D Visual */}
        <div className="cx-trust-intro-col">
          <div className="cx-trust-intro-header">
            <div className="cx-trust-mobile-dot-grid" aria-hidden="true">
              <DotGridGraphic />
            </div>

            <div className="cx-trust-eyebrow-row">
              <span className="cx-trust-green-dash" aria-hidden="true" />
              <span className="cx-trust-eyebrow">
                {content?.eyebrow || "TRUSTED IN TIRUPPUR SINCE 2002"}
              </span>
            </div>

            <h2 id="trust-section-title" className="cx-trust-heading">
              {content?.title || "25+ years of practical technology experience"}
            </h2>

            <p className="cx-trust-desc">
              {content?.description ||
                "We help you choose technology that fits the work, set it up properly, and keep it useful as your needs grow."}
            </p>

            <div className="cx-trust-proof-list" aria-label="Tech Media service strengths">
              {(content?.proofPoints.length
                ? content.proofPoints
                : ["MULTI-BRAND GUIDANCE", "LOCAL TECHNICAL SUPPORT", "RETAIL AND BUSINESS EXPERTISE"]
              ).map((point) => (
                <div className="cx-trust-proof-item" key={point}>
                  <span className="cx-trust-proof-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <strong>{point.toUpperCase()}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Pedestal visual with dynamic slide visual + tablet caption */}
          <div className="cx-trust-pedestal-visual-wrap" aria-hidden="false">
            <div className="cx-trust-pedestal-slide-box" key={activePanel}>
              <TrustDeskPedestalVisual activeIndex={activePanel} />
              {/* Tablet active slide info card */}
              <div className="cx-trust-tablet-slide-caption">
                <div className="cx-trust-tablet-slide-badge">
                  <span className="cx-trust-tablet-slide-num">{current.number}</span>
                  <span className="cx-trust-green-dash" aria-hidden="true" />
                  <span className="cx-trust-tablet-slide-name">{current.title}</span>
                </div>
                <p className="cx-trust-tablet-slide-desc">{current.description}</p>
                <a className="cx-trust-tablet-slide-action" href={current.href}>
                  {current.action} <ArrowRightIcon aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Slide / Multi-panel Deck (Desktop & Mobile) */}
        <div
          className="cx-trust-deck-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Active Elevated Card */}
          <div className="cx-trust-active-card" key={current.number}>
            <div className="cx-trust-active-card-content">
              <div className="cx-trust-active-card-badge">
                <span className="cx-trust-active-number">{current.number}</span>
                <span className="cx-trust-active-bar" aria-hidden="true" />
              </div>

              <h3 className="cx-trust-active-title">{current.title}</h3>
              <p className="cx-trust-active-desc">{current.description}</p>

              <ul className="cx-trust-active-checklist">
                {current.details.map((detail) => (
                  <li key={detail}>
                    <CheckIcon className="cx-trust-check-icon" aria-hidden="true" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              <div className="cx-trust-active-actions">
                <a className="cx-trust-action-btn" href={current.href}>
                  {current.action} <ArrowRightIcon aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Visual on the right of the active card */}
            <div className="cx-trust-active-card-media" aria-hidden="true">
              <TrustActiveCardLaptops />
              {/* Mobile circular green action button */}
              <a
                className="cx-trust-mobile-circle-btn"
                href={current.href}
                aria-label={current.action}
              >
                <ArrowRightIcon aria-hidden="true" />
              </a>
            </div>

            {/* Pagination indicator dashes */}
            <div className="cx-trust-pagination" aria-label="Service carousel navigation">
              {panels.map((p, idx) => (
                <button
                  key={p.number}
                  type="button"
                  className={`cx-trust-pagination-dash${idx === activePanel ? " is-active" : ""}`}
                  onClick={() => setActivePanel(idx)}
                  aria-label={`Switch to ${p.title}`}
                />
              ))}
            </div>
          </div>

          {/* Inactive Tab Columns (02, 03, 04, 05) displayed to the right on Desktop */}
          <div className="cx-trust-inactive-tabs" aria-label="Other technology services">
            {panels.map((panel, index) => {
              if (index === activePanel) return null;
              const Icon = panel.icon;
              return (
                <button
                  type="button"
                  key={panel.number}
                  className="cx-trust-tab-col"
                  onClick={() => setActivePanel(index)}
                  aria-label={`View ${panel.title}`}
                >
                  <div className="cx-trust-tab-top">
                    <span className="cx-trust-tab-number">{panel.number}</span>
                    <span className="cx-trust-tab-dash" aria-hidden="true" />
                  </div>

                  <div className="cx-trust-tab-icon" aria-hidden="true">
                    <Icon />
                  </div>

                  <div className="cx-trust-tab-title">
                    <span>{panel.shortTitle[0]}</span>
                    <span>{panel.shortTitle[1]}</span>
                  </div>

                  <div className="cx-trust-tab-arrow" aria-hidden="true">
                    <ArrowRightIcon />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile peeking adjacent tab */}
          <div
            className="cx-trust-mobile-peek-card"
            onClick={() => setActivePanel((activePanel + 1) % panels.length)}
            aria-hidden="true"
          >
            {(() => {
              const nextPanel = panels[(activePanel + 1) % panels.length];
              const NextIcon = nextPanel.icon;
              return (
                <>
                  <div className="cx-trust-tab-top">
                    <span className="cx-trust-tab-number">{nextPanel.number}</span>
                    <span className="cx-trust-tab-dash" />
                  </div>
                  <div className="cx-trust-tab-icon">
                    <NextIcon />
                  </div>
                  <div className="cx-trust-tab-title">
                    <span>{nextPanel.shortTitle[0]}</span>
                    <span>{nextPanel.shortTitle[1]}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Tablet Bottom Tabs Bar (5 horizontal cards as shown in the Tablet screenshot) */}
      <div className="cx-trust-tablet-tabs-bar" aria-label="All services (tablet)">
        {panels.map((panel, index) => {
          const Icon = panel.icon;
          const isActive = activePanel === index;
          return (
            <button
              type="button"
              key={panel.number}
              className={`cx-trust-tablet-tab-card${isActive ? " is-active" : ""}`}
              onClick={() => setActivePanel(index)}
            >
              <div className="cx-trust-tablet-tab-num">
                <span>{panel.number}</span>
                <span className="cx-trust-tab-dash" aria-hidden="true" />
              </div>
              <div className="cx-trust-tablet-tab-content">
                <Icon className="cx-trust-tablet-tab-icon" aria-hidden="true" />
                <span className="cx-trust-tablet-tab-name">{panel.title}</span>
                <ArrowRightIcon className="cx-trust-tablet-tab-arrow" aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* Redesigned Service Banner matching the top banner in the design */
export function ServiceBanner({
  content
}: {
  content?: StorefrontSiteNavigation["serviceBanner"] | undefined;
}) {
  return (
    <section className="cx-store__service-banner">
      {/* Background organic contour accents */}
      <div className="cx-store__service-banner-bg" aria-hidden="true">
        <div className="cx-store__service-banner-glow-right" />
        <div className="cx-store__service-banner-glow-left" />
        <svg className="cx-store__service-banner-contour" viewBox="0 0 1320 180" fill="none" preserveAspectRatio="none">
          <path d="M-40 130 C 140 50, 260 170, 480 110 C 680 50, 830 150, 1080 90 C 1200 60, 1320 120, 1380 80" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="2" />
          <path d="M-20 70 C 180 140, 380 40, 720 90 C 960 130, 1120 40, 1360 70" stroke="rgba(245, 158, 11, 0.05)" strokeWidth="1.8" />
          <circle cx="1180" cy="90" r="140" stroke="rgba(245, 158, 11, 0.1)" strokeWidth="1.2" />
          <circle cx="1180" cy="90" r="190" stroke="rgba(245, 158, 11, 0.05)" strokeWidth="1" />
        </svg>
      </div>

      <div className="cx-store__service-banner-left">
        <span className="cx-store__service-banner-mark" aria-hidden="true">
          <HeadphonesIcon />
        </span>
        <div className="cx-store__service-banner-copy">
          <small>{content?.eyebrow || "TECH MEDIA CARE"}</small>
          <strong>{content?.title || "Technology works better with support close by."}</strong>
          <span>
            {content?.description ||
              "Local help for genuine products, installation, maintenance, and ongoing business technology needs."}
          </span>
        </div>
      </div>

      <div className="cx-store__service-banner-right">
        <a className="cx-store__service-banner-action" href={content?.actionUrl || "/support"}>
          {content?.actionLabel || "Get support"} <ArrowUpRightIcon />
        </a>
        <div className="cx-store__service-banner-graphic" aria-hidden="true">
          <SupportDeskIllustration />
        </div>
      </div>
    </section>
  );
}

export function PromotionsSection({ promotions }: { promotions: StorefrontPromotion[] }) {
  return (
    <StorefrontCardsSection
      cards={promotions.map((item) => ({ ...item, cardCode: item.promotionCode }))}
      id="promotions"
      label="Current promotions"
      title="Better value on everyday technology"
    />
  );
}

export function SeasonBanner({ promotions }: { promotions: StorefrontPromotion[] }) {
  const campaign = promotions[0];

  const eyebrow = campaign?.eyebrow || "TECHMEDIA CARE & INNOVATION";
  const title = campaign?.title || "Summer Tech Upgrade Fest 2026";
  const description =
    campaign?.description ||
    "Amazing deals on laptops, accessories and more. Upgrade your workspace with the latest technology.";
  const actionLabel = campaign?.actionLabel || "Explore Deals";
  const actionUrl = campaign?.actionUrl || "/campaigns";

  return (
    <section className="cx-season-banner-section" aria-label="Seasonal Tech Fest">
      <div className="cx-season-banner-card">
        {/* Upper Hero Offer Tier */}
        <div className="cx-season-hero-tier">
          {/* Left Column: Offer Copy + CTA + Quick Categories */}
          <div className="cx-season-copy-col">
            <div className="cx-season-eyebrow-row">
              <span className="cx-season-red-dot" aria-hidden="true" />
              <span className="cx-season-eyebrow">{eyebrow}</span>
            </div>

            <h2 className="cx-season-heading">
              <span className="cx-season-heading-light">Summer Tech</span>{" "}
              <span className="cx-season-heading-accent">
                Upgrade Fest 2026
                {/* Decorative sparkles & hand-drawn accent line */}
                <svg className="cx-season-sparkles-svg" viewBox="0 0 40 24" fill="none" aria-hidden="true">
                  <path d="M12 4l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="#9f1239" />
                  <path d="M28 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="#9f1239" />
                </svg>
                <svg className="cx-season-curve-line" viewBox="0 0 160 12" fill="none" aria-hidden="true">
                  <path d="M2 8c40-6 100-6 156 2" stroke="#9f1239" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            <p className="cx-season-desc">{description}</p>

            <div className="cx-season-action-row">
              <a className="cx-season-cta-btn" href={actionUrl}>
                <span>{actionLabel}</span>
                <ArrowUpRightIcon aria-hidden="true" />
              </a>
            </div>

            {/* Quick Categories Bar (Laptops | Monitors | Accessories) */}
            <div className="cx-season-categories-bar" aria-label="Featured Categories">
              <a className="cx-season-category-item" href="/shop?category=Laptops">
                <div className="cx-season-category-icon" aria-hidden="true">
                  <LaptopIcon />
                </div>
                <div className="cx-season-category-info">
                  <strong>Laptops</strong>
                  <span>Top brands</span>
                </div>
              </a>

              <div className="cx-season-category-divider" aria-hidden="true" />

              <a className="cx-season-category-item" href="/shop?category=Monitors">
                <div className="cx-season-category-icon" aria-hidden="true">
                  <MonitorIcon />
                </div>
                <div className="cx-season-category-info">
                  <strong>Monitors</strong>
                  <span>Crystal clear</span>
                </div>
              </a>

              <div className="cx-season-category-divider" aria-hidden="true" />

              <a className="cx-season-category-item" href="/shop?category=Accessories">
                <div className="cx-season-category-icon" aria-hidden="true">
                  <HeadphonesIcon />
                </div>
                <div className="cx-season-category-info">
                  <strong>Accessories</strong>
                  <span>Upgrade setup</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: 3D Crimson Showcase Stage */}
          <div className="cx-season-showcase-col" aria-hidden="true">
            <SeasonFestStageVisual />
          </div>
        </div>

        {/* Lower Assurance Tier: Deep Maroon Bar */}
        <div className="cx-season-assurance-tier" aria-label="Shopping Assurance">
          <div className="cx-season-assurance-brand">
            <strong>Tech Media assurance</strong>
          </div>

          <div className="cx-season-assurance-divider" aria-hidden="true" />

          <div className="cx-season-assurance-item">
            <div className="cx-season-assurance-icon">
              <TruckIcon />
            </div>
            <div className="cx-season-assurance-text">
              <strong>Dependable delivery</strong>
              <span>Delivery options confirmed for your location</span>
            </div>
          </div>

          <div className="cx-season-assurance-divider" aria-hidden="true" />

          <div className="cx-season-assurance-item">
            <div className="cx-season-assurance-icon">
              <WrenchIcon />
            </div>
            <div className="cx-season-assurance-text">
              <strong>Business-ready installation</strong>
              <span>Hassle-free setup at your workspace</span>
            </div>
          </div>

          <div className="cx-season-assurance-divider" aria-hidden="true" />

          <div className="cx-season-assurance-item">
            <div className="cx-season-assurance-icon">
              <HeadphonesIcon />
            </div>
            <div className="cx-season-assurance-text">
              <strong>Support after purchase</strong>
              <span>Local help for products, orders, and service</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedCardsSection({ cards }: { cards: StorefrontFeaturedCard[] }) {
  return (
    <StorefrontCardsSection
      cards={cards.map((item) => ({ ...item, cardCode: item.featuredCode }))}
      id="featured"
      label="Featured products"
      title="Selected technology worth a closer look"
    />
  );
}

type StorefrontCard = Omit<StorefrontPromotion, "promotionCode"> & { cardCode: string };

function StorefrontCardsSection({
  cards,
  id,
  label,
  title
}: {
  cards: StorefrontCard[];
  id: string;
  label: string;
  title: string;
}) {
  if (!cards.length) return null;
  return (
    <section className="cx-store__promotions" id={id}>
      <SectionTitle label={label} title={title} />
      <div className="cx-store__promotion-grid">
        {cards.map((promotion) => {
          const priced = hasStorefrontPrice(promotion.offerPrice);
          return (
            <a
              className="cx-store__promotion-card"
              href={promotion.actionUrl}
              key={promotion.cardCode}
            >
              <span className="cx-store__promotion-media">
                <img
                  alt={promotion.imageAlt || promotion.title}
                  decoding="async"
                  loading="lazy"
                  src={promotion.imageUrl}
                />
                {promotion.badge ? (
                  <span
                    className={`cx-store__promotion-saving is-${promotion.badgePosition}`}
                    style={{
                      backgroundColor: badgeColor(promotion.badgeTint),
                      color: promotion.badgeTextColor || "#ffffff"
                    }}
                  >
                    {promotion.badge}
                  </span>
                ) : null}
              </span>
              <span className="cx-store__promotion-copy">
                {promotion.eyebrow ? <small>{promotion.eyebrow}</small> : null}
                <strong>{promotion.title}</strong>
                {promotion.description ? <span>{promotion.description}</span> : null}
                <span className="cx-store__promotion-actions">
                  {priced ? (
                    <span className="cx-store__promotion-price">
                      <b>{money(promotion.offerPrice)}</b>
                      {hasStorefrontPrice(promotion.originalPrice) ? (
                        <del>{money(promotion.originalPrice ?? promotion.offerPrice)}</del>
                      ) : null}
                    </span>
                  ) : null}
                  <span className="cx-store__promotion-link">
                    {promotion.actionLabel || (priced ? "View offer" : "Enquire")}
                  </span>
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function badgeColor(value: string) {
  return (
    (
      {
        brand: "#0f766e",
        success: "#15803d",
        warning: "#b45309",
        danger: "#b91c1c",
        neutral: "#334155"
      } as Record<string, string>
    )[value] ||
    value ||
    "#0f766e"
  );
}

export function BrandsSection({ brands }: { brands: StorefrontDiscovery["brands"] }) {
  const items = [...brands, ...brands];
  return (
    <section className="cx-store__brands" id="brands">
      <span>Shop trusted brands</span>
      <div className="cx-store__brand-marquee">
        <div className="cx-store__brand-track">
          {items.map((brand, index) => (
            <a
              aria-hidden={index >= brands.length ? "true" : undefined}
              href={`/search?q=${encodeURIComponent(brand.name)}&scope=brands`}
              key={`${brand.name}-${index}`}
              tabIndex={index >= brands.length ? -1 : undefined}
            >
              <span className="cx-store__brand-logo">
                {brand.logoUrl ? (
                  <img
                    alt={index >= brands.length ? "" : brand.logoAlt || `${brand.name} logo`}
                    decoding="async"
                    loading="lazy"
                    src={brand.logoUrl}
                  />
                ) : (
                  <strong>{brand.name}</strong>
                )}
              </span>
              <small>{brand.productCount} products</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogSolutionsSection({
  brandName = "",
  posts
}: {
  brandName?: string | undefined;
  posts: StorefrontBlogPost[];
}) {
  if (!posts.length) return null;
  return (
    <section className="cx-store__blog-solutions" id="solutions">
      <div className="cx-store__latest-heading">
        <div>
          <h2>Latest Posts</h2>
          <p>Practical computer guides from the {brandName} editorial team</p>
        </div>
        <a href="/blog">View all posts</a>
      </div>
      <div className="cx-store__blog-solution-grid">
        {posts.map((post) => (
          <a href={`/blog/${post.slug}`} key={post.slug}>
            <span className="cx-store__blog-solution-media">
              {post.featuredImage ? (
                <img alt={post.imageAlt} decoding="async" loading="lazy" src={post.featuredImage} />
              ) : (
                <span>{brandName} Journal</span>
              )}
              <span className="cx-store__blog-solution-arrow" aria-hidden="true">
                <ArrowUpRightIcon />
              </span>
            </span>
            <span className="cx-store__blog-solution-copy">
              <span className="cx-store__blog-meta">
                <b>{articleCategory(post.title)}</b>
                <span>·</span>
                <span>{readingMinutes(post.excerpt)} min read</span>
              </span>
              <strong>{post.title}</strong>
              <span>{post.excerpt}</span>
              <span className="cx-store__blog-author">
                <span>CX</span>
                <span>
                  <b>{brandName} Editorial</b>
                  <small>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "Latest"}
                  </small>
                </span>
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function readingMinutes(excerpt: string) {
  return Math.max(4, Math.round(excerpt.length / 35));
}

function articleCategory(title: string) {
  if (/laptop/iu.test(title)) return "Laptops";
  if (/desktop|workstation/iu.test(title)) return "Desktop";
  if (/network|security/iu.test(title)) return "Security";
  if (/upgrade|RAM|SSD/iu.test(title)) return "Upgrades";
  if (/maintenance/iu.test(title)) return "Maintenance";
  return "Buying Guide";
}

export function CatalogFilters({ discovery, filters, onFilters }: FilterProps) {
  return (
    <aside className="cx-store__filters" aria-label="Product filters">
      <strong>Filter the range</strong>
      <label className="cx-store__filter-search">
        Search products
        <input
          aria-label="Search products"
          autoComplete="off"
          placeholder="Name, brand, or category"
          type="search"
          value={filters.search}
          onChange={(event) => onFilters({ ...filters, scope: "all", search: event.target.value })}
        />
      </label>
      <label>
        Category
        <select
          value={filters.category}
          onChange={(event) => onFilters({ ...filters, category: event.target.value })}
        >
          <option value="">All categories</option>
          {discovery.categories.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <label>
        Brand
        <select
          value={filters.brand}
          onChange={(event) => onFilters({ ...filters, brand: event.target.value })}
        >
          <option value="">All brands</option>
          {discovery.brands.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <div className="cx-store__price-filter">
        <span>Price range</span>
        <label>
          From
          <input
            min={0}
            type="number"
            value={filters.minPrice ?? ""}
            onChange={(event) =>
              onFilters({ ...filters, minPrice: numberOrNull(event.target.value) })
            }
            placeholder={String(discovery.priceRange.minimum)}
          />
        </label>
        <label>
          To
          <input
            min={0}
            type="number"
            value={filters.maxPrice ?? ""}
            onChange={(event) =>
              onFilters({ ...filters, maxPrice: numberOrNull(event.target.value) })
            }
            placeholder={String(discovery.priceRange.maximum)}
          />
        </label>
      </div>
      <label>
        Sort by
        <select
          value={filters.sort}
          onChange={(event) =>
            onFilters({ ...filters, sort: event.target.value as StorefrontFilters["sort"] })
          }
        >
          <option value="featured">Featured</option>
          <option value="name">Product name</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="discount">Largest saving</option>
        </select>
      </label>
      <button
        onClick={() =>
          onFilters({
            brand: "",
            category: "",
            maxPrice: null,
            minPrice: null,
            scope: "all",
            search: "",
            sort: "featured"
          })
        }
      >
        Reset all filters
      </button>
    </aside>
  );
}

export function CollectionFilter({
  categories,
  filters,
  onFilters
}: {
  categories: StorefrontDiscovery["categories"];
  filters: StorefrontFilters;
  onFilters: (value: StorefrontFilters) => void;
}) {
  const collections = collectionDefinitions.map((collection) => ({
    ...collection,
    value: resolveCollectionValue(categories, collection)
  }));
  return (
    <nav className="cx-store__collection-filter" aria-label="Filter product collections">
      <div>
        {collections.map((collection) => {
          const deals = collection.name === "Deals";
          const active = deals
            ? filters.sort === "discount"
            : filters.category === collection.value && filters.sort !== "discount";
          return (
            <button
              aria-pressed={active}
              className={active ? "is-active" : undefined}
              key={collection.name}
              onClick={() =>
                onFilters({
                  ...filters,
                  category: collection.value,
                  sort: deals ? "discount" : "featured"
                })
              }
              type="button"
            >
              <StorefrontCollectionIcon name={collection.name} />
              <span>{collection.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const collectionDefinitions = [
  { aliases: [], name: "All Collections" },
  { aliases: ["laptop", "notebook"], name: "Laptops" },
  { aliases: ["desktop", "computer", "aio", "workstation"], name: "Desktop Computers" },
  { aliases: ["monitor", "display"], name: "Monitors" },
  { aliases: ["accessor"], name: "Accessories" },
  { aliases: ["printer", "scanner"], name: "Printers" },
  { aliases: ["cable", "connector", "adapter"], name: "Cables & Connectors" },
  { aliases: [], name: "Deals" }
] as const;

function resolveCollectionValue(
  categories: StorefrontDiscovery["categories"],
  collection: (typeof collectionDefinitions)[number]
) {
  if (collection.name === "All Collections" || collection.name === "Deals") return "";
  return (
    categories.find((category) =>
      collection.aliases.some((alias) => category.name.toLowerCase().includes(alias))
    )?.name ?? collection.name
  );
}

export function ProductCard({
  brandName = "",
  eagerImage = false,
  product,
  whatsappNumber
}: {
  brandName?: string | undefined;
  eagerImage?: boolean | undefined;
  product: StorefrontProduct;
  whatsappNumber?: string | null | undefined;
}) {
  const metadata = [product.brand, product.category].filter(Boolean).join(" · ");
  const priced = hasStorefrontPrice(product.price);
  return (
    <article className="cx-product-card">
      <a href={`/shop/product/${product.slug}`}>
        <div className="cx-product-card__image">
          {product.featured ? <span>Featured</span> : null}
          <img
            alt={product.imageAlt}
            decoding="async"
            loading={eagerImage ? "eager" : "lazy"}
            src={product.imageUrl}
            sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 25vw"
            srcSet={responsiveImageSrcSet(product.imageUrl, [320, 480, 640, 960])}
            height={640}
            width={640}
          />
        </div>
        <div className="cx-product-card__copy">
          {metadata ? <small>{metadata}</small> : null}
          <h3>{product.name}</h3>
          {product.shortDescription ? <p>{product.shortDescription}</p> : null}
        </div>
      </a>
      <div className="cx-product-card__actions">
        {priced ? (
          <div className="cx-product-card__price">
            <strong>{money(product.price)}</strong>
            {hasStorefrontPrice(product.compareAtPrice) ? (
              <del>{money(product.compareAtPrice ?? product.price)}</del>
            ) : null}
          </div>
        ) : null}
        <a
          className="cx-product-card__enquiry"
          href={whatsappLink(
            `Hello ${brandName}, please share details for ${product.name}.`,
            whatsappNumber
          )}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircleIcon size={16} /> Enquire
        </a>
      </div>
    </article>
  );
}

/* Redesigned HomeClosingCta matching the middle banner in the design */
export function HomeClosingCta() {
  return (
    <section className="cx-store__closing-cta">
      {/* Decorative ambient background */}
      <div className="cx-store__closing-cta-bg" aria-hidden="true">
        <div className="cx-store__closing-cta-edge-left" />
        <div className="cx-store__closing-cta-edge-right" />
        <div className="cx-store__closing-cta-center-glow" />
        <svg className="cx-store__closing-cta-rings" viewBox="0 0 800 240" fill="none">
          <circle cx="400" cy="120" r="110" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1.5" />
          <circle cx="400" cy="120" r="160" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
          <circle cx="400" cy="120" r="210" stroke="rgba(56, 189, 248, 0.04)" strokeWidth="1" />
        </svg>
      </div>

      {/* Dot Grid Accents on Left and Right */}
      <div className="cx-store__closing-cta-dots cx-store__closing-cta-dots-left" aria-hidden="true">
        <DotGridGraphic />
      </div>
      <div className="cx-store__closing-cta-dots cx-store__closing-cta-dots-right" aria-hidden="true">
        <DotGridGraphic />
      </div>

      <div className="cx-store__closing-cta-copy">
        <span>Ready when you are</span>
        <h2>Find technology that fits the way you work.</h2>
        <p>Compare dependable systems, accessories, and practical support in one place.</p>
        <div className="cx-store__closing-cta-underline" aria-hidden="true" />
      </div>

      <div className="cx-store__closing-cta-graphic" aria-hidden="true">
        <WorkspaceIsometricIllustration />
      </div>

      <div className="cx-store__closing-cta-action">
        <a className="cx-store__closing-cta-btn" href="/shop">
          Browse all products <ArrowUpRightIcon />
        </a>
      </div>
    </section>
  );
}

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 480);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <button
      aria-label="Back to top"
      className={`cx-store__back-to-top${visible ? " is-visible" : ""}`}
      onClick={() => window.scrollTo({ behavior: "smooth", top: 0 })}
      tabIndex={visible ? 0 : -1}
      type="button"
    >
      <ArrowUpIcon />
    </button>
  );
}

export function StoreFooter({
  branding,
  navigation
}: {
  branding: StorefrontBranding | null;
  navigation: StorefrontSiteNavigation | null;
}) {
  const brandTitle = branding?.brandName || "cxsun";
  const copyrightText =
    navigation?.copyrightText.trim() ||
    `© ${new Date().getFullYear()} ${brandTitle}. All rights reserved.`;
  const poweredByText = navigation?.poweredByText.trim() || "Powered by Logicx Softwares";
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mobileOpenSections, setMobileOpenSections] = useState<Record<string, boolean>>({
    Shop: false,
    Company: false,
    Help: false
  });

  const toggleMobileSection = (section: string) => {
    setMobileOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const subscribe = () => {
    if (!newsletterEmail) return;
    setSubscribed(true);
    window.open(
      whatsappLink(
        `Hello ${brandTitle}, please add ${newsletterEmail} to the latest-deals update list.`,
        branding?.primaryPhone
      ),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const navColumns = [
    {
      title: "Shop",
      links: [
        { label: "All products", href: "/shop" },
        { label: "Promotions", href: "/#promotions" },
        { label: "Solutions", href: "/features" },
        { label: "Brands", href: "/#brands" },
        { label: "New arrivals", href: "/shop?sort=newest" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Campaigns & events", href: "/#campaigns-events" },
        { label: "Team", href: "/team" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Help",
      links: [
        { label: "Shipping", href: "/support" },
        { label: "Returns & refunds", href: "/support" },
        { label: "Order help", href: "/support" },
        { label: "Product support", href: "/support" },
        { label: "FAQs", href: "/support" }
      ]
    }
  ];

  return (
    <>
      <StoreBenefitsBar />
      <footer className="cx-store-luxury-footer">
        {/* Tier 1: Brand Info + Navigation Columns + Visual Area */}
        <div className="cx-footer-top-tier">
          {/* Brand Info Column */}
          <div className="cx-footer-brand-col">
            <a className="cx-footer-logo-link" href="/shop">
              <span className="cx-footer-wordmark">{brandTitle}</span>
            </a>
            <span className="cx-footer-tagline">
              {navigation?.tagline || "Your Technology Partner"}
            </span>
            <p className="cx-footer-about">
              {navigation?.about ||
                "Quality products, expert guidance, and reliable support for your home, office, and business."}
            </p>

            {/* 3 Dark Feature Badges */}
            <div className="cx-footer-feature-badges" aria-label="Store strengths">
              <div className="cx-footer-badge-pill">
                <ShieldIcon className="cx-footer-badge-icon" aria-hidden="true" />
                <span>Trusted Products</span>
              </div>
              <div className="cx-footer-badge-pill">
                <HeadphonesIcon className="cx-footer-badge-icon" aria-hidden="true" />
                <span>Expert Support</span>
              </div>
              <div className="cx-footer-badge-pill">
                <CogIcon className="cx-footer-badge-icon" aria-hidden="true" />
                <span>Better Business Tech</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns (Desktop: 3 columns with right chevrons; Mobile: accordions) */}
          <div className="cx-footer-nav-grid">
            {navColumns.map((col) => (
              <div className="cx-footer-nav-col" key={col.title}>
                <button
                  type="button"
                  className="cx-footer-nav-toggle"
                  onClick={() => toggleMobileSection(col.title)}
                  aria-expanded={mobileOpenSections[col.title]}
                >
                  <span className="cx-footer-col-title">{col.title}</span>
                  <ChevronDownIcon
                    className={`cx-footer-accordion-chevron${
                      mobileOpenSections[col.title] ? " is-open" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <ul
                  className={`cx-footer-link-list${
                    mobileOpenSections[col.title] ? " is-mobile-open" : ""
                  }`}
                >
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="cx-footer-nav-link">
                        <span>{link.label}</span>
                        <ChevronRightIcon className="cx-footer-link-chevron" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Visual Graphic Area */}
          <div className="cx-footer-graphic-col" aria-hidden="true">
            <div className="cx-footer-graphic-canvas">
              <FooterDeskWorkspaceVisual />
              <span className="cx-footer-calligraphy">
                Better Technology
                <br />
                Together
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2: Middle Utility Bar (Newsletter + Payment types + Socials) */}
        <div className="cx-footer-utility-tier">
          {/* Newsletter / Stay updated */}
          <div className="cx-footer-updates-block">
            <strong className="cx-footer-updates-title">Stay updated</strong>
            <p className="cx-footer-updates-sub">
              Get the latest deals, launches and practical buying updates.
            </p>
            <form
              className="cx-footer-newsletter-form"
              onSubmit={(event) => {
                event.preventDefault();
                subscribe();
              }}
            >
              <div className="cx-footer-input-wrap">
                <MailIcon className="cx-footer-mail-icon" aria-hidden="true" />
                <input
                  aria-label="Email address for deal updates"
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="Enter your email address"
                  required
                  type="email"
                  value={newsletterEmail}
                />
              </div>
              <button className="cx-footer-signup-btn" type="submit">
                <span>{subscribed ? "Subscribed" : "Sign up"}</span>
                <ArrowRightIcon aria-hidden="true" />
              </button>
            </form>
          </div>

          <div className="cx-footer-vert-divider" aria-hidden="true" />

          {/* Supported payment types */}
          <div className="cx-footer-payments-block">
            <span className="cx-footer-utility-heading">Supported payment types</span>
            <div className="cx-footer-payment-badges" aria-label="Supported payment types">
              <div className="cx-footer-payment-chip" title="Debit & Credit Cards">
                <CreditCardIcon />
              </div>
              <div className="cx-footer-payment-chip" title="Visa">
                <span className="cx-payment-visa-text">VISA</span>
              </div>
              <div className="cx-footer-payment-chip" title="Mastercard">
                <span className="cx-payment-mc-circles" aria-hidden="true">
                  <span className="cx-payment-mc-red" />
                  <span className="cx-payment-mc-orange" />
                </span>
              </div>
              <div className="cx-footer-payment-chip" title="UPI">
                <span className="cx-payment-upi-text">UPI</span>
              </div>
              <div className="cx-footer-payment-chip" title="Google Pay">
                <span className="cx-payment-gpay-text">GPay</span>
              </div>
              <div className="cx-footer-payment-chip" title="Paytm">
                <span className="cx-payment-paytm-text">Paytm</span>
              </div>
            </div>
          </div>

          <div className="cx-footer-vert-divider" aria-hidden="true" />

          {/* Follow us */}
          <div className="cx-footer-social-block">
            <span className="cx-footer-utility-heading">Follow us</span>
            <div className="cx-footer-social-row" aria-label="Social media links">
              <a
                href={
                  navigation?.socialLinks.find((s) => s.label.toLowerCase() === "instagram")?.href ||
                  "#"
                }
                className="cx-footer-social-circle"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <StorefrontSocialIcon label="Instagram" />
              </a>
              <a
                href={
                  navigation?.socialLinks.find((s) => s.label.toLowerCase() === "youtube")?.href || "#"
                }
                className="cx-footer-social-circle"
                aria-label="YouTube"
                target="_blank"
                rel="noreferrer"
              >
                <StorefrontSocialIcon label="YouTube" />
              </a>
              <a
                href={
                  navigation?.socialLinks.find((s) => s.label.toLowerCase() === "linkedin")?.href ||
                  "#"
                }
                className="cx-footer-social-circle"
                aria-label="LinkedIn"
                target="_blank"
                rel="noreferrer"
              >
                <StorefrontSocialIcon label="LinkedIn" />
              </a>
              <a
                href={whatsappLink(
                  `Hello ${brandTitle}, I need help choosing a product.`,
                  branding?.primaryPhone
                )}
                className="cx-footer-social-circle"
                aria-label="WhatsApp"
                target="_blank"
                rel="noreferrer"
              >
                <StorefrontSocialIcon label="WhatsApp" />
              </a>
            </div>
          </div>
        </div>

        {/* Tier 3: Bottom Legal & Region Bar */}
        <div className="cx-footer-bottom-bar">
          <div className="cx-footer-legal-row">
            <span>{copyrightText}</span>
            <span className="cx-footer-legal-sep">•</span>
            <a href="/terms">Terms of Use</a>
            <span className="cx-footer-legal-sep">•</span>
            <a href="/privacy">Privacy Policy</a>
            <span className="cx-footer-legal-sep">•</span>
            <a href="/cookies">Cookie Settings</a>
          </div>

          <div className="cx-footer-region-powered">
            <button
              type="button"
              className="cx-footer-country-pill"
              aria-label="Selected region: India"
            >
              <Globe2Icon className="cx-footer-globe-icon" aria-hidden="true" />
              <span>India (IN)</span>
              <ChevronDownIcon className="cx-footer-globe-chevron" aria-hidden="true" />
            </button>

            <a
              className="cx-footer-powered-link"
              href="https://logicx.in"
              rel="noreferrer"
              target="_blank"
            >
              {poweredByText}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

/* Redesigned StoreBenefitsBar matching the 4 features in the design */
export function StoreBenefitsBar() {
  const benefits = [
    {
      badgeBg: "#e0f2fe",
      badgeColor: "#0f172a",
      description: "Delivery options confirmed for your location",
      icon: TruckIcon,
      title: "Dependable delivery"
    },
    {
      badgeBg: "#dcfce7",
      badgeColor: "#0f172a",
      description: "Clear guidance for eligible returns",
      icon: RotateCcwIcon,
      title: "Easy returns"
    },
    {
      badgeBg: "#e0f2fe",
      badgeColor: "#0f172a",
      description: "Protected checkout and payment handling",
      icon: ShieldIcon,
      title: "Secure payments"
    },
    {
      badgeBg: "#fef3c7",
      badgeColor: "#0f172a",
      description: "Local help for products, orders, and service",
      icon: HeadphonesIcon,
      title: "Customer support"
    }
  ];
  return (
    <aside className="cx-store__benefits-bar" aria-label="Store service benefits">
      {benefits.map((benefit) => {
        const Icon = benefit.icon;
        return (
          <div className="cx-store__benefit-item" key={benefit.title}>
            <div
              className="cx-store__benefit-icon-badge"
              style={{ background: benefit.badgeBg, color: benefit.badgeColor }}
            >
              <Icon aria-hidden="true" />
            </div>
            <div className="cx-store__benefit-copy">
              <strong>{benefit.title}</strong>
              <small>{benefit.description}</small>
            </div>
          </div>
        );
      })}
    </aside>
  );
}

function StoreBrandMark({
  branding,
  dark = false
}: {
  branding: StorefrontBranding | null;
  dark?: boolean;
}) {
  const source = dark ? (branding?.logoDarkUrl ?? branding?.logoUrl) : branding?.logoUrl;
  if (!source) return null;
  return <img alt="" aria-hidden="true" className="cx-store__brand-mark" src={source} />;
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <section className="cx-store__footer-column">
      <strong>{title}</strong>
      {links.map(([label, href]) => (
        <a href={href} key={href}>
          {label}
        </a>
      ))}
    </section>
  );
}

const defaultFooterGroups = [
  { title: "Shop", links: [{ label: "All products", href: "/shop" }] },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" }
    ]
  },
  {
    title: "Help",
    links: [
      { label: "Order help", href: "/order-help" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" }
    ]
  }
];

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="cx-store__section-title">
      <div>
        <span>{label}</span>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}

/* ==========================================================================
   RICH VECTOR ILLUSTRATIONS (Matching Design Screenshot)
   ========================================================================== */

function SupportDeskIllustration() {
  return (
    <svg viewBox="0 0 220 120" fill="none" className="cx-illustration-desk" aria-hidden="true">
      <defs>
        <radialGradient id="warmGlow" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="110" cy="108" rx="90" ry="10" fill="url(#warmGlow)" />

      {/* Desk surface */}
      <rect x="30" y="78" width="160" height="6" rx="3" fill="#f1f5f9" />
      <rect x="30" y="82" width="160" height="3" rx="1.5" fill="#e2e8f0" />

      {/* Monitor stand */}
      <rect x="99" y="60" width="22" height="18" rx="2" fill="#cbd5e1" />
      <rect x="88" y="76" width="44" height="5" rx="2.5" fill="#94a3b8" />

      {/* Monitor screen */}
      <rect x="52" y="18" width="116" height="76" rx="8" fill="#1e293b" />
      <rect x="56" y="22" width="108" height="60" rx="5" fill="#0f172a" />
      {/* Screen glow/content */}
      <rect x="56" y="22" width="108" height="60" rx="5" fill="#38bdf8" fillOpacity="0.06" />
      {/* UI bars on screen */}
      <rect x="64" y="32" width="40" height="4" rx="2" fill="#38bdf8" fillOpacity="0.8" />
      <rect x="64" y="42" width="60" height="3" rx="1.5" fill="#475467" />
      <rect x="64" y="49" width="44" height="3" rx="1.5" fill="#334155" />
      <rect x="64" y="56" width="52" height="3" rx="1.5" fill="#334155" />
      {/* Green status dot */}
      <circle cx="148" cy="34" r="4" fill="#10b981" />

      {/* Chat bubble left */}
      <rect x="14" y="22" width="26" height="18" rx="5" fill="#f59e0b" />
      <polygon points="18,40 14,46 24,40" fill="#f59e0b" />
      <circle cx="21" cy="31" r="1.5" fill="#fff" />
      <circle cx="27" cy="31" r="1.5" fill="#fff" />
      <circle cx="33" cy="31" r="1.5" fill="#fff" />

      {/* Chat bubble right */}
      <rect x="178" y="28" width="24" height="16" rx="4" fill="#10b981" />
      <polygon points="196,44 202,44 200,48" fill="#10b981" />
      <circle cx="184" cy="36" r="1.2" fill="#fff" />
      <circle cx="190" cy="36" r="1.2" fill="#fff" />
      <circle cx="196" cy="36" r="1.2" fill="#fff" />

      {/* Keyboard */}
      <rect x="64" y="84" width="72" height="16" rx="3" fill="#e2e8f0" />
      <rect x="68" y="88" width="8" height="4" rx="1" fill="#cbd5e1" />
      <rect x="79" y="88" width="8" height="4" rx="1" fill="#cbd5e1" />
      <rect x="90" y="88" width="8" height="4" rx="1" fill="#cbd5e1" />
      <rect x="101" y="88" width="8" height="4" rx="1" fill="#cbd5e1" />
      <rect x="112" y="88" width="8" height="4" rx="1" fill="#cbd5e1" />
      <rect x="123" y="88" width="9" height="4" rx="1" fill="#cbd5e1" />
      <rect x="68" y="95" width="4" height="3" rx="1" fill="#cbd5e1" />
      <rect x="75" y="95" width="40" height="3" rx="1" fill="#94a3b8" />
      <rect x="118" y="95" width="4" height="3" rx="1" fill="#cbd5e1" />

      {/* Headset icon on screen */}
      <path d="M106 34 a10 10 0 0 1 20 0" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="104" y="33" width="5" height="8" rx="2.5" fill="#38bdf8" />
      <rect x="123" y="33" width="5" height="8" rx="2.5" fill="#38bdf8" />
    </svg>
  );
}

function WorkspaceIsometricIllustration() {
  return (
    <svg viewBox="0 0 360 155" fill="none" className="cx-illustration-workspace" aria-hidden="true">
      <defs>
        <radialGradient id="blueShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="180" cy="138" rx="155" ry="14" fill="url(#blueShadow)" />

      {/* === LEFT LAPTOP === */}
      {/* Base */}
      <rect x="20" y="98" width="90" height="6" rx="3" fill="#e2e8f0" />
      <rect x="28" y="96" width="74" height="3" rx="1.5" fill="#f1f5f9" />
      {/* Screen bezel */}
      <rect x="28" y="40" width="76" height="58" rx="6" fill="#1e293b" />
      <rect x="32" y="44" width="68" height="50" rx="4" fill="#0f172a" />
      {/* Screen content */}
      <rect x="36" y="50" width="36" height="3" rx="1.5" fill="#38bdf8" fillOpacity="0.9" />
      <rect x="36" y="57" width="52" height="2.5" rx="1.2" fill="#334155" />
      <rect x="36" y="63" width="40" height="2.5" rx="1.2" fill="#334155" />
      <rect x="36" y="69" width="48" height="2.5" rx="1.2" fill="#334155" />
      <rect x="36" y="75" width="32" height="2.5" rx="1.2" fill="#334155" />
      <circle cx="90" cy="54" r="5" fill="#10b981" />
      {/* Hinge */}
      <rect x="28" y="96" width="76" height="3" rx="1.5" fill="#94a3b8" />

      {/* === CENTER MONITOR === */}
      {/* Stand base */}
      <rect x="158" y="122" width="44" height="6" rx="3" fill="#94a3b8" />
      <rect x="177" y="98" width="6" height="26" rx="3" fill="#94a3b8" />
      {/* Monitor bezel */}
      <rect x="136" y="22" width="88" height="78" rx="8" fill="#1e293b" />
      <rect x="140" y="26" width="80" height="68" rx="5" fill="#0f172a" />
      {/* Screen wallpaper */}
      <rect x="140" y="26" width="80" height="60" rx="5" fill="#0f172a" />
      <rect x="140" y="26" width="80" height="14" rx="5" fill="#1e40af" />
      {/* Taskbar */}
      <rect x="140" y="82" width="80" height="9" rx="2" fill="#111827" />
      {/* Windows on desktop */}
      <rect x="144" y="44" width="32" height="22" rx="3" fill="#1d4ed8" fillOpacity="0.85" />
      <rect x="144" y="44" width="32" height="5" rx="2" fill="#3b82f6" />
      <rect x="181" y="44" width="34" height="36" rx="3" fill="#064e3b" fillOpacity="0.8" />
      <rect x="181" y="44" width="34" height="5" rx="2" fill="#10b981" />
      {/* Taskbar icons */}
      <circle cx="148" cy="87" r="2.5" fill="#3b82f6" />
      <circle cx="157" cy="87" r="2.5" fill="#10b981" />
      <circle cx="166" cy="87" r="2.5" fill="#f59e0b" />

      {/* === RIGHT PERIPHERALS === */}
      {/* Speaker */}
      <rect x="244" y="68" width="24" height="52" rx="6" fill="#1e293b" />
      <rect x="248" y="74" width="16" height="16" rx="8" fill="#334155" />
      <circle cx="256" cy="82" r="5" fill="#475467" />
      <circle cx="256" cy="82" r="2.5" fill="#64748b" />
      <rect x="250" y="98" width="12" height="2" rx="1" fill="#334155" />
      <rect x="250" y="103" width="12" height="2" rx="1" fill="#334155" />
      <rect x="250" y="108" width="12" height="2" rx="1" fill="#334155" />
      {/* Power LED */}
      <circle cx="256" cy="115" r="2" fill="#10b981" />

      {/* WiFi signal */}
      <path d="M296 42 a20 20 0 0 1 28 0" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M300 49 a12 12 0 0 1 20 0" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M305 56 a7 7 0 0 1 10 0" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <circle cx="310" cy="63" r="3" fill="#38bdf8" />

      {/* Router */}
      <rect x="286" y="96" width="50" height="28" rx="6" fill="#0f172a" />
      <rect x="292" y="104" width="8" height="12" rx="4" fill="#1e293b" />
      <rect x="316" y="104" width="8" height="12" rx="4" fill="#1e293b" />
      <circle cx="298" cy="114" r="2" fill="#10b981" />
      <circle cx="306" cy="114" r="2" fill="#10b981" />
      <circle cx="314" cy="114" r="2" fill="#f59e0b" />
    </svg>
  );
}

function DotGridGraphic() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="cx-dot-grid" aria-hidden="true">
      <circle cx="6" cy="6" r="2" fill="#38bdf8" />
      <circle cx="18" cy="6" r="2" fill="#38bdf8" />
      <circle cx="30" cy="6" r="2" fill="#38bdf8" />
      <circle cx="42" cy="6" r="2" fill="#38bdf8" />
      <circle cx="6" cy="18" r="2" fill="#38bdf8" />
      <circle cx="18" cy="18" r="2" fill="#38bdf8" />
      <circle cx="30" cy="18" r="2" fill="#38bdf8" />
      <circle cx="42" cy="18" r="2" fill="#38bdf8" />
      <circle cx="6" cy="30" r="2" fill="#38bdf8" />
      <circle cx="18" cy="30" r="2" fill="#38bdf8" />
      <circle cx="30" cy="30" r="2" fill="#38bdf8" />
      <circle cx="42" cy="30" r="2" fill="#38bdf8" />
      <circle cx="6" cy="42" r="2" fill="#38bdf8" />
      <circle cx="18" cy="42" r="2" fill="#38bdf8" />
      <circle cx="30" cy="42" r="2" fill="#38bdf8" />
      <circle cx="42" cy="42" r="2" fill="#38bdf8" />
    </svg>
  );
}

/* ==========================================================================
   Trust Section Visuals (25+ Years / Slide Concept)
   ========================================================================== */

function TrustDeskPedestalVisual({ activeIndex = 0 }: { activeIndex?: number }) {
  return (
    <svg viewBox="70 20 375 240" fill="none" className="cx-trust-pedestal-svg" aria-hidden="true">
      <defs>
        <linearGradient id="emeraldWave" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="45%" stopColor="#059669" />
          <stop offset="85%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>
        <linearGradient id="serverGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Subtle Mint Dotted Grid in Background */}
      <g opacity="0.4">
        <circle cx="85" cy="50" r="2.2" fill="#10b981" />
        <circle cx="103" cy="50" r="2.2" fill="#10b981" />
        <circle cx="121" cy="50" r="2.2" fill="#10b981" />
        <circle cx="85" cy="68" r="2.2" fill="#10b981" />
        <circle cx="103" cy="68" r="2.2" fill="#10b981" />
        <circle cx="121" cy="68" r="2.2" fill="#10b981" />
        <circle cx="85" cy="86" r="2.2" fill="#10b981" />
        <circle cx="103" cy="86" r="2.2" fill="#10b981" />
        <circle cx="121" cy="86" r="2.2" fill="#10b981" />
      </g>

      {/* Stepped 3D Pedestal Blocks (Shared across all 5 slides) */}
      {/* Soft ground shadow */}
      <ellipse cx="260" cy="245" rx="170" ry="24" fill="#cbd5e1" opacity="0.45" />

      {/* Lower Base Step */}
      <polygon points="110,210 270,185 415,210 250,235" fill="#f8fafc" />
      <polygon points="110,210 250,235 250,250 110,225" fill="#e2e8f0" />
      <polygon points="250,235 415,210 415,225 250,250" fill="#cbd5e1" />

      {/* Higher Right Step (Supporting Plant) */}
      <polygon points="320,148 395,136 432,152 355,164" fill="#ffffff" />
      <polygon points="320,148 355,164 355,215 320,199" fill="#f1f5f9" />
      <polygon points="355,164 432,152 432,203 355,215" fill="#e2e8f0" />

      {/* Potted Plant on higher right step */}
      <path d="M365 145l3-28h22l3 28z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <ellipse cx="379" cy="117" rx="11" ry="3.5" fill="#3f2316" />
      {/* Upright Green Leaves */}
      <path d="M379 116c-4-24-12-38-22-48 4 19 10 34 20 48z" fill="#15803d" />
      <path d="M379 116c4-24 14-38 26-48-5 19-12 34-22 48z" fill="#166534" />
      <path d="M379 116c0-28 2-44 6-56-1 20-3 38-6 56z" fill="#22c55e" />
      <path d="M379 116c-8-20-18-30-30-36 9 15 18 26 26 36z" fill="#15803d" />
      <path d="M379 116c8-20 20-30 32-36-9 15-19 26-28 36z" fill="#4ade80" />

      {/* Floating Service Badge Icon */}
      {activeIndex === 0 && (
        <g>
          <rect x="225" y="32" width="24" height="20" rx="4" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.3" />
          <circle cx="237" cy="41" r="4.5" fill="none" stroke="#059669" strokeWidth="1.1" />
          <path d="M234 51h6" stroke="#10b981" strokeWidth="1.5" />
        </g>
      )}
      {activeIndex === 1 && (
        <g>
          <rect x="225" y="32" width="24" height="24" rx="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.3" />
          <circle cx="237" cy="38" r="2.5" fill="#059669" />
          <circle cx="231" cy="48" r="2.2" fill="#059669" />
          <circle cx="243" cy="48" r="2.2" fill="#059669" />
          <path d="M237 40.5v4M237 44.5h-6v2M237 44.5h6v2" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}
      {activeIndex === 2 && (
        <g>
          <rect x="225" y="32" width="24" height="24" rx="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.3" />
          <path d="M239 37a3.5 3.5 0 0 0-4.5 4.5l-5 5a1.2 1.2 0 1 0 1.7 1.7l5-5A3.5 3.5 0 0 0 239 37z" fill="#059669" />
        </g>
      )}
      {activeIndex === 3 && (
        <g>
          <rect x="225" y="32" width="24" height="24" rx="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.3" />
          <path d="M237 36l5 2v4c0 3.5-2.2 6.5-5 7.5-2.8-1-5-4-5-7.5v-4l5-2z" fill="#059669" />
        </g>
      )}
      {activeIndex === 4 && (
        <g>
          <rect x="225" y="32" width="24" height="24" rx="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.3" />
          <rect x="229" y="37" width="16" height="4" rx="1" fill="#059669" />
          <rect x="229" y="43" width="16" height="4" rx="1" fill="#059669" />
          <rect x="229" y="49" width="16" height="4" rx="1" fill="#059669" />
          <circle cx="232" cy="39" r="0.75" fill="#ffffff" />
          <circle cx="232" cy="45" r="0.75" fill="#ffffff" />
          <circle cx="232" cy="51" r="0.75" fill="#ffffff" />
        </g>
      )}

      {/* Floating Gear Icon (Left side) */}
      <circle cx="150" cy="135" r="9.5" fill="#f0fdf4" stroke="#10b981" strokeWidth="1.3" />
      <path d="M150 129v2M150 139v2M144 135h2M154 135h2" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />

      {/* DYNAMIC PEDESTAL CENTER ITEMS PER ACTIVE SLIDE */}
      {/* 01: Computers & Laptops */}
      {activeIndex === 0 && (
        <g>
          {/* Laptop Deck */}
          <polygon points="135,192 270,172 345,190 210,210" fill="#cbd5e1" />
          <polygon points="137,190 268,171 341,188 208,207" fill="#f8fafc" />
          {/* Trackpad */}
          <polygon points="212,194 246,188 256,193 222,199" fill="#cbd5e1" opacity="0.8" />
          {/* Keyboard well */}
          <polygon points="160,185 264,170 322,183 216,198" fill="#1e293b" opacity="0.88" />

          {/* Laptop Screen (Thin black bezel) */}
          <polygon points="186,76 288,60 288,172 186,188" fill="#0f172a" />
          <polygon points="188,79 285,63 285,169 188,185" fill="#022c22" />
          {/* Emerald Green Wave Wallpaper */}
          <g clipPath="url(#laptopScreenClip)">
            <clipPath id="laptopScreenClip">
              <polygon points="188,79 285,63 285,169 188,185" />
            </clipPath>
            <rect x="175" y="55" width="125" height="145" fill="#022c22" />
            <path
              d="M185 168 C220 148, 230 118, 262 80 C278 64, 288 48, 292 38 L292 108 C270 135, 245 160, 208 185 Z"
              fill="url(#emeraldWave)"
            />
            <path
              d="M190 182 C230 156, 252 126, 278 90 L292 112 C265 142, 235 172, 202 188 Z"
              fill="#34d399"
              opacity="0.85"
            />
          </g>
          {/* Camera dot */}
          <circle cx="237" cy="71" r="1.2" fill="#64748b" />

          {/* Black Over-Ear Headphones resting on pedestal */}
          <path d="M192 210c-16-19-13-44 6-58 17-12 40-8 52 10" stroke="#0f172a" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <ellipse cx="189" cy="216" rx="9.5" ry="14.5" fill="#1e293b" transform="rotate(-15 189 216)" />
          <ellipse cx="189" cy="216" rx="6.5" ry="10.5" fill="#0f172a" transform="rotate(-15 189 216)" />
          <ellipse cx="242" cy="214" rx="9.5" ry="14.5" fill="#1e293b" transform="rotate(15 242 214)" />
          <ellipse cx="242" cy="214" rx="6.5" ry="10.5" fill="#0f172a" transform="rotate(15 242 214)" />
        </g>
      )}

      {/* 02: Business IT solutions (Wi-Fi Router, Switch & Radiating Signals) */}
      {activeIndex === 1 && (
        <g>
          {/* Network Router Base */}
          <polygon points="160,196 265,178 335,192 230,212" fill="#0f172a" />
          <polygon points="162,194 263,177 331,190 228,210" fill="#1e293b" />
          {/* Top Panel Accent */}
          <polygon points="175,190 255,178 315,188 235,203" fill="#334155" />
          {/* Status LEDs */}
          <circle cx="195" cy="201" r="2" fill="#10b981" />
          <circle cx="205" cy="200" r="2" fill="#10b981" />
          <circle cx="215" cy="198" r="2" fill="#34d399" />
          <circle cx="225" cy="197" r="2" fill="#38bdf8" />
          <circle cx="235" cy="196" r="2" fill="#10b981" />

          {/* Antennas */}
          <line x1="200" y1="184" x2="190" y2="108" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="190" cy="108" r="3" fill="#10b981" />
          <line x1="270" y1="176" x2="280" y2="102" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="280" cy="102" r="3" fill="#10b981" />

          {/* Wi-Fi Wave Ripples */}
          <path d="M165 92a50 50 0 0 1 70 0" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" fill="none" />
          <path d="M150 78a74 74 0 0 1 100 0" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" fill="none" />
          <path d="M135 64a98 98 0 0 1 130 0" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" fill="none" />
        </g>
      )}

      {/* 03: Service and support (Diagnostic Monitor + Service Tools) */}
      {activeIndex === 2 && (
        <g>
          {/* Diagnostic Display Screen */}
          <polygon points="186,84 286,70 286,170 186,184" fill="#0f172a" />
          <polygon points="188,86 283,72 283,167 188,181" fill="#022c22" />
          {/* Health Graph Wave */}
          <path d="M190 140h15l8-25 12 40 10-20 14 15 15-30 18 20" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="235" cy="135" r="3" fill="#34d399" />
          <circle cx="264" cy="120" r="3" fill="#10b981" />

          {/* Display Base */}
          <polygon points="215,182 255,178 260,192 220,196" fill="#475467" />

          {/* Chrome Precision Wrench on Pedestal */}
          <path d="M140 215l48-24a7 7 0 0 0 2-9l-5-5a7 7 0 0 0-9 2l-48 24a5 5 0 0 0 12 12z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="180" cy="180" r="5" fill="#f8fafc" />

          {/* Support Headset */}
          <path d="M260 215c-12-16-10-38 5-50 15-10 35-6 46 8" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <ellipse cx="258" cy="220" rx="7" ry="11" fill="#1e293b" transform="rotate(-15 258 220)" />
          <ellipse cx="304" cy="216" rx="7" ry="11" fill="#1e293b" transform="rotate(15 304 216)" />
        </g>
      )}

      {/* 04: Security and access (Dome CCTV & Access Shield) */}
      {activeIndex === 3 && (
        <g>
          {/* High-Tech Dome CCTV Camera Body */}
          <ellipse cx="235" cy="130" rx="42" ry="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M193 130v15c0 14 19 25 42 25s42-11 42-25v-15" fill="#f1f5f9" />
          {/* Dark Glass Dome */}
          <ellipse cx="235" cy="150" rx="30" ry="24" fill="#020617" />
          <circle cx="235" cy="152" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="235" cy="152" r="6" fill="#059669" />
          <circle cx="233" cy="150" r="2" fill="#ffffff" />

          {/* Pulsing Emerald Security Ring */}
          <ellipse cx="235" cy="150" rx="38" ry="14" fill="none" stroke="#10b981" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.85" />

          {/* Wall-Mount Biometric Scanner */}
          <polygon points="140,192 185,178 185,216 140,230" fill="#0f172a" />
          <polygon points="143,195 182,182 182,212 143,225" fill="#1e293b" />
          <rect x="150" y="195" width="16" height="18" rx="2" fill="#022c22" stroke="#10b981" strokeWidth="1.2" />
          <path d="M154 204c3-3 8-3 10 0M156 207c2-2 5-2 6 0" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* 05: Managed infrastructure (Blade Server Units & Cloud Node) */}
      {activeIndex === 4 && (
        <g>
          {/* Server Unit 1 (Lower) */}
          <polygon points="160,206 270,188 335,200 225,220" fill="#0f172a" />
          <polygon points="160,206 225,220 225,208 160,194" fill="#1e293b" />
          <polygon points="225,220 335,200 335,188 225,208" fill="#334155" />
          {/* Green Status Dots */}
          <circle cx="178" cy="204" r="1.8" fill="#10b981" />
          <circle cx="186" cy="202" r="1.8" fill="#10b981" />
          <circle cx="194" cy="200" r="1.8" fill="#34d399" />
          <circle cx="202" cy="198" r="1.8" fill="#10b981" />

          {/* Server Unit 2 (Upper) */}
          <polygon points="160,180 270,162 335,174 225,194" fill="#0f172a" />
          <polygon points="160,180 225,194 225,182 160,168" fill="#1e293b" />
          <polygon points="225,194 335,174 335,162 225,182" fill="#334155" />
          {/* Green Status Dots */}
          <circle cx="178" cy="178" r="1.8" fill="#10b981" />
          <circle cx="186" cy="176" r="1.8" fill="#34d399" />
          <circle cx="194" cy="174" r="1.8" fill="#10b981" />
          <circle cx="202" cy="172" r="1.8" fill="#10b981" />

          {/* Cloud Sync Floating Node */}
          <ellipse cx="248" cy="118" rx="26" ry="14" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
          <path d="M236 122c-3 0-5-2-5-5a5 5 0 0 1 8-4c1-3 4-5 8-5 4 0 7 3 8 6a4 4 0 0 1 4 4c0 3-3 4-5 4z" fill="#059669" />
        </g>
      )}
    </svg>
  );
}

function TrustActiveCardLaptops() {
  return (
    <svg viewBox="0 0 340 210" fill="none" className="cx-trust-laptops-svg" aria-hidden="true">
      <defs>
        <linearGradient id="emeraldWaveFront" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#022c22" />
          <stop offset="35%" stopColor="#064e3b" />
          <stop offset="65%" stopColor="#059669" />
          <stop offset="85%" stopColor="#10b981" />
          <stop offset="95%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id="silverLid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="laptopGlassGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ground shadows beneath both laptops */}
      <ellipse cx="95" cy="188" rx="80" ry="14" fill="#94a3b8" opacity="0.35" />
      <ellipse cx="225" cy="192" rx="100" ry="16" fill="#64748b" opacity="0.3" />

      {/* REAR LAPTOP (Left side, showing silver aluminum lid & Apple-style logo) */}
      <g>
        {/* Base */}
        <polygon points="15,178 120,162 165,172 60,188" fill="#94a3b8" />
        <polygon points="17,176 118,161 162,170 58,186" fill="#e2e8f0" />

        {/* Lid (closed / rear angled) */}
        <polygon points="22,62 125,45 125,164 22,180" fill="#0f172a" />
        <polygon points="24,64 123,47 123,162 24,178" fill="url(#silverLid)" />

        {/* Apple-style minimalist logo */}
        <circle cx="74" cy="112" r="7" fill="#64748b" opacity="0.45" />

        {/* Beveled edge highlights */}
        <line x1="24" y1="64" x2="123" y2="47" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
        <line x1="24" y1="64" x2="24" y2="178" stroke="#cbd5e1" strokeWidth="1" />
      </g>

      {/* FRONT LAPTOP (Right-center, open MacBook with brilliant emerald green screen) */}
      <g>
        {/* Base / Keyboard deck */}
        <polygon points="85,174 240,150 325,168 170,196" fill="#94a3b8" />
        <polygon points="88,172 238,149 320,166 168,193" fill="#f1f5f9" />

        {/* Keyboard well */}
        <polygon points="120,168 232,151 285,162 172,182" fill="#0f172a" opacity="0.88" />
        {/* Trackpad */}
        <polygon points="172,184 212,178 224,183 184,190" fill="#cbd5e1" opacity="0.9" />

        {/* Display Lid Frame (Thin black bezel) */}
        <polygon points="122,34 268,16 268,154 122,172" fill="#0f172a" />

        {/* Display Screen */}
        <polygon points="125,38 264,20 264,150 125,168" fill="#022c22" />

        {/* Screen Artwork - Emerald Flow Waves */}
        <g clipPath="url(#frontScreenClip)">
          <clipPath id="frontScreenClip">
            <polygon points="125,38 264,20 264,150 125,168" />
          </clipPath>
          <rect x="115" y="10" width="160" height="170" fill="#022c22" />

          {/* Deep green layer */}
          <path
            d="M125 150 C165 125, 185 95, 230 45 C250 25, 260 15, 268 8 L268 80 C240 115, 205 145, 145 175 Z"
            fill="url(#emeraldWaveFront)"
          />

          {/* Bright emerald fluid ribbon */}
          <path
            d="M130 165 C175 130, 205 100, 245 60 L265 85 C225 125, 185 160, 140 180 Z"
            fill="#10b981"
            opacity="0.9"
          />

          {/* Mint neon crest */}
          <path
            d="M140 175 C190 140, 225 110, 260 80 L268 95 C235 130, 195 165, 150 185 Z"
            fill="#6ee7b7"
            opacity="0.75"
          />

          {/* Glass glare overlay */}
          <polygon points="125,38 264,20 180,160 125,168" fill="url(#laptopGlassGlow)" />
        </g>

        {/* Camera notch / dot */}
        <circle cx="195" cy="27" r="1.5" fill="#475467" />
      </g>
    </svg>
  );
}

/* ==========================================================================
   Footer Dark Workspace Visual ("Better Technology Together")
   ========================================================================== */

function FooterDeskWorkspaceVisual() {
  return (
    <svg viewBox="0 0 320 200" fill="none" className="cx-footer-desk-svg" aria-hidden="true">
      <defs>
        <linearGradient id="footerNeonRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Dotted Grid Background */}
      <g opacity="0.25">
        <circle cx="20" cy="40" r="1.5" fill="#38bdf8" />
        <circle cx="34" cy="40" r="1.5" fill="#38bdf8" />
        <circle cx="48" cy="40" r="1.5" fill="#38bdf8" />
        <circle cx="20" cy="54" r="1.5" fill="#38bdf8" />
        <circle cx="34" cy="54" r="1.5" fill="#38bdf8" />
        <circle cx="48" cy="54" r="1.5" fill="#38bdf8" />
        <circle cx="20" cy="68" r="1.5" fill="#38bdf8" />
        <circle cx="34" cy="68" r="1.5" fill="#38bdf8" />
        <circle cx="48" cy="68" r="1.5" fill="#38bdf8" />
      </g>

      {/* Soft Ground Shadow */}
      <ellipse cx="160" cy="175" rx="130" ry="20" fill="#000000" opacity="0.5" />

      {/* Desktop Monitor Behind */}
      <rect x="135" y="45" width="85" height="54" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <rect x="138" y="48" width="79" height="48" rx="2" fill="#020617" />
      <path d="M142 80c20-15 45-20 70-5v17h-70z" fill="#0369a1" opacity="0.3" />
      <rect x="174" y="99" width="7" height="15" fill="#475467" />
      <path d="M165 114h25v2h-25z" fill="#334155" />

      {/* Desk Potted Plant */}
      <path d="M52 142l3-18h16l3 18z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <ellipse cx="63" cy="124" rx="9" ry="2.5" fill="#0f172a" />
      <path d="M63 124c-3-15-8-24-16-30 3 12 7 21 14 30z" fill="#16a34a" />
      <path d="M63 124c3-15 10-24 18-30-3 12-8 21-15 30z" fill="#15803d" />
      <path d="M63 124c0-18 2-28 5-34-1 12-2 23-5 34z" fill="#4ade80" />

      {/* Modern Laptop (Front-center) */}
      <polygon points="85,150 205,128 260,142 140,164" fill="#334155" />
      <polygon points="88,148 203,127 255,140 138,161" fill="#475467" />
      <polygon points="144,152 172,147 180,151 152,156" fill="#1e293b" />
      <polygon points="105,145 195,128 235,138 145,155" fill="#090d16" />

      {/* Screen with Colorful Ribbons */}
      <polygon points="110,65 205,48 205,130 110,147" fill="#090d16" />
      <polygon points="112,68 202,51 202,127 112,144" fill="#020617" />
      <g clipPath="url(#footerScreenClip)">
        <clipPath id="footerScreenClip">
          <polygon points="112,68 202,51 202,127 112,144" />
        </clipPath>
        <rect x="100" y="40" width="115" height="115" fill="#020617" />
        <path
          d="M110 140 C135 120, 150 95, 180 65 L195 85 C165 115, 145 140, 115 155 Z"
          fill="url(#footerNeonRibbon)"
        />
        <path
          d="M125 145 C150 125, 170 105, 195 80 L205 95 C180 120, 155 145, 130 155 Z"
          fill="#38bdf8"
          opacity="0.75"
        />
      </g>

      {/* Sleek Black Over-Ear Headphones */}
      <path d="M210 165c-10-14-8-32 5-42 12-9 28-6 38 7" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <ellipse cx="207" cy="170" rx="7" ry="11" fill="#1e293b" transform="rotate(-15 207 170)" />
      <ellipse cx="207" cy="170" rx="5" ry="8" fill="#090d16" transform="rotate(-15 207 170)" />
      <ellipse cx="246" cy="168" rx="7" ry="11" fill="#1e293b" transform="rotate(15 246 168)" />
      <ellipse cx="246" cy="168" rx="5" ry="8" fill="#090d16" transform="rotate(15 246 168)" />
    </svg>
  );
}

/* ==========================================================================
   Summer Tech Upgrade Fest 3D Showcase Stage Visual
   ========================================================================== */

function SeasonFestStageVisual() {
  return (
    <svg viewBox="0 0 540 360" fill="none" className="cx-season-showcase-svg" aria-hidden="true">
      <defs>
        {/* Screen Neon Wallpaper Gradients */}
        <linearGradient id="neonFestRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4c0519" />
          <stop offset="25%" stopColor="#881337" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="75%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
        <linearGradient id="pedestalTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9f1239" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
      </defs>

      {/* Decorative Background Dots Grid (Top Right) */}
      <g opacity="0.45">
        <circle cx="440" cy="30" r="2.2" fill="#9f1239" />
        <circle cx="456" cy="30" r="2.2" fill="#9f1239" />
        <circle cx="472" cy="30" r="2.2" fill="#9f1239" />
        <circle cx="440" cy="46" r="2.2" fill="#9f1239" />
        <circle cx="456" cy="46" r="2.2" fill="#9f1239" />
        <circle cx="472" cy="46" r="2.2" fill="#9f1239" />
        <circle cx="440" cy="62" r="2.2" fill="#9f1239" />
        <circle cx="456" cy="62" r="2.2" fill="#9f1239" />
        <circle cx="472" cy="62" r="2.2" fill="#9f1239" />
      </g>

      {/* Decorative Background Rings / Arcs */}
      <circle cx="280" cy="230" r="140" stroke="#f43f5e" strokeWidth="1" strokeDasharray="5 5" opacity="0.25" />
      <circle cx="240" cy="210" r="70" stroke="#fb7185" strokeWidth="1" opacity="0.2" />

      {/* Large Crimson Curved Backdrop Screen (Behind Laptop) */}
      <path
        d="M275 35 h135 a28 28 0 0 1 28 28 v235 h-163 z"
        fill="#701a2d"
        opacity="0.95"
      />

      {/* Stepped Crimson 3D Pedestal Stage */}
      {/* Soft ground shadow */}
      <ellipse cx="270" cy="335" rx="230" ry="22" fill="#4c0519" opacity="0.3" />

      {/* Main Pedestal Base */}
      {/* Top face */}
      <polygon points="120,248 310,215 480,252 290,288" fill="url(#pedestalTopGrad)" />
      {/* Front-left face */}
      <polygon points="120,248 290,288 290,328 120,288" fill="#701a2d" />
      {/* Front-right face */}
      <polygon points="290,288 480,252 480,292 290,328" fill="#4c0519" />

      {/* Modern Open Laptop on Pedestal */}
      {/* Base chassis / keyboard deck */}
      <polygon points="175,245 375,212 430,230 230,265" fill="#94a3b8" />
      <polygon points="178,243 372,211 425,228 228,262" fill="#f8fafc" />
      {/* Trackpad */}
      <polygon points="240,250 295,242 308,248 252,258" fill="#cbd5e1" opacity="0.9" />
      {/* Keyboard well */}
      <polygon points="215,236 360,214 398,226 250,250" fill="#0f172a" opacity="0.92" />

      {/* Display frame / screen lid */}
      <polygon points="255,76 430,50 430,214 255,240" fill="#0f172a" />
      <polygon points="258,79 426,53 426,210 258,236" fill="#030008" />

      {/* Screen Artwork: Glowing Neon Fest Ribbons */}
      <g clipPath="url(#festScreenClip)">
        <clipPath id="festScreenClip">
          <polygon points="258,79 426,53 426,210 258,236" />
        </clipPath>
        <rect x="245" y="40" width="195" height="210" fill="#05010a" />

        {/* Deep Magenta Cosmic Wave */}
        <path
          d="M255 220 C300 185, 330 140, 385 85 C405 65, 420 55, 426 48 L426 140 C390 180, 350 215, 275 238 Z"
          fill="url(#neonFestRibbon)"
        />
        {/* Hot Coral Wave */}
        <path
          d="M265 230 C315 195, 350 150, 400 95 L420 120 C370 170, 330 215, 278 240 Z"
          fill="#f43f5e"
          opacity="0.85"
        />
        {/* Gold Light Streak */}
        <path
          d="M280 236 C335 200, 375 160, 415 115 L426 130 C380 180, 340 220, 290 242 Z"
          fill="#fbbf24"
          opacity="0.8"
        />
      </g>
      {/* Laptop Camera dot */}
      <circle cx="342" cy="64" r="1.5" fill="#64748b" />

      {/* Potted Plant on right pedestal corner */}
      <path d="M446 252 l3-32 h24 l3 32 z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <ellipse cx="461" cy="220" rx="12" ry="4" fill="#3f2316" />
      {/* Upright Green Leaves */}
      <path d="M461 219c-4-26-14-42-26-52 5 21 12 37 24 52z" fill="#15803d" />
      <path d="M461 219c4-26 16-42 28-52-5 21-14 37-24 52z" fill="#166534" />
      <path d="M461 219c0-30 2-48 7-60-1 22-3 42-7 60z" fill="#22c55e" />
      <path d="M461 219c-9-22-20-33-32-40 10 16 20 28 28 40z" fill="#15803d" />
      <path d="M461 219c9-22 22-33 34-40-10 16-21 28-30 40z" fill="#4ade80" />

      {/* Floating Glassmorphism "UP TO 40% OFF" Badge (Left of screen) */}
      <g>
        <rect x="175" y="60" width="84" height="98" rx="16" fill="#ffffff" fillOpacity="0.94" stroke="#ffffff" strokeWidth="1.5" />
        <text x="217" y="82" fill="#64748b" fontSize="10.5" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">UP TO</text>
        <text x="217" y="122" fill="#881337" fontSize="34" fontWeight="900" textAnchor="middle" fontFamily="'Manrope', sans-serif">40%</text>
        <text x="217" y="144" fill="#64748b" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">OFF</text>
      </g>

      {/* Stacked Feature Pills (Right of laptop) */}
      {/* Pill 1: Trusted Brands */}
      <g>
        <rect x="424" y="52" width="108" height="40" rx="10" fill="#ffffff" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
        <circle cx="442" cy="72" r="11" fill="#fff1f2" />
        <path d="M442 66l4 2v4c0 3-1.8 5.5-4 6.5-2.2-1-4-3.5-4-6.5v-4l4-2z" fill="#9f1239" />
        <text x="460" y="70" fill="#0f172a" fontSize="10.5" fontWeight="700">Trusted</text>
        <text x="460" y="81" fill="#64748b" fontSize="9" fontWeight="600">Brands</text>
      </g>

      {/* Pill 2: Latest Technology */}
      <g>
        <rect x="424" y="104" width="108" height="40" rx="10" fill="#ffffff" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
        <circle cx="442" cy="124" r="11" fill="#fff1f2" />
        <circle cx="442" cy="124" r="4.5" fill="none" stroke="#9f1239" strokeWidth="1.6" />
        <path d="M442 117v2M442 129v2M435 124h2M447 124h2" stroke="#9f1239" strokeWidth="1.6" strokeLinecap="round" />
        <text x="460" y="122" fill="#0f172a" fontSize="10.5" fontWeight="700">Latest</text>
        <text x="460" y="133" fill="#64748b" fontSize="9" fontWeight="600">Technology</text>
      </g>

      {/* Pill 3: Best Deals */}
      <g>
        <rect x="424" y="156" width="108" height="40" rx="10" fill="#ffffff" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
        <circle cx="442" cy="176" r="11" fill="#fff1f2" />
        <path d="M443 169l-4 8h4l-1 6 5-9h-4l2-5z" fill="#9f1239" />
        <text x="460" y="174" fill="#0f172a" fontSize="10.5" fontWeight="700">Best</text>
        <text x="460" y="185" fill="#64748b" fontSize="9" fontWeight="600">Deals</text>
      </g>
    </svg>
  );
}
