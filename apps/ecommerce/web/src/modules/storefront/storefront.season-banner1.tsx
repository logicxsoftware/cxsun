import {
  ArrowUpRightIcon,
  HeadphonesIcon,
  LaptopIcon,
  MonitorIcon,
  TruckIcon,
  WrenchIcon
} from "lucide-react";
import type { StorefrontPromotion } from "./storefront.types";
import "./storefront.season-banner1.css";

export function SeasonBanner({ promotions }: { promotions: StorefrontPromotion[] }) {
  const campaign = promotions[0];
  if (!campaign) return null;

  const eyebrow = campaign.eyebrow || "TECHMEDIA CARE & INNOVATION";
  const title = campaign.title || "Summer Tech Upgrade Fest 2026";
  const description =
    campaign.description ||
    "Upgrade your business setup, workstations, and creative gear with genuine multi-brand hardware and on-site support.";
  const actionLabel = campaign.actionLabel || "Explore Deals";
  const actionUrl = campaign.actionUrl || "/shop";

  const titleParts = parseSeasonTitle(title);
  const badgeData = parseSeasonBadge(campaign.badge, campaign.offerPrice, campaign.originalPrice);

  return (
    <section className="cx-season-banner-section" aria-label={title}>
      <div className="cx-season-banner-card">
        {/* Upper Hero Offer Tier (Cream Background) */}
        <div className="cx-season-hero-tier">
          {/* Left Column: Offer Copy + CTA + Quick Categories */}
          <div className="cx-season-copy-col">
            <div className="cx-season-eyebrow-row">
              <span className="cx-season-red-dot" aria-hidden="true" />
              <span className="cx-season-eyebrow">{eyebrow}</span>
            </div>

            <h2 className="cx-season-heading">
              <span className="cx-season-heading-light">{titleParts.light}</span>{" "}
              <span className="cx-season-heading-accent">
                <span className="cx-season-accent-underlined">
                  {titleParts.accentWord}
                  {/* Red hand-drawn wave underline swoosh */}
                  <svg
                    className="cx-season-curve-line"
                    viewBox="0 0 150 14"
                    fill="none"
                    aria-hidden="true"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9 C 35 2, 75 14, 110 5 C 128 0, 142 6, 148 8"
                      stroke="#881337"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                {titleParts.accentRest ? ` ${titleParts.accentRest}` : ""}
                {/* Decorative Sparkles (plus and dot) */}
                <span className="cx-season-sparkles" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <line
                      x1="11"
                      y1="2"
                      x2="11"
                      y2="10"
                      stroke="#881337"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="7"
                      y1="6"
                      x2="15"
                      y2="6"
                      stroke="#881337"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <circle cx="18" cy="12" r="1.6" fill="#881337" />
                  </svg>
                </span>
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

          {/* Right Column: 3D Crimson Illustrator Showcase Stage */}
          <div className="cx-season-showcase-col">
            {campaign.imageUrl ? (
              <div className="cx-season-image-stage">
                <img
                  alt={campaign.imageAlt || title}
                  className="cx-season-campaign-image"
                  decoding="async"
                  loading="lazy"
                  src={campaign.imageUrl}
                />
                <span
                  className={`cx-season-image-badge cx-season-image-badge--${campaign.badgePosition}`}
                  style={{
                    backgroundColor:
                      campaign.badgeTint === "brand" ? "#881337" : campaign.badgeTint,
                    color: campaign.badgeTextColor || "#ffffff"
                  }}
                >
                  {campaign.badge || `${badgeData.main} ${badgeData.bottom}`}
                </span>
                <svg
                  aria-hidden="true"
                  className="cx-season-image-sparkle"
                  fill="none"
                  viewBox="0 0 80 80"
                >
                  <path
                    d="M40 4v72M4 40h72M14.5 14.5l51 51m0-51-51 51"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                  <circle cx="40" cy="40" r="12" stroke="currentColor" strokeDasharray="2 4" />
                </svg>
              </div>
            ) : (
              <SeasonFestStageVisual badgeData={badgeData} />
            )}
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

/* ==========================================================================
   ILLUSTRATOR 3D WORKSTATION SHOWCASE STAGE
   ========================================================================== */

function SeasonFestStageVisual({
  badgeData
}: {
  badgeData: { top: string; main: string; bottom: string };
}) {
  return (
    <svg viewBox="0 0 540 360" fill="none" className="cx-season-showcase-svg" aria-hidden="true">
      <defs>
        {/* Screen Neon Wallpaper Diagonal Stripes */}
        <linearGradient id="neonFestStripeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4c0519" />
          <stop offset="20%" stopColor="#881337" />
          <stop offset="45%" stopColor="#e11d48" />
          <stop offset="70%" stopColor="#ea580c" />
          <stop offset="90%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        <linearGradient id="stageTopSurfaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#881337" />
          <stop offset="100%" stopColor="#701a2d" />
        </linearGradient>

        {/* Display Screen Clip Path */}
        <clipPath id="festMonitorClip">
          <polygon points="258,79 426,53 426,210 258,236" />
        </clipPath>
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

      {/* Curved Dotted Orbital Track around the Badge */}
      <ellipse
        cx="218"
        cy="150"
        rx="95"
        ry="85"
        stroke="#f43f5e"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        opacity="0.32"
        transform="rotate(-15 218 150)"
      />

      {/* Large Crimson Curved Backdrop Screen (Behind Monitor) */}
      <path d="M275 35 h135 a28 28 0 0 1 28 28 v235 h-163 z" fill="#701a2d" opacity="0.95" />

      {/* Stepped Crimson 3D Pedestal Stage */}
      {/* Soft Ground Contact Shadow */}
      <ellipse cx="270" cy="336" rx="230" ry="20" fill="#4c0519" opacity="0.25" />

      {/* Main Pedestal Base */}
      {/* Top Face */}
      <polygon points="120,248 310,215 480,252 290,288" fill="url(#stageTopSurfaceGrad)" />
      {/* Front-Left Face */}
      <polygon points="120,248 290,288 290,328 120,288" fill="#581323" />
      {/* Front-Right Face */}
      <polygon points="290,288 480,252 480,292 290,328" fill="#3b0814" />

      {/* Modern Open Workstation Laptop/Monitor on Pedestal */}
      {/* Base chassis / keyboard deck */}
      <polygon points="175,245 375,212 430,230 230,265" fill="#94a3b8" />
      <polygon points="178,243 372,211 425,228 228,262" fill="#f8fafc" />
      {/* Trackpad */}
      <polygon points="240,250 295,242 308,248 252,258" fill="#cbd5e1" opacity="0.9" />
      {/* Keyboard well */}
      <polygon points="215,236 360,214 398,226 250,250" fill="#0f172a" opacity="0.92" />

      {/* Display Frame / Screen Lid */}
      <polygon points="255,76 430,50 430,214 255,240" fill="#0f172a" />
      <polygon points="258,79 426,53 426,210 258,236" fill="#030008" />

      {/* Screen Artwork: Radiant Neon Waves + Optional Backend Image Integration */}
      <g clipPath="url(#festMonitorClip)">
        <rect x="245" y="40" width="195" height="210" fill="#05010a" />

        {/* Diagonal Warm Gradient Stripes (Matching Design) */}
        <polygon
          points="255,240 340,225 430,120 430,70 300,200 255,240"
          fill="url(#neonFestStripeGrad)"
        />
        <polygon
          points="275,238 360,220 430,140 430,100 320,195 275,238"
          fill="#f43f5e"
          opacity="0.9"
        />
        <polygon
          points="295,235 380,216 430,165 430,135 340,190 295,235"
          fill="#f97316"
          opacity="0.92"
        />
        <polygon
          points="315,232 400,212 430,185 430,165 360,185 315,232"
          fill="#facc15"
          opacity="0.95"
        />
      </g>

      {/* Laptop Camera dot */}
      <circle cx="342" cy="64" r="1.5" fill="#64748b" />

      {/* Potted Plant on Right Pedestal Corner */}
      <path d="M446 252 l3-32 h24 l3 32 z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <ellipse cx="461" cy="220" rx="12" ry="4" fill="#3f2316" />
      {/* Upright Green Leaves */}
      <path d="M461 219c-4-26-14-42-26-52 5 21 12 37 24 52z" fill="#15803d" />
      <path d="M461 219c4-26 16-42 28-52-5 21-14 37-24 52z" fill="#166534" />
      <path d="M461 219c0-30 2-48 7-60-1 22-3 42-7 60z" fill="#22c55e" />
      <path d="M461 219c-9-22-20-33-32-40 10 16 20 28 28 40z" fill="#15803d" />
      <path d="M461 219c9-22 22-33 34-40-10 16-21 28-30 40z" fill="#4ade80" />

      {/* ====================================================
          FLOATING "UP TO 40% OFF" BADGE (Left of monitor)
          ==================================================== */}
      <g filter="url(#badgeDropShadow)">
        <defs>
          <filter
            id="badgeDropShadow"
            x="160"
            y="48"
            width="114"
            height="128"
            filterUnits="userSpaceOnUse"
          >
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>
        <rect
          x="172"
          y="58"
          width="88"
          height="102"
          rx="18"
          fill="#ffffff"
          fillOpacity="0.97"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <text
          x="216"
          y="80"
          fill="#64748b"
          fontSize="10"
          fontWeight="700"
          textAnchor="middle"
          letterSpacing="0.08em"
          fontFamily="'Inter', sans-serif"
        >
          {badgeData.top}
        </text>
        <text
          x="216"
          y="122"
          fill="#881337"
          fontSize="33"
          fontWeight="900"
          textAnchor="middle"
          fontFamily="'Manrope', sans-serif"
        >
          {badgeData.main}
        </text>
        <text
          x="216"
          y="144"
          fill="#64748b"
          fontSize="10.5"
          fontWeight="700"
          textAnchor="middle"
          letterSpacing="0.08em"
          fontFamily="'Inter', sans-serif"
        >
          {badgeData.bottom}
        </text>
      </g>

      {/* ====================================================
          FLOATING FEATURE CARDS (Right of monitor)
          ==================================================== */}
      {/* Pill 1: Trusted Brands */}
      <g>
        <rect
          x="424"
          y="52"
          width="108"
          height="40"
          rx="10"
          fill="#ffffff"
          stroke="rgba(0,0,0,0.05)"
          strokeWidth="1"
        />
        <circle cx="442" cy="72" r="11" fill="#fff1f2" />
        <path d="M442 66l4 2v4c0 3-1.8 5.5-4 6.5-2.2-1-4-3.5-4-6.5v-4l4-2z" fill="#9f1239" />
        <text
          x="460"
          y="70"
          fill="#0f172a"
          fontSize="10.5"
          fontWeight="700"
          fontFamily="'Inter', sans-serif"
        >
          Trusted
        </text>
        <text
          x="460"
          y="81"
          fill="#64748b"
          fontSize="9"
          fontWeight="600"
          fontFamily="'Inter', sans-serif"
        >
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
          stroke="rgba(0,0,0,0.05)"
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
        <text
          x="460"
          y="122"
          fill="#0f172a"
          fontSize="10.5"
          fontWeight="700"
          fontFamily="'Inter', sans-serif"
        >
          Latest
        </text>
        <text
          x="460"
          y="133"
          fill="#64748b"
          fontSize="9"
          fontWeight="600"
          fontFamily="'Inter', sans-serif"
        >
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
          stroke="rgba(0,0,0,0.05)"
          strokeWidth="1"
        />
        <circle cx="442" cy="176" r="11" fill="#fff1f2" />
        <path d="M443 169l-4 8h4l-1 6 5-9h-4l2-5z" fill="#9f1239" />
        <text
          x="460"
          y="174"
          fill="#0f172a"
          fontSize="10.5"
          fontWeight="700"
          fontFamily="'Inter', sans-serif"
        >
          Best
        </text>
        <text
          x="460"
          y="185"
          fill="#64748b"
          fontSize="9"
          fontWeight="600"
          fontFamily="'Inter', sans-serif"
        >
          Deals
        </text>
      </g>
    </svg>
  );
}

/* ==========================================================================
   DYNAMIC BACKEND API DATA PARSERS
   ========================================================================== */

function parseSeasonTitle(titleText: string) {
  const trimmed = titleText.trim();
  if (/^summer\s+tech/i.test(trimmed)) {
    const after = trimmed.replace(/^summer\s+tech\s*/i, "");
    const parts = after.split(/\s+/);
    return {
      light: "Summer Tech",
      accentWord: parts[0] || "Upgrade",
      accentRest: parts.slice(1).join(" ") || "Fest 2026"
    };
  }
  const words = trimmed.split(/\s+/);
  if (words.length <= 2) {
    return {
      light: words[0] || "",
      accentWord: words[1] || "",
      accentRest: ""
    };
  }
  return {
    light: words.slice(0, 2).join(" "),
    accentWord: words[2] || "",
    accentRest: words.slice(3).join(" ")
  };
}

function parseSeasonBadge(badgeText?: string, offerPrice?: number, originalPrice?: number | null) {
  if (offerPrice && originalPrice && originalPrice > offerPrice) {
    const pct = Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
    return { top: "UP TO", main: `${pct}%`, bottom: "OFF" };
  }
  if (!badgeText) {
    return { top: "FEATURED", main: "SEASON", bottom: "PICK" };
  }
  const pctMatch = badgeText.match(/(\d+)\s*%/);
  if (pctMatch) {
    return { top: "UP TO", main: `${pctMatch[1]}%`, bottom: "OFF" };
  }
  const words = badgeText.trim().split(/\s+/);
  if (words.length === 1) {
    return { top: "SPECIAL", main: (words[0] ?? "").toUpperCase(), bottom: "DEAL" };
  }
  return {
    top: (words[0] ?? "SPECIAL").toUpperCase(),
    main: (words[1] ?? "DEAL").toUpperCase(),
    bottom: words.slice(2).join(" ").toUpperCase() || "DEAL"
  };
}
