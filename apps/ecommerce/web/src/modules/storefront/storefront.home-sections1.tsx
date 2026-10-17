import { useState, type ReactNode } from "react";
import {
  BlogSolutionsSection,
  BrandsSection,
  HeroSlider,
  HomeClosingCta,
  PromotionsSection,
  ServiceBanner,
  TechMediaTrustSection
} from "./storefront.components1";
import { SeasonBanner } from "./storefront.season-banner1";

import type {
  StorefrontBlogPost,
  StorefrontFeaturedCard,
  StorefrontPromotion,
  StorefrontSlider,
  StorefrontDiscovery
} from "./storefront.types";
import { CampaignsAndEventsSection } from "./storefront.campaigns1";

type HomeSectionKey =
  | "hero"
  | "trust"
  | "service-banner"
  | "promotions"
  | "season"
  | "campaigns-events"
  | "brands"
  | "catalog"
  | "journal"
  | "closing-cta";

type HomeSectionsProps = {
  blogPosts: StorefrontBlogPost[];
  brandName?: string | undefined;
  brands: Array<{ logoAlt: string; logoUrl: string; name: string; productCount: number }>;
  brandStrips: Array<{ logoAlt: string; logoUrl: string; name: string; productCount: number }>;
  campaignEvents: StorefrontPromotion[];
  catalog: ReactNode;
  discovery: StorefrontDiscovery;
  featuredCards: StorefrontFeaturedCard[];
  promotions: StorefrontPromotion[];
  seasonStrips: StorefrontPromotion[];
  siteNavigation: import("./storefront.types").StorefrontSiteNavigation | null;
  slides: StorefrontSlider[];
};

export const storefrontHomeSectionOrder: HomeSectionKey[] = [
  "hero",
  "brands",
  "trust",
  "promotions",
  "catalog",
  "season",
  "campaigns-events",
  "journal",
  "service-banner",
  "closing-cta"
];

export function StorefrontHomeSections(props: HomeSectionsProps) {
  const sections: Record<HomeSectionKey, ReactNode> = {
    hero: <HeroSlider slides={props.slides} />,
    trust: <TechMediaTrustSection content={props.siteNavigation?.trustedStrip} />,
    "service-banner": <ServiceBanner content={props.siteNavigation?.serviceBanner} />,
    promotions: (
      <PromotionsSection
        categories={props.discovery.categories}
        featuredCards={props.featuredCards}
        promotions={props.promotions}
      />
    ),
    season: <SeasonBanner promotions={props.seasonStrips} />,
    "campaigns-events": (
      <CampaignsAndEventsSection
        campaigns={withoutSeasonDuplicates(props.campaignEvents, props.seasonStrips)}
      />
    ),
    brands: <BrandsSection brands={props.brandStrips.length ? props.brandStrips : props.brands} />,
    catalog: props.catalog,
    journal: <BlogSolutionsSection brandName={props.brandName} posts={props.blogPosts} />,
    "closing-cta": <HomeClosingCta content={props.siteNavigation?.closingCta} />
  };

  return storefrontHomeSectionOrder.map((key) => (
    <StorefrontSectionBoundary key={key} technicalName={`storefront.home.${key}`}>
      {sections[key]}
    </StorefrontSectionBoundary>
  ));
}

function withoutSeasonDuplicates(
  campaigns: StorefrontPromotion[],
  seasonCampaigns: StorefrontPromotion[]
): StorefrontPromotion[] {
  const keysFor = (campaign: StorefrontPromotion) =>
    [campaign.promotionCode, campaign.title]
      .map((value) =>
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .trim()
      )
      .filter(Boolean);
  const seasonKeys = new Set(seasonCampaigns.flatMap(keysFor));
  const seen = new Set<string>();

  return campaigns.filter((campaign) => {
    const keys = keysFor(campaign);
    if (keys.some((key) => seasonKeys.has(key))) return false;
    if (keys.length === 0 || keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}

function StorefrontSectionBoundary({
  children,
  technicalName
}: {
  children: ReactNode;
  technicalName: string;
}) {
  const [copied, setCopied] = useState(false);
  const copyName = async () => {
    if (!(await copyToClipboard(technicalName))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="cx-store__section-boundary" data-storefront-section={technicalName}>
      {showTechnicalSectionNames() ? (
        <button
          aria-label={`Copy section name ${technicalName}`}
          className="cx-store__section-technical-name"
          onClick={() => void copyName()}
          title="Copy technical section name"
          type="button"
        >
          {copied ? "Copied" : technicalName}
        </button>
      ) : null}
      {children}
    </div>
  );
}

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }
}

function showTechnicalSectionNames() {
  const browser = window as typeof window & {
    __CXSUN_RUNTIME_CONFIG__?: Readonly<Record<string, string>>;
  };
  return browser.__CXSUN_RUNTIME_CONFIG__?.VITE_STOREFRONT_DEV_SECTION_LABELS === "1";
}
