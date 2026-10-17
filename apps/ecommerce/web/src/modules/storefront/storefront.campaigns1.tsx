import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import type {
  StorefrontFeaturedCard,
  StorefrontPromotion,
  StorefrontSlider
} from "./storefront.types";
import "./storefront.campaigns1.css";

export function resolveStorefrontCampaigns(
  promotions: StorefrontPromotion[],
  featuredCards: StorefrontFeaturedCard[],
  slides: StorefrontSlider[]
) {
  if (promotions.length) return promotions;
  if (featuredCards.length)
    return featuredCards.map((card) => ({
      ...card,
      promotionCode: `featured:${card.featuredCode}`
    }));
  if (slides.length)
    return slides.map((slide, index) => ({
      actionLabel: slide.actionLabel,
      actionUrl: slide.actionUrl,
      badge: "Featured",
      badgePosition: "top-left" as const,
      badgeTextColor: "#ffffff",
      badgeTint: "neutral",
      description: slide.description,
      displayOrder: index + 1,
      eyebrow: slide.eyebrow,
      imageAlt: slide.imageAlt,
      imageUrl: slide.imageUrl,
      linkedItem: slide.linkedItem,
      offerPrice: 0,
      originalPrice: null,
      promotionCode: `slider:${slide.sliderCode}`,
      title: slide.title
    }));
  return fallbackCampaigns;
}

export function CampaignsAndEventsSection({ campaigns }: { campaigns: StorefrontPromotion[] }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  if (campaigns.length === 0) return null;

  const featuredItem =
    campaigns.find(
      (c) =>
        c.badge?.toLowerCase().includes("special") ||
        c.title.toLowerCase().includes("fest") ||
        c.title.toLowerCase().includes("summer") ||
        c.title.toLowerCase().includes("upgrade")
    ) || campaigns[0];
  const remainingCampaigns = campaigns.filter((campaign) => campaign !== featuredItem);

  const deal1 =
    remainingCampaigns.find(
      (c) =>
        (c.eyebrow?.toLowerCase().includes("audio") ||
          c.title.toLowerCase().includes("sony") ||
          c.title.toLowerCase().includes("wh-1000xm5"))
    ) || remainingCampaigns[0];

  const availableDeals = remainingCampaigns.filter((campaign) => campaign !== deal1);
  const deal2 =
    availableDeals.find(
      (c) =>
        (c.eyebrow?.toLowerCase().includes("phone") ||
          c.title.toLowerCase().includes("galaxy") ||
          c.title.toLowerCase().includes("s24") ||
          c.badge?.toLowerCase().includes("bundle"))
    ) || availableDeals[0];

  return (
    <section className="cx-campaigns-section" aria-labelledby="campaigns-events-title">
      {/* Section Header */}
      <header className="cx-campaigns-header">
        <div className="cx-campaigns-header__copy">
          <span className="cx-campaigns-header__eyebrow">— WHAT IS HAPPENING NOW</span>
          <h2 className="cx-campaigns-header__title" id="campaigns-events-title">
            Campaigns &amp; Events
          </h2>
          <p className="cx-campaigns-header__subtitle">
            Explore campaigns, product launches, and upcoming events.
          </p>
        </div>

        <div className="cx-campaigns-header__right">
          {/* Decorative Vector Graphics (Megaphone, Audio Waves, Paper Plane) */}
          <div className="cx-campaigns-header__decorations" aria-hidden="true">
            <MegaphoneGraphic />
            <AudioWavesGraphic />
            <PaperPlaneGraphic />
          </div>

          <a className="cx-campaigns-header__see-all" href="/campaigns">
            View all campaigns <ArrowRightIcon size={16} />
          </a>
        </div>
      </header>

      {/* Bento Grid Layout (Desktop 1920px, Laptop 1366px, Tablet 768px, Mobile 375px) */}
      <div className={`cx-campaigns-bento${deal1 || deal2 ? "" : " is-single"}`}>
        {/* Large Feature Banner Card (Summer Tech Upgrade Fest 2026) */}
        <FeaturedCampaignCard
          activeIndex={featuredIndex}
          campaign={featuredItem}
          onSelectIndex={setFeaturedIndex}
        />

        {/* Stacked Deal Cards (Desktop right column, Laptop/Tablet side-by-side, Mobile stacked) */}
        {(deal1 || deal2) && (
          <div className="cx-campaigns-deals-col">
            {deal1 && <CampaignDealCard campaign={deal1} theme="yellow" />}
            {deal2 && <CampaignDealCard campaign={deal2} theme="slate" />}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedCampaignCard({
  activeIndex,
  campaign,
  onSelectIndex
}: {
  activeIndex: number;
  campaign: StorefrontPromotion;
  onSelectIndex: (idx: number) => void;
}) {
  const title = campaign.title || "Summer Tech Upgrade Fest 2026";

  const renderTitle = () => {
    if (title.includes("Upgrade")) {
      const parts = title.split("Upgrade");
      return (
        <>
          {parts[0]}
          <span className="cx-featured-card__highlight">Upgrade</span>
          {parts[1]}
        </>
      );
    }
    return title;
  };

  return (
    <article className="cx-campaign-featured-card">
      <div className="cx-featured-card__content">
        <span className="cx-featured-card__badge">
          {campaign.badge || "Special Event"}
        </span>

        <h3 className="cx-featured-card__title">{renderTitle()}</h3>

        <p className="cx-featured-card__desc">
          {campaign.description ||
            "Upgrade your business setup, workstations, and creative gear with genuine multi-brand hardware leading and on-site support."}
        </p>

        <a className="cx-featured-card__cta" href={campaign.actionUrl || "/shop"}>
          {campaign.actionLabel || "Explore Deals"} <ArrowRightIcon size={16} />
        </a>

        {/* 3 Pagination Indicator Dots */}
        <div className="cx-featured-card__dots" aria-label="Featured events pagination">
          {[0, 1, 2].map((idx) => (
            <button
              aria-label={`Go to slide ${idx + 1}`}
              className={`cx-featured-card__dot${idx === activeIndex ? " cx-featured-card__dot--active" : ""}`}
              key={idx}
              onClick={() => onSelectIndex(idx)}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="cx-featured-card__media">
        <img
          alt={campaign.imageAlt || campaign.title}
          className="cx-featured-card__img"
          decoding="async"
          loading="lazy"
          src={
            campaign.imageUrl &&
            !campaign.imageUrl.includes("unsplash") &&
            !campaign.imageUrl.includes("headphone")
              ? campaign.imageUrl
              : "/banners/campaign_laptop_featured.jpg"
          }
        />
      </div>
    </article>
  );
}

function CampaignDealCard({
  campaign,
  theme = "yellow"
}: {
  campaign: StorefrontPromotion;
  theme?: "yellow" | "slate";
}) {
  const isSlate =
    theme === "slate" ||
    campaign.eyebrow?.toLowerCase().includes("samsung") ||
    campaign.badge?.toLowerCase().includes("bundle");

  const badgeText = campaign.badge || (isSlate ? "Bundle Deal" : "Save ₹5,000");

  const imgSrc = isSlate
    ? "/banners/campaign_samsung_s24.jpg"
    : "/banners/campaign_headphones_sony.jpg";

  return (
    <a className="cx-campaign-deal-card" href={campaign.actionUrl || "/shop"}>
      <div
        className={`cx-campaign-deal-card__media ${
          isSlate ? "cx-campaign-deal-card__media--slate" : "cx-campaign-deal-card__media--yellow"
        }`}
      >
        <span
          className={`cx-campaign-deal-card__badge ${
            isSlate
              ? "cx-campaign-deal-card__badge--indigo"
              : "cx-campaign-deal-card__badge--green"
          }`}
        >
          {badgeText}
        </span>

        <img
          alt={campaign.imageAlt || campaign.title}
          className="cx-campaign-deal-card__img"
          decoding="async"
          loading="lazy"
          src={imgSrc}
        />
      </div>

      <div className="cx-campaign-deal-card__body">
        <span className="cx-campaign-deal-card__eyebrow">
          {campaign.eyebrow || (isSlate ? "SAMSUNG • SMARTPHONES" : "SONY • AUDIO")}
        </span>

        <h4 className="cx-campaign-deal-card__title">{campaign.title}</h4>

        <p className="cx-campaign-deal-card__desc">{campaign.description}</p>

        <div className="cx-campaign-deal-card__footer">
          <span className="cx-campaign-deal-card__action">
            {campaign.actionLabel || "View Offer"} <ArrowRightIcon size={14} />
          </span>

          <span aria-hidden="true" className="cx-campaign-deal-card__circle-btn">
            <ArrowRightIcon size={14} />
          </span>
        </div>
      </div>
    </a>
  );
}

export function CampaignsCollection({ campaigns }: { campaigns: StorefrontPromotion[] }) {
  const displayCampaigns = campaigns.length ? campaigns : fallbackCampaigns;

  return (
    <main className="cx-store__campaigns-page">
      <header>
        <span>Tech Media campaigns</span>
        <h1>Explore Campaigns</h1>
        <p>
          Explore product launches, seasonal offers, learning events, giveaways, and customer
          programmes available through Tech Media.
        </p>
      </header>
      <div className="cx-store__campaigns-grid">
        {displayCampaigns.map((campaign, idx) => (
          <CampaignDealCard
            campaign={campaign}
            key={campaign.promotionCode || idx}
            theme={idx % 2 === 0 ? "yellow" : "slate"}
          />
        ))}
      </div>
    </main>
  );
}

/* ==========================================================================
   DECORATIVE VECTOR GRAPHICS (Megaphone, Audio Waves, Paper Plane)
   ========================================================================== */

function MegaphoneGraphic() {
  return (
    <svg aria-hidden="true" fill="none" height="34" viewBox="0 0 44 34" width="44">
      {/* Megaphone Green Body */}
      <path
        d="M26 8L10 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h5l16 5V8z"
        fill="#22c55e"
        stroke="#16a34a"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      {/* Handle */}
      <path
        d="M12 21l2 6a1.5 1.5 0 0 0 2.2-.4l1.8-5.6"
        stroke="#15803d"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      {/* Yellow Bell Mouth */}
      <ellipse
        cx="26"
        cy="17"
        fill="#facc15"
        rx="3.5"
        ry="8.5"
        stroke="#eab308"
        strokeWidth="1.6"
      />
      {/* Sound Waves */}
      <path
        d="M33 12a7 7 0 0 1 0 10"
        stroke="#22c55e"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <path
        d="M37 9a12 12 0 0 1 0 16"
        stroke="#86efac"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function AudioWavesGraphic() {
  return (
    <svg aria-hidden="true" fill="none" height="30" viewBox="0 0 32 30" width="32">
      <circle cx="16" cy="15" fill="#facc15" r="4.5" />
      <path
        d="M9 10a8 8 0 0 0 0 10"
        stroke="#f59e0b"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M23 10a8 8 0 0 1 0 10"
        stroke="#f59e0b"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M5 6a14 14 0 0 0 0 18"
        stroke="#fbbf24"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M27 6a14 14 0 0 1 0 18"
        stroke="#fbbf24"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PaperPlaneGraphic() {
  return (
    <svg aria-hidden="true" fill="none" height="32" viewBox="0 0 36 32" width="36">
      <path
        d="M4 27c7-1 13-5 16-12"
        stroke="#f59e0b"
        strokeDasharray="2.5 2.5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <polygon
        fill="#fef08a"
        points="6,15 32,5 20,26 16,19"
        stroke="#f59e0b"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <polygon fill="#f59e0b" points="16,19 32,5 20,26" />
      <polygon fill="#ca8a04" points="16,19 20,26 14,21" />
      <line
        stroke="#eab308"
        strokeLinecap="round"
        strokeWidth="1.2"
        x1="6"
        x2="32"
        y1="15"
        y2="5"
      />
    </svg>
  );
}

/* Fallback Campaigns matching the exact items in the reference mockup */
const fallbackCampaigns: StorefrontPromotion[] = [
  {
    actionLabel: "Explore Deals",
    actionUrl: "/shop",
    badge: "Special Event",
    badgePosition: "top-left",
    badgeTextColor: "#ffffff",
    badgeTint: "neutral",
    description:
      "Upgrade your business setup, workstations, and creative gear with genuine multi-brand hardware leading and on-site support.",
    displayOrder: 1,
    eyebrow: "WHAT IS HAPPENING NOW",
    imageAlt: "Summer Tech Upgrade Fest 2026",
    imageUrl: "/banners/campaign_laptop_featured.jpg",
    linkedItem: null,
    offerPrice: 89999,
    originalPrice: 109999,
    promotionCode: "campaign:summer-tech-upgrade-fest-2026",
    title: "Summer Tech Upgrade Fest 2026"
  },
  {
    actionLabel: "View Offer",
    actionUrl: "/shop?category=Audio",
    badge: "Save ₹5,000",
    badgePosition: "top-left",
    badgeTextColor: "#ffffff",
    badgeTint: "neutral",
    description:
      "World-class noise cancelling headphones with industry leading sound quality.",
    displayOrder: 2,
    eyebrow: "SONY • AUDIO",
    imageAlt: "Sony WH-1000XM5 Special Offer",
    imageUrl: "/banners/campaign_headphones_sony.jpg",
    linkedItem: null,
    offerPrice: 24990,
    originalPrice: 29990,
    promotionCode: "campaign:sony-xm5-offer",
    title: "Sony WH-1000XM5 Special Offer"
  },
  {
    actionLabel: "View Offer",
    actionUrl: "/shop?category=Smartphones",
    badge: "Bundle Deal",
    badgePosition: "top-left",
    badgeTextColor: "#ffffff",
    badgeTint: "neutral",
    description:
      "Get Galaxy AI powered performance with exclusive bundle benefits.",
    displayOrder: 3,
    eyebrow: "SAMSUNG • SMARTPHONES",
    imageAlt: "Galaxy S24 Ultra - Free Wireless Buds",
    imageUrl: "/banners/campaign_samsung_s24.jpg",
    linkedItem: null,
    offerPrice: 129999,
    originalPrice: 139999,
    promotionCode: "campaign:galaxy-s24-ultra",
    title: "Galaxy S24 Ultra - Free Wireless Buds"
  }
];
