import { sql } from "kysely";
import { getEcommerceDatabase } from "../../database/ecommerce-database.js";
import type {
  StorefrontPaymentMethod,
  StorefrontProfile,
  StorefrontProfileInput,
  StorefrontTrustedPanel
} from "./storefront-profile.types.js";

type Row = {
  about_us: string;
  home_cta_action_label: string;
  home_cta_action_url: string;
  home_cta_description: string;
  home_cta_eyebrow: string;
  home_cta_title: string;
  copyright_text: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  payment_methods_json: string | null;
  powered_by_text: string;
  service_action_label: string;
  service_action_url: string;
  service_description: string;
  service_eyebrow: string;
  service_title: string;
  tagline: string;
  trusted_description: string;
  trusted_eyebrow: string;
  trusted_proof_points: string;
  trusted_panels_json: string | null;
  trusted_title: string;
  threads_url: string;
  whatsapp_url: string;
  x_url: string;
  youtube_url: string;
};

export class StorefrontProfileRepository {
  async get(): Promise<StorefrontProfile | null> {
    const result = await sql<Row>`SELECT tagline,about_us,home_cta_action_label,home_cta_action_url,
      home_cta_description,home_cta_eyebrow,home_cta_title,copyright_text,powered_by_text,payment_methods_json,
      facebook_url,linkedin_url,instagram_url,x_url,youtube_url,whatsapp_url,threads_url
      ,trusted_eyebrow,trusted_title,trusted_description,trusted_proof_points,trusted_panels_json,
      service_eyebrow,service_title,service_description,service_action_label,service_action_url
      FROM ecommerce_storefront_profiles
      WHERE profile_key='default' AND status='active' LIMIT 1`.execute(getEcommerceDatabase());
    return result.rows[0] ? toProfile(result.rows[0]) : null;
  }

  async save(input: StorefrontProfileInput, actorEmail: string) {
    await sql`INSERT INTO ecommerce_storefront_profiles
      (uuid,profile_key,tagline,about_us,home_cta_action_label,home_cta_action_url,home_cta_description,
       home_cta_eyebrow,home_cta_title,copyright_text,powered_by_text,payment_methods_json,facebook_url,linkedin_url,
       instagram_url,x_url,youtube_url,whatsapp_url,threads_url,trusted_eyebrow,trusted_title,
       trusted_description,trusted_proof_points,trusted_panels_json,service_eyebrow,service_title,service_description,
       service_action_label,service_action_url,status,created_by,updated_by)
      VALUES (LOWER(SUBSTRING(MD5('ecommerce:storefront-profile:default'),1,8)),'default',
       ${input.tagline},${input.aboutUs},${input.homeCtaActionLabel},${input.homeCtaActionUrl},
       ${input.homeCtaDescription},${input.homeCtaEyebrow},${input.homeCtaTitle},${input.copyrightText},
       ${input.poweredByText},${JSON.stringify(input.paymentMethods)},
       ${input.facebookUrl},${input.linkedinUrl},${input.instagramUrl},${input.xUrl},
       ${input.youtubeUrl},${input.whatsappUrl},${input.threadsUrl},${input.trustedEyebrow},
       ${input.trustedTitle},${input.trustedDescription},${input.trustedProofPoints},${JSON.stringify(input.trustedPanels)},
       ${input.serviceEyebrow},${input.serviceTitle},${input.serviceDescription},
       ${input.serviceActionLabel},${input.serviceActionUrl},'active',${actorEmail},${actorEmail})
      ON DUPLICATE KEY UPDATE tagline=VALUES(tagline),about_us=VALUES(about_us),
       home_cta_action_label=VALUES(home_cta_action_label),home_cta_action_url=VALUES(home_cta_action_url),
       home_cta_description=VALUES(home_cta_description),home_cta_eyebrow=VALUES(home_cta_eyebrow),
       home_cta_title=VALUES(home_cta_title),
       copyright_text=VALUES(copyright_text),powered_by_text=VALUES(powered_by_text),
       payment_methods_json=VALUES(payment_methods_json),
       facebook_url=VALUES(facebook_url),linkedin_url=VALUES(linkedin_url),
       instagram_url=VALUES(instagram_url),x_url=VALUES(x_url),youtube_url=VALUES(youtube_url),
       whatsapp_url=VALUES(whatsapp_url),threads_url=VALUES(threads_url),
       trusted_eyebrow=VALUES(trusted_eyebrow),trusted_title=VALUES(trusted_title),
       trusted_description=VALUES(trusted_description),trusted_proof_points=VALUES(trusted_proof_points),
       trusted_panels_json=VALUES(trusted_panels_json),
       service_eyebrow=VALUES(service_eyebrow),service_title=VALUES(service_title),
       service_description=VALUES(service_description),service_action_label=VALUES(service_action_label),
       service_action_url=VALUES(service_action_url),
       status='active',updated_by=VALUES(updated_by),updated_at=CURRENT_TIMESTAMP`.execute(
      getEcommerceDatabase()
    );
    return this.get();
  }
}

function toProfile(row: Row): StorefrontProfile {
  return {
    aboutUs: row.about_us,
    homeCtaActionLabel: row.home_cta_action_label,
    homeCtaActionUrl: row.home_cta_action_url,
    homeCtaDescription: row.home_cta_description,
    homeCtaEyebrow: row.home_cta_eyebrow,
    homeCtaTitle: row.home_cta_title,
    copyrightText: row.copyright_text,
    facebookUrl: row.facebook_url,
    instagramUrl: row.instagram_url,
    linkedinUrl: row.linkedin_url,
    paymentMethods: parsePaymentMethods(row.payment_methods_json),
    poweredByText: row.powered_by_text,
    serviceActionLabel: row.service_action_label,
    serviceActionUrl: row.service_action_url,
    serviceDescription: row.service_description,
    serviceEyebrow: row.service_eyebrow,
    serviceTitle: row.service_title,
    tagline: row.tagline,
    trustedDescription: row.trusted_description,
    trustedEyebrow: row.trusted_eyebrow,
    trustedProofPoints: row.trusted_proof_points,
    trustedPanels: parseTrustedPanels(row.trusted_panels_json),
    trustedTitle: row.trusted_title,
    threadsUrl: row.threads_url,
    whatsappUrl: row.whatsapp_url,
    xUrl: row.x_url,
    youtubeUrl: row.youtube_url
  };
}

function parsePaymentMethods(value: string | null): StorefrontPaymentMethod[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPaymentMethod);
  } catch {
    return [];
  }
}

function parseTrustedPanels(value: string | null): StorefrontTrustedPanel[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTrustedPanel);
  } catch {
    return [];
  }
}

function isPaymentMethod(value: unknown): value is StorefrontPaymentMethod {
  if (!value || typeof value !== "object") return false;
  const method = value as Record<string, unknown>;
  return typeof method.name === "string" && typeof method.logoUrl === "string";
}

function isTrustedPanel(value: unknown): value is StorefrontTrustedPanel {
  if (!value || typeof value !== "object") return false;
  const panel = value as Record<string, unknown>;
  return (
    typeof panel.action === "string" &&
    typeof panel.description === "string" &&
    Array.isArray(panel.details) &&
    panel.details.every((detail) => typeof detail === "string") &&
    typeof panel.href === "string" &&
    typeof panel.title === "string"
  );
}
