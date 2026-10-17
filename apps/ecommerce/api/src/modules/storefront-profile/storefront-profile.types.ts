export type StorefrontProfile = {
  aboutUs: string;
  homeCtaActionLabel: string;
  homeCtaActionUrl: string;
  homeCtaDescription: string;
  homeCtaEyebrow: string;
  homeCtaTitle: string;
  copyrightText: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  paymentMethods: StorefrontPaymentMethod[];
  poweredByText: string;
  serviceActionLabel: string;
  serviceActionUrl: string;
  serviceDescription: string;
  serviceEyebrow: string;
  serviceTitle: string;
  tagline: string;
  trustedDescription: string;
  trustedEyebrow: string;
  trustedProofPoints: string;
  trustedPanels: StorefrontTrustedPanel[];
  trustedTitle: string;
  threadsUrl: string;
  whatsappUrl: string;
  xUrl: string;
  youtubeUrl: string;
};

export type StorefrontProfileInput = StorefrontProfile;

export type StorefrontPaymentMethod = {
  logoUrl: string;
  name: string;
};

export type StorefrontTrustedPanel = {
  action: string;
  description: string;
  details: string[];
  href: string;
  title: string;
};
