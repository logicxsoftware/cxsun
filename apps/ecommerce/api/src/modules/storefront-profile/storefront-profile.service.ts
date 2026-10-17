import { AppError } from "@cxsun/framework/errors";
import { StorefrontProfileRepository } from "./storefront-profile.repository.js";
import { invalidateStorefrontReadCache } from "../storefront/index.js";
import type { StorefrontProfileInput } from "./storefront-profile.types.js";

export class StorefrontProfileService {
  constructor(private readonly repository = new StorefrontProfileRepository()) {}

  async get() {
    return (await this.repository.get()) ?? emptyStorefrontProfile();
  }

  async save(input: StorefrontProfileInput, actorEmail: string) {
    const profile = normalize(input);
    const saved = await this.repository.save(profile, actorEmail.trim() || "system:application");
    if (!saved)
      throw new AppError({
        code: "STOREFRONT_PROFILE_SAVE_FAILED",
        message: "The storefront profile could not be saved.",
        statusCode: 500
      });
    invalidateStorefrontReadCache();
    return saved;
  }
}

export function emptyStorefrontProfile(): StorefrontProfileInput {
  return {
    aboutUs: "",
    homeCtaActionLabel: "Browse all products",
    homeCtaActionUrl: "/shop",
    homeCtaDescription:
      "Compare dependable systems, accessories, and practical support in one place.",
    homeCtaEyebrow: "Ready when you are",
    homeCtaTitle: "Technology for your work",
    copyrightText: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    paymentMethods: [
      { logoUrl: "", name: "VISA" },
      { logoUrl: "", name: "Mastercard" },
      { logoUrl: "", name: "UPI" },
      { logoUrl: "", name: "G Pay" }
    ],
    poweredByText: "",
    serviceActionLabel: "Get support",
    serviceActionUrl: "/support",
    serviceDescription:
      "Local help for products, installation, maintenance, and ongoing technology needs.",
    serviceEyebrow: "Tech Media care",
    serviceTitle: "Technology works better with support close by.",
    tagline: "",
    trustedDescription:
      "We help you choose technology that fits the work, set it up properly, and keep it useful as your needs grow.",
    trustedEyebrow: "Trusted in Tiruppur since 2002",
    trustedProofPoints:
      "Multi-brand guidance\nLocal technical support\nRetail and business expertise",
    trustedPanels: [
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
        title: "Computers and laptops"
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
        title: "Business IT solutions"
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
        title: "Service and support"
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
        title: "Security and access"
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
        title: "Managed infrastructure"
      }
    ],
    trustedTitle: "25+ years of practical technology experience",
    threadsUrl: "",
    whatsappUrl: "",
    xUrl: "",
    youtubeUrl: ""
  };
}

function normalize(input: StorefrontProfileInput): StorefrontProfileInput {
  return {
    ...Object.fromEntries(
      Object.entries(input)
        .filter(([key]) => key !== "paymentMethods")
        .map(([key, value]) => [key, String(value).trim()])
    ),
    paymentMethods: input.paymentMethods.map((method) => ({
      logoUrl: method.logoUrl.trim(),
      name: method.name.trim()
    }))
  } as StorefrontProfileInput;
}
