export interface StoreConfig {
  uuid: string;
  brandName: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  logoUrl: string;
  industryKey: string;
  industryName: string;
  enabled: boolean;
}
export type StoreConfigInput = Omit<StoreConfig, "uuid">;
export interface StoreQuote {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: "received" | "reviewing" | "closed";
  createdAt: string;
  items: { title: string; quantity: number; price: number | null; currency: string }[];
}
