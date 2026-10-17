import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
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
  const track = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayCampaigns = campaigns.length ? campaigns : fallbackCampaigns;

  const scrollToSlide = (index: number) => {
    const target = Math.max(0, Math.min(index, displayCampaigns.length - 1));
    setCurrentIndex(target);
    if (!track.current) return;
    const card = track.current.children[target] as HTMLElement | undefined;
    if (card) {
      track.current.scrollTo({
        left: card.offsetLeft - track.current.offsetLeft - 8,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    if (!track.current) return;
    const scrollLeft = track.current.scrollLeft;
    const cardWidth = track.current.clientWidth;
    const newIndex = Math.round(scrollLeft / (cardWidth || 1));
    if (newIndex >= 0 && newIndex < displayCampaigns.length) {
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [displayCampaigns.length]);

  const move = (direction: -1 | 1) => {
    if (window.innerWidth <= 767) {
      const next = (currentIndex + direction + displayCampaigns.length) % displayCampaigns.length;
      scrollToSlide(next);
    } else {
      track.current?.scrollBy({
        behavior: "smooth",
        left: direction * (track.current.clientWidth * 0.75)
      });
    }
  };

  return (
    <section className="cx-campaigns-section" aria-labelledby="campaigns-events-title">
      {/* Decorative Atmospheric Ambient Illustrations (Left & Right) */}
      <LeftDecorGraphic />
      <RightDecorGraphic />

      {/* Section Header */}
      <header className="cx-campaigns-header">
        <div className="cx-campaigns-header__copy">
          <span className="cx-campaigns-header__eyebrow">WHAT IS HAPPENING NOW</span>
          <h2 className="cx-campaigns-header__title" id="campaigns-events-title">
            Campaigns and Events
          </h2>
          <p className="cx-campaigns-header__subtitle">
            Discover the latest offers, special deals and upcoming events.
          </p>
        </div>

        <div className="cx-campaigns-header__right">
          {/* Floating Illustrations (Megaphone, Coupon Tag, Paper Plane) */}
          <div className="cx-campaigns-header__decorations" aria-hidden="true">
            <MegaphoneGraphic />
            <DiscountTagGraphic />
            <PaperPlaneGraphic />
          </div>

          <a className="cx-campaigns-header__see-all" href="/campaigns">
            See all <ArrowUpRightIcon />
          </a>
        </div>
      </header>

      {/* Carousel Wrapper */}
      <div className="cx-campaigns-carousel">
        <button
          aria-label="Previous campaign"
          className="cx-campaigns-btn cx-campaigns-btn--prev"
          onClick={() => move(-1)}
          type="button"
        >
          <ArrowLeftIcon />
        </button>

        <div className="cx-campaigns-track" ref={track}>
          {displayCampaigns.map((campaign, idx) => (
            <CampaignCard campaign={campaign} index={idx} key={campaign.promotionCode} />
          ))}
        </div>

        <button
          aria-label="Next campaign"
          className="cx-campaigns-btn cx-campaigns-btn--next"
          onClick={() => move(1)}
          type="button"
        >
          <ArrowRightIcon />
        </button>
      </div>

      {/* Mobile Pagination Dots */}
      <div className="cx-campaigns-dots" aria-hidden="true">
        {displayCampaigns.map((_, idx) => (
          <button
            aria-label={`Slide ${idx + 1}`}
            className={`cx-campaigns-dot${idx === currentIndex ? " cx-campaigns-dot--active" : ""}`}
            key={idx}
            onClick={() => scrollToSlide(idx)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

export function CampaignsCollection({ campaigns }: { campaigns: StorefrontPromotion[] }) {
  const displayCampaigns = campaigns.length ? campaigns : fallbackCampaigns;

  return (
    <main className="cx-store__campaigns-page">
      <header>
        <span>Tech Media campaigns</span>
        <h1>Campaigns, events, and current opportunities.</h1>
        <p>
          Explore product launches, seasonal offers, learning events, giveaways, and customer
          programmes available through Tech Media.
        </p>
      </header>
      <div className="cx-store__campaigns-grid">
        {displayCampaigns.map((campaign, idx) => (
          <CampaignCard campaign={campaign} index={idx} key={campaign.promotionCode} />
        ))}
      </div>
    </main>
  );
}

function CampaignCard({ campaign, index }: { campaign: StorefrontPromotion; index: number }) {
  const badgeText = campaign.badge || (campaign.offerPrice ? "Special Offer" : "Featured Deal");
  const isAudio =
    index === 0 ||
    index === 1 ||
    campaign.eyebrow?.toLowerCase().includes("audio") ||
    campaign.title.toLowerCase().includes("headphone") ||
    campaign.title.toLowerCase().includes("wh-1000xm5");
  const isFlagship =
    index === 2 ||
    campaign.eyebrow?.toLowerCase().includes("flagship") ||
    campaign.title.toLowerCase().includes("s24") ||
    campaign.badge?.toLowerCase().includes("bundle");

  return (
    <a className="cx-campaign-card" href={campaign.actionUrl || "/shop"}>
      {/* Media Half with Badge, Product Image, and Illustrator Overlays */}
      <div className={`cx-campaign-card__media${isFlagship ? " cx-campaign-card__media--dark" : " cx-campaign-card__media--yellow"}`}>
        {campaign.imageUrl ? (
          <img
            alt={campaign.imageAlt || campaign.title}
            decoding="async"
            loading="lazy"
            src={campaign.imageUrl}
          />
        ) : (
          <div className="cx-campaign-card__fallback-media">
            <strong>{campaign.title.slice(0, 2).toUpperCase()}</strong>
          </div>
        )}

        {/* Clean Rectangular Chip Badge (Moderate 4px radius, NO pill) */}
        {badgeText ? <span className="cx-campaign-card__badge">{badgeText}</span> : null}

        {/* Illustrator Audio Soundwave Ticks (for Headphones) */}
        {isAudio ? (
          <>
            <div className="cx-card-soundwaves cx-card-soundwaves--left" aria-hidden="true">
              <svg viewBox="0 0 24 40" fill="none" width="20" height="34">
                <path d="M16 8c-6 4-9 9-9 15s3 11 9 15" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M9 14c-4 3-6 6-6 10s2 7 6 10" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="cx-card-soundwaves cx-card-soundwaves--right" aria-hidden="true">
              <svg viewBox="0 0 24 40" fill="none" width="20" height="34">
                <path d="M8 6c6 4 9 10 9 16s-3 12-9 16" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M15 12c4 3 6 7 6 11s-2 8-6 11" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M21 18c2 2 3 4 3 6s-1 4-3 6" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
          </>
        ) : null}

        {/* Illustrator Sparkle Stars & Burst (for Flagship Phone) */}
        {isFlagship ? (
          <div className="cx-card-flagship-sparks" aria-hidden="true">
            <svg viewBox="0 0 44 44" fill="none" width="38" height="38">
              <path d="M20 4c0 5-2 8-7 8 5 0 7 3 7 8 0-5 2-8 7-8-5 0-7-3-7-8z" fill="#ffffff" />
              <path d="M34 16c0 3-1 5-4 5 3 0 4 2 4 5 0-3 1-5 4-5-3 0-4-2-4-5z" fill="#ffffff" opacity="0.8" />
              <line x1="28" y1="6" x2="33" y2="3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="33" y1="12" x2="38" y2="10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        ) : null}
      </div>

      {/* Content Half */}
      <div className="cx-campaign-card__content">
        {campaign.eyebrow ? (
          <span className="cx-campaign-card__eyebrow">{campaign.eyebrow}</span>
        ) : null}

        <strong className="cx-campaign-card__title">{campaign.title}</strong>

        {campaign.description ? (
          <p className="cx-campaign-card__desc">{campaign.description}</p>
        ) : null}

        <span className="cx-campaign-card__action">
          {campaign.actionLabel || "View Offer"} <ArrowRightIcon />
        </span>
      </div>
    </a>
  );
}

/* ==========================================================================
   DECORATIVE VECTOR GRAPHICS (Matching the Illustrator Style Design)
   ========================================================================== */

function LeftDecorGraphic() {
  return (
    <div className="cx-campaigns-left-decor" aria-hidden="true">
      {/* Organic yellow ambient wave */}
      <svg className="cx-campaigns-left-wave" viewBox="0 0 320 480" fill="none" preserveAspectRatio="none">
        <path
          d="M-50 40 C 40 10, 160 50, 220 160 C 280 270, 250 380, 140 430 C 40 470, -40 450, -60 410 Z"
          fill="#fef3c7"
          opacity="0.9"
        />
        <path
          d="M-30 140 C 30 110, 120 140, 150 220 C 180 300, 110 370, 20 400 Z"
          fill="#fde68a"
          opacity="0.55"
        />
      </svg>
      {/* 3 Sunburst Rays on Left */}
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="cx-campaigns-left-rays">
        <line x1="6" y1="8" x2="20" y2="4" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="4" y1="18" x2="22" y2="18" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="6" y1="28" x2="20" y2="32" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
      {/* Dot Grid */}
      <div className="cx-campaigns-left-dots">
        <DotGridGraphic />
      </div>
    </div>
  );
}

function RightDecorGraphic() {
  return (
    <div className="cx-campaigns-right-decor" aria-hidden="true">
      {/* Organic mint green ambient wave */}
      <svg className="cx-campaigns-right-wave" viewBox="0 0 340 480" fill="none" preserveAspectRatio="none">
        <path
          d="M100 50 C 200 10, 320 50, 360 140 C 400 230, 390 360, 290 420 C 200 470, 100 450, 60 380 C 20 310, 10 190, 50 120 C 65 90, 82 65, 100 50 Z"
          fill="#dcfce7"
          opacity="0.88"
        />
        <path
          d="M160 160 C 230 120, 320 170, 340 250 C 360 320, 300 390, 220 420 Z"
          fill="#bbf7d0"
          opacity="0.6"
        />
      </svg>
      {/* Shopping Bags */}
      <div className="cx-campaigns-right-bags">
        <ShoppingBagsGraphic />
      </div>
      {/* Mint Dots */}
      <div className="cx-campaigns-right-dots">
        <MintDotGridGraphic />
      </div>
    </div>
  );
}

function MegaphoneGraphic() {
  return (
    <svg width="78" height="64" viewBox="0 0 78 64" fill="none" className="cx-illustrator-megaphone" aria-hidden="true">
      {/* Sound blast waves and sparkle */}
      <path d="M62 20a12 12 0 0 1 0 20" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M68 14a20 20 0 0 1 0 32" stroke="#86efac" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M52 8c0 3.5-1.5 5-5 5 3.5 0 5 1.5 5 5 0-3.5 1.5-5 5-5-3.5 0-5-1.5-5-5z" fill="#facc15" />

      {/* Main Megaphone Cone (tilted at -20deg) */}
      <g transform="rotate(-20 32 36)">
        {/* Grip Handle */}
        <path d="M22 34l-5 14a2 2 0 0 0 1.9 2.7h3.8a2 2 0 0 0 1.9-1.4l3.4-15.3" fill="#166534" />
        <path d="M20 36l-4 11a1.5 1.5 0 0 0 1.4 2h2.5a1.5 1.5 0 0 0 1.4-1l2.7-12" fill="#22c55e" opacity="0.6" />

        {/* Back Chamber / Microphone cylinder */}
        <rect x="14" y="22" width="10" height="16" rx="3" fill="#15803d" />
        <rect x="16" y="24" width="7" height="12" rx="2" fill="#16a34a" />

        {/* Main Cone Expansion */}
        <polygon points="24,24 46,12 46,48 24,36" fill="#22c55e" />
        <polygon points="24,24 46,12 46,26 24,30" fill="#4ade80" />
        <polygon points="24,32 46,38 46,48 24,36" fill="#16a34a" />

        {/* Flared Front Bell / Horn Rim */}
        <ellipse cx="46" cy="30" rx="4.5" ry="18" fill="#ffffff" />
        <ellipse cx="46" cy="30" rx="3.5" ry="16" fill="#0f172a" />
        <ellipse cx="46.5" cy="30" rx="2" ry="11" fill="#15803d" />
      </g>
    </svg>
  );
}

function DiscountTagGraphic() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" className="cx-illustrator-tag" aria-hidden="true">
      <g transform="rotate(12 23 23)">
        {/* Yellow Ticket Badge with Scalloped Notches */}
        <rect x="7" y="7" width="32" height="32" rx="7" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="7" cy="23" r="3.5" fill="#ffffff" />
        <circle cx="39" cy="23" r="3.5" fill="#ffffff" />
        <circle cx="23" cy="7" r="3.5" fill="#ffffff" />
        <circle cx="23" cy="39" r="3.5" fill="#ffffff" />

        {/* Inner dashed stitch line */}
        <rect x="11" y="11" width="24" height="24" rx="4" stroke="#fef08a" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />

        {/* White % percentage sign */}
        <circle cx="17.5" cy="18" r="2.8" fill="#ffffff" />
        <path d="M16 29l14-12" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="28.5" cy="28" r="2.8" fill="#ffffff" />
      </g>
    </svg>
  );
}

function PaperPlaneGraphic() {
  return (
    <svg width="44" height="40" viewBox="0 0 44 40" fill="none" className="cx-illustrator-plane" aria-hidden="true">
      {/* Contrail Dotted Flight Path */}
      <path d="M4 36c10-2 18-9 22-18" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />

      {/* Origami Paper Airplane Flying to top-right */}
      <g transform="translate(6, 4)">
        {/* Main top wing */}
        <polygon points="6,18 32,4 18,28" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Underside fold */}
        <polygon points="18,28 32,4 21,20" fill="#f59e0b" />
        {/* Keel fold underneath */}
        <polygon points="18,28 21,20 14,23" fill="#ca8a04" />
        {/* Center crease fold */}
        <line x1="6" y1="18" x2="32" y2="4" stroke="#eab308" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function ShoppingBagsGraphic() {
  return (
    <svg width="120" height="115" viewBox="0 0 120 115" fill="none" className="cx-illustrator-bags" aria-hidden="true">
      {/* Subtle floor contact shadow */}
      <ellipse cx="62" cy="104" rx="48" ry="8" fill="#15803d" opacity="0.18" />

      {/* Burst Energy Rays above Yellow Bag */}
      <line x1="94" y1="26" x2="105" y2="16" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="102" y1="34" x2="114" y2="28" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="100" y1="44" x2="114" y2="46" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />

      {/* ====================================================
          YELLOW SHOPPING BAG (Behind, to the right)
          ==================================================== */}
      {/* Yellow Bag Body - Front Face */}
      <polygon points="56,48 90,44 90,96 56,101" fill="#facc15" />
      {/* Yellow Bag - Right Side Depth Face */}
      <polygon points="90,44 102,40 102,91 90,96" fill="#eab308" />
      {/* Yellow Bag - Top Opening Lip */}
      <polygon points="56,48 68,44 102,40 90,44" fill="#fef08a" />
      {/* Yellow Bag - Inner Rim Shadow */}
      <polygon points="58,48 68,44.5 100,41 90,44.5" fill="#ca8a04" opacity="0.35" />
      {/* Yellow Bag - Arched White Handles */}
      <path d="M68 46v-14a6 6 0 0 1 12 0v13" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M72 45v-13a4 4 0 0 1 8 0v12" stroke="#fde047" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />

      {/* ====================================================
          GREEN SHOPPING BAG (Front, to the left)
          ==================================================== */}
      {/* Green Bag Body - Front Face */}
      <polygon points="16,42 54,37 54,94 16,100" fill="#22c55e" />
      {/* Green Bag - Right Side Depth Face */}
      <polygon points="54,37 68,32 68,88 54,94" fill="#16a34a" />
      {/* Green Bag - Top Opening Lip */}
      <polygon points="16,42 30,37 68,32 54,37" fill="#4ade80" />
      {/* Green Bag - Inner Rim Shadow */}
      <polygon points="18,42 30,37.5 66,33 54,37.5" fill="#14532d" opacity="0.4" />
      {/* Green Bag - Arched White Handles */}
      <path d="M30 40v-16a7 7 0 0 1 14 0v14" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M34 39v-15a5 5 0 0 1 10 0v13" stroke="#bbf7d0" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  );
}

function DotGridGraphic() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="cx-campaigns-dotgrid" aria-hidden="true">
      <circle cx="6" cy="6" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="18" cy="6" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="30" cy="6" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="6" cy="18" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="18" cy="18" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="30" cy="18" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="6" cy="30" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="18" cy="30" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="30" cy="30" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="6" cy="42" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="18" cy="42" r="2.2" fill="#facc15" opacity="0.75" />
      <circle cx="30" cy="42" r="2.2" fill="#facc15" opacity="0.75" />
    </svg>
  );
}

function MintDotGridGraphic() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="cx-campaigns-mintdots" aria-hidden="true">
      <circle cx="6" cy="6" r="2.2" fill="#86efac" opacity="0.65" />
      <circle cx="18" cy="6" r="2.2" fill="#86efac" opacity="0.65" />
      <circle cx="30" cy="6" r="2.2" fill="#86efac" opacity="0.65" />
      <circle cx="6" cy="18" r="2.2" fill="#86efac" opacity="0.65" />
      <circle cx="18" cy="18" r="2.2" fill="#86efac" opacity="0.65" />
      <circle cx="30" cy="18" r="2.2" fill="#86efac" opacity="0.65" />
      <circle cx="6" cy="30" r="2.2" fill="#86efac" opacity="0.65" />
      <circle cx="18" cy="30" r="2.2" fill="#86efac" opacity="0.65" />
      <circle cx="30" cy="30" r="2.2" fill="#86efac" opacity="0.65" />
    </svg>
  );
}

/* Fallback Campaigns matching the exact visual items in the design image */
const fallbackCampaigns: StorefrontPromotion[] = [
  {
    actionLabel: "View Offer",
    actionUrl: "/shop",
    badge: "Save ₹5,000",
    badgePosition: "top-left",
    badgeTextColor: "#ffffff",
    badgeTint: "neutral",
    description: "Save ₹5,000 on world-class noise cancelling headphones today.",
    displayOrder: 1,
    eyebrow: "EXCLUSIVE DISCOUNT",
    imageAlt: "Sony WH-1000XM5 Special Offer",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    linkedItem: null,
    offerPrice: 24990,
    originalPrice: 29990,
    promotionCode: "campaign:sony-xm5-offer-1",
    title: "Sony WH-1000XM5 Special Offer"
  },
  {
    actionLabel: "View Offer",
    actionUrl: "/shop",
    badge: "Save ₹5,000",
    badgePosition: "top-left",
    badgeTextColor: "#ffffff",
    badgeTint: "neutral",
    description: "World-class noise cancelling headphones with industry leading sound quality.",
    displayOrder: 2,
    eyebrow: "SONY • AUDIO",
    imageAlt: "Sony WH-1000XM5 Special Offer",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    linkedItem: null,
    offerPrice: 24990,
    originalPrice: 29990,
    promotionCode: "campaign:sony-xm5-offer-2",
    title: "Sony WH-1000XM5 Special Offer"
  },
  {
    actionLabel: "View Offer",
    actionUrl: "/shop",
    badge: "Bundle Deal",
    badgePosition: "top-left",
    badgeTextColor: "#ffffff",
    badgeTint: "neutral",
    description: "Get Galaxy AI powered performance with exclusive bundle benefits.",
    displayOrder: 3,
    eyebrow: "FLAGSHIP UPGRADE",
    imageAlt: "Galaxy S24 Ultra - Free Wireless Buds",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    linkedItem: null,
    offerPrice: 129999,
    originalPrice: 139999,
    promotionCode: "campaign:galaxy-s24-ultra",
    title: "Galaxy S24 Ultra - Free Wireless Buds"
  }
];
