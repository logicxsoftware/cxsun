import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft as ArrowLeftIcon,
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
  PauseIcon,
  PlayIcon,
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
import { TechMediaMark } from "./storefront.brand";
import {
  hasStorefrontPrice,
  money,
  responsiveImageSrcSet,
  whatsappLink
} from "./storefront.formatters";
import { StorefrontCollectionIcon } from "./storefront.collection-icons";
import { StorefrontSocialIcon } from "./storefront.social-icon";
import "./storefront.home-redesign1.css";
import "./storefront.promotions1.css";

type FilterProps = {
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
  onFilters: (value: StorefrontFilters) => void;
};

export { HeroSlider } from "./storefront.hero1";


export function TechMediaTrustSection({
  content
}: {
  content?: StorefrontSiteNavigation["trustedStrip"] | undefined;
}) {
  const [activePanel, setActivePanel] = useState(0);
  const reduceMotion = useReducedMotion();

  const defaultPanels = [
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

  const panels = defaultPanels.map((defaultPanel, index) => {
    const panel = content?.panels[index];
    if (!panel) return defaultPanel;
    const titleWords = panel.title.trim().split(/\s+/u);
    const splitAt = Math.max(1, Math.ceil(titleWords.length / 2));
    return {
      ...defaultPanel,
      ...panel,
      shortTitle: [titleWords.slice(0, splitAt).join(" "), titleWords.slice(splitAt).join(" ")] as [
        string,
        string
      ]
    };
  });

  const selectPanel = (index: number) => {
    if (index === activePanel) return;
    setActivePanel(index);
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 45) {
      selectPanel((activePanel + 1) % panels.length);
    } else if (diff < -45) {
      selectPanel((activePanel - 1 + panels.length) % panels.length);
    }
    setTouchStart(null);
  };

  const current = panels[activePanel] ?? defaultPanels[0];

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
              {content?.title || "Practical Technology Support"}
            </h2>

            <p className="cx-trust-desc">
              {content?.description ||
                "We help you choose technology that fits the work, set it up properly, and keep it useful as your needs grow."}
            </p>

            <div className="cx-trust-proof-list" aria-label="Tech Media service strengths">
              {(content?.proofPoints.length
                ? content.proofPoints
                : [
                    "MULTI-BRAND GUIDANCE",
                    "LOCAL TECHNICAL SUPPORT",
                    "RETAIL AND BUSINESS EXPERTISE"
                  ]
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
          {panels.map((panel, index) => {
            const Icon = panel.icon;
            const isActive = index === activePanel;

            if (isActive) {
              return (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="cx-trust-active-card"
                  key="active-service-card"
                  layout
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { layout: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }
                  }
                >
                  <div className="cx-trust-active-card-inner" key={panel.number}>
                    <div className="cx-trust-active-card-content">
                      <div className="cx-trust-active-card-badge">
                        <span className="cx-trust-active-number">{panel.number}</span>
                        <span className="cx-trust-active-bar" aria-hidden="true" />
                      </div>

                      <h3 className="cx-trust-active-title">{panel.title}</h3>
                      <p className="cx-trust-active-desc">{panel.description}</p>

                      <ul className="cx-trust-active-checklist">
                        {panel.details.map((detail) => (
                          <li key={detail}>
                            <CheckIcon className="cx-trust-check-icon" aria-hidden="true" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="cx-trust-active-actions">
                        <a className="cx-trust-action-btn" href={panel.href}>
                          {panel.action} <ArrowRightIcon aria-hidden="true" />
                        </a>
                      </div>
                    </div>

                    <div className="cx-trust-active-card-media" aria-hidden="true">
                      <TrustActiveCardLaptops />
                      <a
                        className="cx-trust-mobile-circle-btn"
                        href={panel.href}
                        aria-label={panel.action}
                      >
                        <ArrowRightIcon aria-hidden="true" />
                      </a>
                    </div>

                    <div className="cx-trust-pagination" aria-label="Service carousel navigation">
                      {panels.map((item, itemIndex) => (
                        <button
                          key={item.number}
                          type="button"
                          className={`cx-trust-pagination-dash${itemIndex === activePanel ? " is-active" : ""}`}
                          onClick={() => selectPanel(itemIndex)}
                          aria-label={`Switch to ${item.title}`}
                          aria-pressed={itemIndex === activePanel}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.button
                type="button"
                key={`tab-${panel.number}`}
                className="cx-trust-tab-col"
                layout
                onClick={() => selectPanel(index)}
                aria-label={`View ${panel.title}`}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { layout: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }
                }
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
              </motion.button>
            );
          })}

          {/* Mobile peeking adjacent tab */}
          <div
            className="cx-trust-mobile-peek-card"
            onClick={() => selectPanel((activePanel + 1) % panels.length)}
            aria-hidden="true"
          >
            {(() => {
              const nextPanel = panels[(activePanel + 1) % panels.length] ?? defaultPanels[0];
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
              onClick={() => selectPanel(index)}
              aria-pressed={isActive}
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
        <svg
          className="cx-store__service-banner-contour"
          viewBox="0 0 1320 180"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M-40 130 C 140 50, 260 170, 480 110 C 680 50, 830 150, 1080 90 C 1200 60, 1320 120, 1380 80"
            stroke="rgba(245, 158, 11, 0.08)"
            strokeWidth="2"
          />
          <path
            d="M-20 70 C 180 140, 380 40, 720 90 C 960 130, 1120 40, 1360 70"
            stroke="rgba(245, 158, 11, 0.05)"
            strokeWidth="1.8"
          />
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

export function PromotionsSection({
  categories,
  featuredCards,
  promotions
}: {
  categories: StorefrontDiscovery["categories"];
  featuredCards: StorefrontFeaturedCard[];
  promotions: StorefrontPromotion[];
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const promotionCategories = categories.filter((category) =>
    promotions.some((promotion) => promotionMatchesCategory(promotion, category.name))
  );
  const visiblePromotions =
    activeCategory === "All"
      ? promotions
      : promotions.filter((promotion) => promotionMatchesCategory(promotion, activeCategory));
  const safeIndex = visiblePromotions.length ? activeOfferIndex % visiblePromotions.length : 0;
  const featured = visiblePromotions[safeIndex];
  const secondaryFeatured = featuredCards[0];
  const categoryTiles = categories.filter((category) => category.productCount > 0).slice(0, 4);

  useEffect(() => {
    if (reduceMotion || autoplayPaused || visiblePromotions.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveOfferIndex((index) => (index + 1) % visiblePromotions.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [activeCategory, autoplayPaused, reduceMotion, visiblePromotions.length]);

  if (!promotions.length && !featuredCards.length) return null;

  return (
    <section className="cx-promotion-showcase" id="promotions">
      <header className="cx-promotion-showcase__header">
        <div className="cx-promotion-showcase__heading">
          <span className="cx-promotion-showcase__eyebrow">Current offers</span>
          <h2>Everyday Tech Offers</h2>
          <p>Selected deals on technology and accessories.</p>
        </div>
        {promotions.length ? (
          <div className="cx-promotion-showcase__controls">
            <div className="cx-promotion-showcase__filters" aria-label="Filter promotions">
            <button
              aria-pressed={activeCategory === "All"}
              className={activeCategory === "All" ? "is-active" : undefined}
              onClick={() => {
                setActiveCategory("All");
                setActiveOfferIndex(0);
              }}
              type="button"
            >
              All
            </button>
            {promotionCategories.map((category) => (
              <button
                aria-pressed={activeCategory === category.name}
                className={activeCategory === category.name ? "is-active" : undefined}
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name);
                  setActiveOfferIndex(0);
                }}
                type="button"
              >
                {category.name}
              </button>
            ))}
            </div>
            <a className="cx-promotion-showcase__all-link" href="/campaigns">
              View all offers <ArrowRightIcon aria-hidden="true" />
            </a>
          </div>
        ) : null}
      </header>

      {promotions.length && featured ? (
        <div className="cx-promotion-showcase__carousel" aria-live="off">
            <article className="cx-promotion-showcase__featured" key={featured.promotionCode}>
              {featured.imageUrl ? (
                <img
                  alt={featured.imageAlt || featured.title}
                  className="cx-promotion-showcase__featured-image"
                  decoding="async"
                  loading="lazy"
                  src={featured.imageUrl}
                />
              ) : null}
              <div className="cx-promotion-showcase__featured-copy">
                {featured.badge ? (
                  <span
                    className="cx-promotion-showcase__badge"
                    style={{
                      backgroundColor: badgeColor(featured.badgeTint),
                      color: featured.badgeTextColor || "#ffffff"
                    }}
                  >
                    {featured.badge}
                  </span>
                ) : null}
                {featured.eyebrow ? (
                  <span className="cx-promotion-showcase__item-eyebrow">{featured.eyebrow}</span>
                ) : null}
                <h3>{featured.title}</h3>
                <p>{featured.description}</p>
                <span className="cx-promotion-showcase__price-row">
                  {hasStorefrontPrice(featured.offerPrice) ? (
                    <b>{money(featured.offerPrice)}</b>
                  ) : null}
                  {hasStorefrontPrice(featured.originalPrice) ? (
                    <del>{money(featured.originalPrice ?? 0)}</del>
                  ) : null}
                </span>
                <a className="cx-promotion-showcase__featured-action" href={featured.actionUrl}>
                  {featured.actionLabel || "View offer"} <ArrowRightIcon aria-hidden="true" />
                </a>
              </div>
              <div className="cx-promotion-showcase__featured-controls">
                <button
                  aria-label="Previous promotion"
                  disabled={visiblePromotions.length < 2}
                  onClick={() =>
                    setActiveOfferIndex(
                      (index) => (index - 1 + visiblePromotions.length) % visiblePromotions.length
                    )
                  }
                  type="button"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </button>
                {!reduceMotion ? (
                  <button
                    aria-label={
                      autoplayPaused
                        ? "Resume automatic promotion rotation"
                        : "Pause automatic promotion rotation"
                    }
                    aria-pressed={autoplayPaused}
                    onClick={() => setAutoplayPaused((paused) => !paused)}
                    title={autoplayPaused ? "Resume rotation" : "Pause rotation"}
                    type="button"
                  >
                    {autoplayPaused ? (
                      <PlayIcon aria-hidden="true" />
                    ) : (
                      <PauseIcon aria-hidden="true" />
                    )}
                  </button>
                ) : null}
                <div className="cx-promotion-showcase__dots" aria-label="Choose featured offer">
                  {visiblePromotions.map((promotion, index) => (
                    <button
                      aria-label={`Show ${promotion.title}`}
                      aria-pressed={index === safeIndex}
                      className={index === safeIndex ? "is-active" : undefined}
                      key={promotion.promotionCode}
                      onClick={() => setActiveOfferIndex(index)}
                      type="button"
                    />
                  ))}
                </div>
                <button
                  aria-label="Next promotion"
                  disabled={visiblePromotions.length < 2}
                  onClick={() =>
                    setActiveOfferIndex((index) => (index + 1) % visiblePromotions.length)
                  }
                  type="button"
                >
                  <ArrowRightIcon aria-hidden="true" />
                </button>
              </div>
            </article>
        </div>
      ) : promotions.length ? (
        <p className="cx-promotion-showcase__empty">No offers are available in this category.</p>
      ) : null}

      {secondaryFeatured ? (
        <article className="cx-promotion-showcase__wide-feature">
          {secondaryFeatured.imageUrl ? (
            <img
              alt={secondaryFeatured.imageAlt || secondaryFeatured.title}
              className="cx-promotion-showcase__wide-image"
              decoding="async"
              loading="lazy"
              src={secondaryFeatured.imageUrl}
            />
          ) : null}
          <div className="cx-promotion-showcase__wide-copy">
            {secondaryFeatured.badge ? (
              <span
                className="cx-promotion-showcase__badge"
                style={{
                  backgroundColor: badgeColor(secondaryFeatured.badgeTint),
                  color: secondaryFeatured.badgeTextColor || "#ffffff"
                }}
              >
                {secondaryFeatured.badge}
              </span>
            ) : null}
            {secondaryFeatured.eyebrow ? (
              <span className="cx-promotion-showcase__item-eyebrow">
                {secondaryFeatured.eyebrow}
              </span>
            ) : null}
            <h3>{secondaryFeatured.title}</h3>
            <p>{secondaryFeatured.description}</p>
            <span className="cx-promotion-showcase__price-row">
              {hasStorefrontPrice(secondaryFeatured.offerPrice) ? (
                <b>{money(secondaryFeatured.offerPrice)}</b>
              ) : null}
              {hasStorefrontPrice(secondaryFeatured.originalPrice) ? (
                <del>{money(secondaryFeatured.originalPrice ?? 0)}</del>
              ) : null}
            </span>
            <a href={secondaryFeatured.actionUrl}>
              {secondaryFeatured.actionLabel || "View offer"}
              <ArrowRightIcon aria-hidden="true" />
            </a>
          </div>
        </article>
      ) : null}

      {categoryTiles.length ? (
        <div className="cx-promotion-showcase__categories" aria-label="Shop product categories">
          {categoryTiles.map((category, index) => (
            <a
              className={`cx-promotion-showcase__category is-tone-${index % 4}`}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              key={category.name}
            >
              <span className="cx-promotion-showcase__category-icon" aria-hidden="true">
                <StorefrontCollectionIcon name={category.name} />
              </span>
              <span className="cx-promotion-showcase__category-copy">
                <strong>{category.name}</strong>
                <small>
                  {category.productCount.toLocaleString()}{" "}
                  {category.productCount === 1 ? "product" : "products"}
                </small>
                <b>
                  Explore <ArrowRightIcon aria-hidden="true" />
                </b>
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function promotionMatchesCategory(promotion: StorefrontPromotion, category: string) {
  const normalize = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const target = normalize(category);
  return promotion.eyebrow
    .split(/[·•|]/u)
    .map(normalize)
    .some((part) => part === target || part.includes(target) || target.includes(part));
}

export { SeasonBanner } from "./storefront.season-banner1";


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
          <h2>Tech Guides</h2>
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
export function HomeClosingCta({
  content
}: {
  content?: StorefrontSiteNavigation["closingCta"] | undefined;
}) {
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
      <div
        className="cx-store__closing-cta-dots cx-store__closing-cta-dots-left"
        aria-hidden="true"
      >
        <DotGridGraphic />
      </div>
      <div
        className="cx-store__closing-cta-dots cx-store__closing-cta-dots-right"
        aria-hidden="true"
      >
        <DotGridGraphic />
      </div>

      <div className="cx-store__closing-cta-copy">
        <span>{content?.eyebrow || "Ready when you are"}</span>
        <h2>{content?.title || "Technology for your work"}</h2>
        <p>
          {content?.description ||
            "Compare dependable systems, accessories, and practical support in one place."}
        </p>
        <div className="cx-store__closing-cta-underline" aria-hidden="true" />
      </div>

      <div className="cx-store__closing-cta-graphic" aria-hidden="true">
        <WorkspaceIsometricIllustration />
      </div>

      <div className="cx-store__closing-cta-action">
        <a className="cx-store__closing-cta-btn" href={content?.actionUrl || "/shop"}>
          {content?.actionLabel || "Browse all products"} <ArrowUpRightIcon />
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
  const brandTitle = "Tech Media";
  const copyrightText =
    navigation?.copyrightText.trim().replace(/cxsun/gi, brandTitle) ||
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
              <TechMediaMark className="cx-footer-brand-mark" />
              <span className="cx-footer-wordmark">{brandTitle}</span>
            </a>
            <span className="cx-footer-tagline">
              {navigation?.tagline?.replace(/cxsun/gi, brandTitle) || "Your Technology Partner"}
            </span>
            <p className="cx-footer-about">
              {navigation?.about?.replace(/cxsun/gi, brandTitle) ||
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
                  navigation?.socialLinks.find((s) => s.label.toLowerCase() === "instagram")
                    ?.href || "#"
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
                  navigation?.socialLinks.find((s) => s.label.toLowerCase() === "youtube")?.href ||
                  "#"
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
   RICH VECTOR ILLUSTRATIONS (Redesigned with Modern Aesthetics & Depth)
   ========================================================================== */

function SupportDeskIllustration() {
  return (
    <svg
      viewBox="0 0 250 130"
      fill="none"
      className="cx-illustration-desk"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft realistic drop shadows */}
        <filter id="sdShadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
        <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="145%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.1" />
        </filter>

        {/* Ambient warm glow under desk */}
        <radialGradient id="deskGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
        </radialGradient>

        {/* Anodized aluminum & metallic gradients */}
        <linearGradient id="metalStand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <linearGradient id="displayBezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>

        <linearGradient id="screenGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0c1322" />
          <stop offset="100%" stopColor="#080c14" />
        </linearGradient>

        <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Diagnostic & waveform gradients */}
        <linearGradient id="waveLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>

        {/* Headset finishes */}
        <linearGradient id="headbandArc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#475467" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        <linearGradient id="earcupFinish" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Gold verified badge */}
        <linearGradient id="goldBadge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* 1. Ambient Warm Lighting on desk */}
      <ellipse cx="120" cy="116" rx="95" ry="10" fill="url(#deskGlow)" />

      {/* 2. Sleek Floating Desk Surface */}
      <rect x="24" y="96" width="194" height="6" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="36" y="101" width="170" height="2.5" rx="1.2" fill="#cbd5e1" opacity="0.4" />

      {/* 3. Pro Monitor / Studio Display */}
      {/* Aluminum Stand Base & Column */}
      <rect x="94" y="93" width="36" height="3.5" rx="1.7" fill="url(#metalStand)" />
      <rect x="108" y="70" width="8" height="24" rx="2" fill="url(#metalStand)" />
      {/* Stand cable routing opening */}
      <rect x="110" y="79" width="4" height="7" rx="2" fill="#64748b" opacity="0.6" />

      {/* Main Display Outer Bezel with Drop Shadow */}
      <g filter="url(#sdShadow)">
        <rect x="52" y="15" width="120" height="74" rx="7" fill="url(#displayBezel)" stroke="#334155" strokeWidth="0.8" />
        {/* Inner Screen */}
        <rect x="55.5" y="18.5" width="113" height="64" rx="4.5" fill="url(#screenGlass)" />
      </g>

      {/* Screen Top Bar / Browser-OS Chrome */}
      <circle cx="63" cy="24.5" r="2" fill="#ef4444" />
      <circle cx="68.5" cy="24.5" r="2" fill="#f59e0b" />
      <circle cx="74" cy="24.5" r="2" fill="#10b981" />
      {/* Active Service Badge in screen header */}
      <rect x="83" y="22" width="44" height="5" rx="2.5" fill="#1e293b" />
      <circle cx="87" cy="24.5" r="1.3" fill="#38bdf8" />
      <rect x="91" y="23.5" width="30" height="2" rx="1" fill="#94a3b8" />
      {/* Status Live Dot */}
      <circle cx="160" cy="24.5" r="2" fill="#10b981" />
      <circle cx="160" cy="24.5" r="3.8" stroke="#10b981" strokeWidth="0.6" strokeOpacity="0.45" />

      {/* Screen UI: Diagnostic Analytics & Audio Waveform */}
      {/* Top UI Metrics Row */}
      <rect x="61" y="32" width="48" height="15" rx="3" fill="#172236" stroke="#253552" strokeWidth="0.6" />
      <rect x="65" y="35" width="22" height="2" rx="1" fill="#38bdf8" />
      <rect x="65" y="39" width="36" height="2.2" rx="1" fill="#64748b" />
      <circle cx="101" cy="39" r="2" fill="#10b981" />

      <rect x="113" y="32" width="50" height="15" rx="3" fill="#172236" stroke="#253552" strokeWidth="0.6" />
      <rect x="117" y="35" width="28" height="2" rx="1" fill="#fbbf24" />
      <rect x="117" y="39" width="38" height="2.2" rx="1" fill="#64748b" />

      {/* Live Audio / Frequency Wave Graph */}
      <path
        d="M61 62 Q72 52 82 59 T103 54 T124 61 T145 50 T163 56 L163 68 L61 68 Z"
        fill="url(#waveFill)"
      />
      <path
        d="M61 62 Q72 52 82 59 T103 54 T124 61 T145 50 T163 56"
        fill="none"
        stroke="url(#waveLine)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="145" cy="50" r="2" fill="#38bdf8" />

      {/* Diagnostic Progress / Health Bar */}
      <rect x="61" y="73" width="70" height="3" rx="1.5" fill="#1e293b" />
      <rect x="61" y="73" width="52" height="3" rx="1.5" fill="url(#waveLine)" />
      <rect x="136" y="73" width="27" height="3" rx="1.5" fill="#334155" />

      {/* Glass Reflection Sheen across screen */}
      <polygon points="56,19 92,19 62,82 56,82" fill="url(#glassReflection)" />

      {/* 4. Sleek Keyboard on Desk */}
      <rect x="74" y="100" width="62" height="12" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" filter="url(#badgeShadow)" />
      {/* Keyboard Keys Row 1 */}
      <rect x="77" y="102" width="6" height="3" rx="0.8" fill="#e2e8f0" />
      <rect x="85" y="102" width="6" height="3" rx="0.8" fill="#e2e8f0" />
      <rect x="93" y="102" width="6" height="3" rx="0.8" fill="#e2e8f0" />
      <rect x="101" y="102" width="6" height="3" rx="0.8" fill="#e2e8f0" />
      <rect x="109" y="102" width="6" height="3" rx="0.8" fill="#e2e8f0" />
      <rect x="117" y="102" width="6" height="3" rx="0.8" fill="#e2e8f0" />
      <rect x="125" y="102" width="8" height="3" rx="0.8" fill="#cbd5e1" />
      {/* Keyboard Keys Row 2 & Spacebar */}
      <rect x="77" y="107" width="9" height="3" rx="0.8" fill="#cbd5e1" />
      <rect x="88" y="107" width="34" height="3" rx="0.8" fill="#94a3b8" />
      <rect x="124" y="107" width="9" height="3" rx="0.8" fill="#cbd5e1" />

      {/* Precision Wireless Mouse */}
      <rect x="144" y="101" width="11" height="9" rx="4.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" filter="url(#badgeShadow)" />
      <line x1="149.5" y1="102" x2="149.5" y2="105" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />

      {/* 5. Professional Studio Support Headset with Stand */}
      <g filter="url(#sdShadow)">
        {/* Headphone Stand Base & Stem */}
        <ellipse cx="196" cy="98" rx="14" ry="3.5" fill="url(#metalStand)" />
        <path d="M196 98 L196 48 Q196 43 200 42" stroke="url(#metalStand)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="200" cy="42" r="3" fill="#64748b" />

        {/* Headset Arc / Headband */}
        <path
          d="M182 58 C182 42 208 42 208 58"
          stroke="url(#headbandArc)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Inner Cushion Padding */}
        <path
          d="M185 55 C185 45 205 45 205 55"
          stroke="#1e293b"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Left Earcup */}
        <rect x="177" y="55" width="8" height="19" rx="4" fill="url(#earcupFinish)" stroke="#475467" strokeWidth="0.8" />
        <ellipse cx="185" cy="64.5" rx="2" ry="7" fill="#090d16" />

        {/* Right Earcup */}
        <rect x="205" y="55" width="8" height="19" rx="4" fill="url(#earcupFinish)" stroke="#475467" strokeWidth="0.8" />
        <ellipse cx="205" cy="64.5" rx="2" ry="7" fill="#090d16" />

        {/* Microphone Boom & Glowing Indicator */}
        <path
          d="M181 69 Q177 79 170 80"
          stroke="#475467"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="169" cy="80" r="2.2" fill="#10b981" />
        <circle cx="169" cy="80" r="4.2" stroke="#10b981" strokeWidth="0.6" strokeOpacity="0.5" />
      </g>

      {/* 6. Floating Glassmorphic Badges */}
      {/* Floating Left: "Live Agent" Chat Card */}
      <g filter="url(#badgeShadow)">
        <rect x="10" y="24" width="46" height="28" rx="8" fill="#ffffff" fillOpacity="0.95" stroke="#fed7aa" strokeWidth="1" />
        {/* Tail pointing to screen */}
        <polygon points="56,36 62,39 56,42" fill="#ffffff" />
        {/* Agent avatar with headset icon */}
        <circle cx="21" cy="38" r="6" fill="#fef3c7" />
        <circle cx="21" cy="36" r="2.5" fill="#f59e0b" />
        <path d="M17 41 Q21 39 25 41" stroke="#f59e0b" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Chat message lines */}
        <rect x="31" y="32" width="18" height="2.5" rx="1.2" fill="#0f172a" />
        <rect x="31" y="37" width="22" height="2" rx="1" fill="#64748b" />
        <rect x="31" y="42" width="14" height="2" rx="1" fill="#10b981" />
      </g>

      {/* Floating Right: Genuine Quality / Certified Care Shield Badge */}
      <g filter="url(#badgeShadow)">
        <rect x="190" y="14" width="42" height="20" rx="10" fill="#ffffff" fillOpacity="0.95" stroke="#fef08a" strokeWidth="1" />
        {/* Gold seal */}
        <circle cx="200" cy="24" r="5.5" fill="url(#goldBadge)" />
        {/* White checkmark inside seal */}
        <path d="M197.5 24 L199.5 26 L203 22" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* "CARE" text bars */}
        <rect x="209" y="21.5" width="16" height="2.2" rx="1" fill="#0f172a" />
        <rect x="209" y="25" width="11" height="1.8" rx="0.9" fill="#f59e0b" />
      </g>
    </svg>
  );
}

function WorkspaceIsometricIllustration() {
  return (
    <svg
      viewBox="0 0 400 150"
      fill="none"
      className="cx-illustration-workspace"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Drop shadow for 3D depth */}
        <filter id="wsShadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>
        <filter id="pillShadow" x="-20%" y="-20%" width="140%" height="145%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.12" />
        </filter>

        {/* Ambient cyan ground glow */}
        <radialGradient id="wsGroundGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
        </radialGradient>

        {/* Metal gradients */}
        <linearGradient id="alChassis" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        <linearGradient id="darkBezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b1120" />
        </linearGradient>

        <linearGradient id="mainDisplayGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="60%" stopColor="#0b1120" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        <linearGradient id="laptopGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        {/* Screen UI Card Gradients */}
        <linearGradient id="cardGradBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="cardGradPurple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.85" />
        </linearGradient>

        {/* Glass glare line */}
        <linearGradient id="wsGlare" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Wi-Fi Wave Gradient */}
        <linearGradient id="wifiArc" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {/* 1. Ambient Workspace Ground Shadow & Light Aura */}
      <ellipse cx="200" cy="132" rx="175" ry="12" fill="url(#wsGroundGlow)" />

      {/* Subtle Data Synced Connection Lines between devices */}
      <path
        d="M85 106 L195 110 L300 106 L348 108"
        stroke="#38bdf8"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        strokeOpacity="0.4"
        fill="none"
      />

      {/* 2. CENTER: Pro Studio Display 32" */}
      {/* Aluminum Stand Base */}
      <rect x="176" y="118" width="48" height="4.5" rx="2" fill="url(#alChassis)" stroke="#94a3b8" strokeWidth="0.6" />
      {/* Stand Neck Column */}
      <rect x="195" y="94" width="10" height="26" rx="2.5" fill="url(#alChassis)" stroke="#94a3b8" strokeWidth="0.6" />
      <rect x="198" y="103" width="4" height="8" rx="2" fill="#64748b" opacity="0.6" />

      {/* Monitor Chassis & Screen with Depth */}
      <g filter="url(#wsShadow)">
        <rect x="145" y="20" width="110" height="76" rx="7" fill="url(#darkBezel)" stroke="#334155" strokeWidth="0.8" />
        <rect x="148.5" y="23.5" width="103" height="66" rx="4.5" fill="url(#mainDisplayGlass)" />
      </g>

      {/* Window Management Controls */}
      <circle cx="155" cy="29" r="1.8" fill="#ef4444" />
      <circle cx="160" cy="29" r="1.8" fill="#f59e0b" />
      <circle cx="165" cy="29" r="1.8" fill="#10b981" />

      {/* Workspace App Window 1: Code / Analytics View */}
      <rect x="153" y="35" width="45" height="42" rx="3.5" fill="#131c2e" stroke="#253552" strokeWidth="0.6" />
      <rect x="156" y="38" width="16" height="2" rx="1" fill="#38bdf8" />
      <rect x="156" y="43" width="28" height="1.8" rx="0.9" fill="#a78bfa" />
      <rect x="156" y="47" width="22" height="1.8" rx="0.9" fill="#34d399" />
      <rect x="156" y="51" width="34" height="1.8" rx="0.9" fill="#64748b" />
      <rect x="156" y="55" width="18" height="1.8" rx="0.9" fill="#64748b" />
      {/* Mini Bar Chart */}
      <rect x="156" y="66" width="4" height="7" rx="1" fill="#3b82f6" />
      <rect x="162" y="63" width="4" height="10" rx="1" fill="#38bdf8" />
      <rect x="168" y="60" width="4" height="13" rx="1" fill="#10b981" />
      <rect x="174" y="65" width="4" height="8" rx="1" fill="#6366f1" />
      <rect x="180" y="59" width="4" height="14" rx="1" fill="#f59e0b" />

      {/* Workspace App Window 2: Creative Design Studio */}
      <rect x="202" y="35" width="45" height="42" rx="3.5" fill="url(#cardGradBlue)" stroke="#3b82f6" strokeWidth="0.6" />
      <rect x="205" y="38" width="22" height="2" rx="1" fill="#ffffff" fillOpacity="0.9" />
      {/* Gradient Palette Box */}
      <rect x="205" y="44" width="38" height="16" rx="2.5" fill="url(#cardGradPurple)" />
      <circle cx="214" cy="52" r="4" fill="#38bdf8" />
      <polygon points="225,48 234,55 221,55" fill="#34d399" />
      {/* Slider Controls */}
      <rect x="205" y="64" width="38" height="2.5" rx="1.2" fill="#1e3a8a" />
      <circle cx="220" cy="65.2" r="2.2" fill="#ffffff" />
      <rect x="205" y="70" width="26" height="2" rx="1" fill="#93c5fd" />

      {/* Screen Bottom App Dock */}
      <rect x="178" y="81" width="44" height="6.5" rx="3.2" fill="#0f172a" fillOpacity="0.9" stroke="#334155" strokeWidth="0.5" />
      <circle cx="184" cy="84.2" r="1.6" fill="#38bdf8" />
      <circle cx="190" cy="84.2" r="1.6" fill="#10b981" />
      <circle cx="196" cy="84.2" r="1.6" fill="#f59e0b" />
      <circle cx="202" cy="84.2" r="1.6" fill="#6366f1" />
      <circle cx="208" cy="84.2" r="1.6" fill="#ec4899" />
      <circle cx="214" cy="84.2" r="1.6" fill="#06b6d4" />

      {/* Display Glare Sheen */}
      <polygon points="149,24 186,24 159,88 149,88" fill="url(#wsGlare)" />

      {/* Precision Slim Keyboard & Mouse on Desk in front of Monitor */}
      <rect x="168" y="103" width="64" height="11" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" filter="url(#wsShadow)" />
      {/* Key rows */}
      <rect x="171" y="105" width="58" height="2.8" rx="0.8" fill="#e2e8f0" />
      <rect x="171" y="109" width="12" height="2.8" rx="0.8" fill="#cbd5e1" />
      <rect x="185" y="109" width="30" height="2.8" rx="0.8" fill="#94a3b8" />
      <rect x="217" y="109" width="12" height="2.8" rx="0.8" fill="#cbd5e1" />

      <rect x="238" y="104" width="11" height="9" rx="4.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" filter="url(#wsShadow)" />
      <line x1="243.5" y1="105" x2="243.5" y2="108" stroke="#94a3b8" strokeWidth="0.8" />

      {/* 3. LEFT: Ultra-thin Pro Laptop (MacBook Style 3/4 Angle) */}
      <g filter="url(#wsShadow)">
        {/* Laptop Screen Lid */}
        <rect x="34" y="44" width="76" height="56" rx="5" fill="url(#darkBezel)" stroke="#475467" strokeWidth="0.8" />
        <rect x="37" y="47" width="70" height="48" rx="3.5" fill="url(#laptopGlass)" />

        {/* Laptop Screen Content */}
        <circle cx="42" cy="52" r="1.5" fill="#ef4444" />
        <circle cx="46" cy="52" r="1.5" fill="#10b981" />
        <rect x="52" y="51" width="22" height="2.5" rx="1" fill="#38bdf8" />
        {/* Code / Dashboard preview on laptop */}
        <rect x="42" y="58" width="34" height="2" rx="1" fill="#38bdf8" />
        <rect x="42" y="63" width="46" height="2" rx="1" fill="#94a3b8" />
        <rect x="42" y="68" width="38" height="2" rx="1" fill="#64748b" />
        <rect x="42" y="73" width="50" height="2" rx="1" fill="#64748b" />
        <rect x="42" y="78" width="26" height="2" rx="1" fill="#10b981" />
        <circle cx="98" cy="55" r="4" fill="#10b981" />
        <path d="M96 55 L97.5 56.5 L100.5 53.5" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Laptop Aluminum Lower Deck Wedge */}
        <polygon
          points="24,100 120,100 114,107 30,107"
          fill="url(#alChassis)"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />
        {/* Keyboard Well */}
        <polygon
          points="36,101 108,101 104,105 40,105"
          fill="#0f172a"
        />
        {/* Glass Trackpad */}
        <polygon
          points="62,105 82,105 80.5,106.8 63.5,106.8"
          fill="#cbd5e1"
        />
      </g>

      {/* 4. RIGHT 1: High-Performance Compact Studio Station */}
      <g filter="url(#wsShadow)">
        {/* Compact Anodized Aluminum Workstation (Mac Studio form factor) */}
        <rect x="278" y="74" width="38" height="34" rx="6" fill="url(#alChassis)" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Chamfered Top Edge */}
        <rect x="280" y="75" width="34" height="2" rx="1" fill="#ffffff" opacity="0.6" />
        {/* Front Dual Thunderbolt 4 Ports */}
        <rect x="284" y="86" width="3.5" height="7" rx="1.7" fill="#1e293b" />
        <rect x="290" y="86" width="3.5" height="7" rx="1.7" fill="#1e293b" />
        {/* SDXC Card Slot */}
        <rect x="298" y="89" width="12" height="2" rx="0.8" fill="#1e293b" />
        {/* Micro Intake Grille at base */}
        <rect x="282" y="103" width="30" height="2" rx="1" fill="#64748b" opacity="0.4" />
        {/* Status Light Bar */}
        <circle cx="284" cy="99" r="1.3" fill="#38bdf8" />
      </g>

      {/* 5. RIGHT 2: Wi-Fi 7 Smart Mesh Hub with Holographic Wave Aura */}
      <g filter="url(#wsShadow)">
        {/* Modern Cylindrical Mesh Router */}
        <rect x="330" y="76" width="36" height="32" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
        <rect x="334" y="78" width="28" height="2" rx="1" fill="#38bdf8" opacity="0.4" />
        {/* LED Status Dots */}
        <circle cx="342" cy="92" r="1.5" fill="#10b981" />
        <circle cx="348" cy="92" r="1.5" fill="#38bdf8" />
        <circle cx="354" cy="92" r="1.5" fill="#6366f1" />
        {/* Ethernet / Activity Bar */}
        <rect x="340" y="99" width="16" height="2" rx="1" fill="#1e293b" />
      </g>

      {/* Holographic Wi-Fi 7 Signal Waves */}
      <g>
        {/* Signal Broadcast Center Dot */}
        <circle cx="348" cy="70" r="2.5" fill="#38bdf8" />
        <circle cx="348" cy="70" r="5" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />

        {/* Inner Wave Arc */}
        <path
          d="M336 63 a18 18 0 0 1 24 0"
          stroke="url(#wifiArc)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Mid Wave Arc */}
        <path
          d="M329 53 a28 28 0 0 1 38 0"
          stroke="url(#wifiArc)"
          strokeWidth="2"
          strokeOpacity="0.75"
          fill="none"
          strokeLinecap="round"
        />
        {/* Outer Wave Arc */}
        <path
          d="M322 43 a38 38 0 0 1 52 0"
          stroke="url(#wifiArc)"
          strokeWidth="1.8"
          strokeOpacity="0.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* 6. Floating Glassmorphic Spec Chips */}
      {/* Spec Pill 1 (Above Laptop): Pro Ecosystem */}
      <g filter="url(#pillShadow)">
        <rect x="26" y="22" width="62" height="18" rx="9" fill="#ffffff" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
        <circle cx="36" cy="31" r="4.5" fill="#0284c7" />
        {/* Lightning bolt / power icon */}
        <path d="M36 28 L34 31 L36.5 31 L35.5 34 L38 30.5 L36 30.5 Z" fill="#ffffff" />
        <rect x="44" y="28" width="36" height="2.5" rx="1" fill="#0f172a" />
        <rect x="44" y="32" width="24" height="2" rx="1" fill="#0284c7" />
      </g>

      {/* Spec Pill 2 (Above Wi-Fi): Ultra Fast Mesh */}
      <g filter="url(#pillShadow)">
        <rect x="316" y="16" width="66" height="18" rx="9" fill="#ffffff" fillOpacity="0.95" stroke="#bae6fd" strokeWidth="1" />
        <circle cx="326" cy="25" r="4.5" fill="#10b981" />
        {/* Checkmark icon */}
        <path d="M323.5 25 L325 26.5 L328.5 23.5" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="334" y="22" width="40" height="2.5" rx="1" fill="#0f172a" />
        <rect x="334" y="26" width="28" height="2" rx="1" fill="#10b981" />
      </g>
    </svg>
  );
}

function DotGridGraphic() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className="cx-dot-grid"
      aria-hidden="true"
    >
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
          <rect
            x="225"
            y="32"
            width="24"
            height="20"
            rx="4"
            fill="#ecfdf5"
            stroke="#10b981"
            strokeWidth="1.3"
          />
          <circle cx="237" cy="41" r="4.5" fill="none" stroke="#059669" strokeWidth="1.1" />
          <path d="M234 51h6" stroke="#10b981" strokeWidth="1.5" />
        </g>
      )}
      {activeIndex === 1 && (
        <g>
          <rect
            x="225"
            y="32"
            width="24"
            height="24"
            rx="5"
            fill="#ecfdf5"
            stroke="#10b981"
            strokeWidth="1.3"
          />
          <circle cx="237" cy="38" r="2.5" fill="#059669" />
          <circle cx="231" cy="48" r="2.2" fill="#059669" />
          <circle cx="243" cy="48" r="2.2" fill="#059669" />
          <path
            d="M237 40.5v4M237 44.5h-6v2M237 44.5h6v2"
            stroke="#059669"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      )}
      {activeIndex === 2 && (
        <g>
          <rect
            x="225"
            y="32"
            width="24"
            height="24"
            rx="5"
            fill="#ecfdf5"
            stroke="#10b981"
            strokeWidth="1.3"
          />
          <path
            d="M239 37a3.5 3.5 0 0 0-4.5 4.5l-5 5a1.2 1.2 0 1 0 1.7 1.7l5-5A3.5 3.5 0 0 0 239 37z"
            fill="#059669"
          />
        </g>
      )}
      {activeIndex === 3 && (
        <g>
          <rect
            x="225"
            y="32"
            width="24"
            height="24"
            rx="5"
            fill="#ecfdf5"
            stroke="#10b981"
            strokeWidth="1.3"
          />
          <path d="M237 36l5 2v4c0 3.5-2.2 6.5-5 7.5-2.8-1-5-4-5-7.5v-4l5-2z" fill="#059669" />
        </g>
      )}
      {activeIndex === 4 && (
        <g>
          <rect
            x="225"
            y="32"
            width="24"
            height="24"
            rx="5"
            fill="#ecfdf5"
            stroke="#10b981"
            strokeWidth="1.3"
          />
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
      <path
        d="M150 129v2M150 139v2M144 135h2M154 135h2"
        stroke="#059669"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

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
          <path
            d="M192 210c-16-19-13-44 6-58 17-12 40-8 52 10"
            stroke="#0f172a"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="189"
            cy="216"
            rx="9.5"
            ry="14.5"
            fill="#1e293b"
            transform="rotate(-15 189 216)"
          />
          <ellipse
            cx="189"
            cy="216"
            rx="6.5"
            ry="10.5"
            fill="#0f172a"
            transform="rotate(-15 189 216)"
          />
          <ellipse
            cx="242"
            cy="214"
            rx="9.5"
            ry="14.5"
            fill="#1e293b"
            transform="rotate(15 242 214)"
          />
          <ellipse
            cx="242"
            cy="214"
            rx="6.5"
            ry="10.5"
            fill="#0f172a"
            transform="rotate(15 242 214)"
          />
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
          <line
            x1="200"
            y1="184"
            x2="190"
            y2="108"
            stroke="#0f172a"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="190" cy="108" r="3" fill="#10b981" />
          <line
            x1="270"
            y1="176"
            x2="280"
            y2="102"
            stroke="#0f172a"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="280" cy="102" r="3" fill="#10b981" />

          {/* Wi-Fi Wave Ripples */}
          <path
            d="M165 92a50 50 0 0 1 70 0"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.9"
            fill="none"
          />
          <path
            d="M150 78a74 74 0 0 1 100 0"
            stroke="#34d399"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.75"
            fill="none"
          />
          <path
            d="M135 64a98 98 0 0 1 130 0"
            stroke="#6ee7b7"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.5"
            fill="none"
          />
        </g>
      )}

      {/* 03: Service and support (Diagnostic Monitor + Service Tools) */}
      {activeIndex === 2 && (
        <g>
          {/* Diagnostic Display Screen */}
          <polygon points="186,84 286,70 286,170 186,184" fill="#0f172a" />
          <polygon points="188,86 283,72 283,167 188,181" fill="#022c22" />
          {/* Health Graph Wave */}
          <path
            d="M190 140h15l8-25 12 40 10-20 14 15 15-30 18 20"
            stroke="#10b981"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="235" cy="135" r="3" fill="#34d399" />
          <circle cx="264" cy="120" r="3" fill="#10b981" />

          {/* Display Base */}
          <polygon points="215,182 255,178 260,192 220,196" fill="#475467" />

          {/* Chrome Precision Wrench on Pedestal */}
          <path
            d="M140 215l48-24a7 7 0 0 0 2-9l-5-5a7 7 0 0 0-9 2l-48 24a5 5 0 0 0 12 12z"
            fill="#cbd5e1"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <circle cx="180" cy="180" r="5" fill="#f8fafc" />

          {/* Support Headset */}
          <path
            d="M260 215c-12-16-10-38 5-50 15-10 35-6 46 8"
            stroke="#0f172a"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="258"
            cy="220"
            rx="7"
            ry="11"
            fill="#1e293b"
            transform="rotate(-15 258 220)"
          />
          <ellipse cx="304" cy="216" rx="7" ry="11" fill="#1e293b" transform="rotate(15 304 216)" />
        </g>
      )}

      {/* 04: Security and access (Dome CCTV & Access Shield) */}
      {activeIndex === 3 && (
        <g>
          {/* High-Tech Dome CCTV Camera Body */}
          <ellipse
            cx="235"
            cy="130"
            rx="42"
            ry="16"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <path d="M193 130v15c0 14 19 25 42 25s42-11 42-25v-15" fill="#f1f5f9" />
          {/* Dark Glass Dome */}
          <ellipse cx="235" cy="150" rx="30" ry="24" fill="#020617" />
          <circle cx="235" cy="152" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="235" cy="152" r="6" fill="#059669" />
          <circle cx="233" cy="150" r="2" fill="#ffffff" />

          {/* Pulsing Emerald Security Ring */}
          <ellipse
            cx="235"
            cy="150"
            rx="38"
            ry="14"
            fill="none"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeDasharray="6 4"
            opacity="0.85"
          />

          {/* Wall-Mount Biometric Scanner */}
          <polygon points="140,192 185,178 185,216 140,230" fill="#0f172a" />
          <polygon points="143,195 182,182 182,212 143,225" fill="#1e293b" />
          <rect
            x="150"
            y="195"
            width="16"
            height="18"
            rx="2"
            fill="#022c22"
            stroke="#10b981"
            strokeWidth="1.2"
          />
          <path
            d="M154 204c3-3 8-3 10 0M156 207c2-2 5-2 6 0"
            stroke="#34d399"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
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
          <ellipse
            cx="248"
            cy="118"
            rx="26"
            ry="14"
            fill="#ecfdf5"
            stroke="#10b981"
            strokeWidth="1.5"
          />
          <path
            d="M236 122c-3 0-5-2-5-5a5 5 0 0 1 8-4c1-3 4-5 8-5 4 0 7 3 8 6a4 4 0 0 1 4 4c0 3-3 4-5 4z"
            fill="#059669"
          />
        </g>
      )}
    </svg>
  );
}

function TrustActiveCardLaptops() {
  return (
    <svg viewBox="0 0 340 210" fill="none" className="cx-trust-laptops-svg" aria-hidden="true">
      <defs>
        <linearGradient id="violetWaveFront" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="35%" stopColor="#312e81" />
          <stop offset="65%" stopColor="#6d28d9" />
          <stop offset="85%" stopColor="#7c3aed" />
          <stop offset="95%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c4b5fd" />
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

      {/* FRONT LAPTOP (Right-center, open laptop with a violet screen) */}
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
        <polygon points="125,38 264,20 264,150 125,168" fill="#1e1b4b" />

        {/* Screen Artwork - Violet Flow Waves */}
        <g clipPath="url(#frontScreenClip)">
          <clipPath id="frontScreenClip">
            <polygon points="125,38 264,20 264,150 125,168" />
          </clipPath>
          <rect x="115" y="10" width="160" height="170" fill="#1e1b4b" />

          {/* Deep violet layer */}
          <path
            d="M125 150 C165 125, 185 95, 230 45 C250 25, 260 15, 268 8 L268 80 C240 115, 205 145, 145 175 Z"
            fill="url(#violetWaveFront)"
          />

          {/* Bright violet fluid ribbon */}
          <path
            d="M130 165 C175 130, 205 100, 245 60 L265 85 C225 125, 185 160, 140 180 Z"
            fill="#7c3aed"
            opacity="0.9"
          />

          {/* Soft lavender crest */}
          <path
            d="M140 175 C190 140, 225 110, 260 80 L268 95 C235 130, 195 165, 150 185 Z"
            fill="#c4b5fd"
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
      <rect
        x="135"
        y="45"
        width="85"
        height="54"
        rx="4"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1"
      />
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
      <path
        d="M210 165c-10-14-8-32 5-42 12-9 28-6 38 7"
        stroke="#0f172a"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
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
      <circle
        cx="280"
        cy="230"
        r="140"
        stroke="#f43f5e"
        strokeWidth="1"
        strokeDasharray="5 5"
        opacity="0.25"
      />
      <circle cx="240" cy="210" r="70" stroke="#fb7185" strokeWidth="1" opacity="0.2" />

      {/* Large Crimson Curved Backdrop Screen (Behind Laptop) */}
      <path d="M275 35 h135 a28 28 0 0 1 28 28 v235 h-163 z" fill="#701a2d" opacity="0.95" />

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
        <rect
          x="175"
          y="60"
          width="84"
          height="98"
          rx="16"
          fill="#ffffff"
          fillOpacity="0.94"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <text
          x="217"
          y="82"
          fill="#64748b"
          fontSize="10.5"
          fontWeight="700"
          textAnchor="middle"
          letterSpacing="0.08em"
        >
          UP TO
        </text>
        <text
          x="217"
          y="122"
          fill="#881337"
          fontSize="34"
          fontWeight="900"
          textAnchor="middle"
          fontFamily="'Manrope', sans-serif"
        >
          40%
        </text>
        <text
          x="217"
          y="144"
          fill="#64748b"
          fontSize="11"
          fontWeight="700"
          textAnchor="middle"
          letterSpacing="0.08em"
        >
          OFF
        </text>
      </g>

      {/* Stacked Feature Pills (Right of laptop) */}
      {/* Pill 1: Trusted Brands */}
      <g>
        <rect
          x="424"
          y="52"
          width="108"
          height="40"
          rx="10"
          fill="#ffffff"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
        <circle cx="442" cy="72" r="11" fill="#fff1f2" />
        <path d="M442 66l4 2v4c0 3-1.8 5.5-4 6.5-2.2-1-4-3.5-4-6.5v-4l4-2z" fill="#9f1239" />
        <text x="460" y="70" fill="#0f172a" fontSize="10.5" fontWeight="700">
          Trusted
        </text>
        <text x="460" y="81" fill="#64748b" fontSize="9" fontWeight="600">
          Brands
        </text>
      </g>

      {/* Pill 2: Latest Technology */}
      <g>
        <rect
          x="424"
          y="104"
          width="108"
          height="40"
          rx="10"
          fill="#ffffff"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
        <circle cx="442" cy="124" r="11" fill="#fff1f2" />
        <circle cx="442" cy="124" r="4.5" fill="none" stroke="#9f1239" strokeWidth="1.6" />
        <path
          d="M442 117v2M442 129v2M435 124h2M447 124h2"
          stroke="#9f1239"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <text x="460" y="122" fill="#0f172a" fontSize="10.5" fontWeight="700">
          Latest
        </text>
        <text x="460" y="133" fill="#64748b" fontSize="9" fontWeight="600">
          Technology
        </text>
      </g>

      {/* Pill 3: Best Deals */}
      <g>
        <rect
          x="424"
          y="156"
          width="108"
          height="40"
          rx="10"
          fill="#ffffff"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
        <circle cx="442" cy="176" r="11" fill="#fff1f2" />
        <path d="M443 169l-4 8h4l-1 6 5-9h-4l2-5z" fill="#9f1239" />
        <text x="460" y="174" fill="#0f172a" fontSize="10.5" fontWeight="700">
          Best
        </text>
        <text x="460" y="185" fill="#64748b" fontSize="9" fontWeight="600">
          Deals
        </text>
      </g>
    </svg>
  );
}
