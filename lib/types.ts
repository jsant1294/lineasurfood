export type Lang = "es" | "en";

export type FulfillMode = "pickup" | "delivery" | "dinein";

export type HeroStyle = "image" | "poster" | "template";

export interface PaymentMethods {
  cash: boolean;
  zelle: boolean;
  cashApp: boolean;
  venmo: boolean;
  card: boolean;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
}

export interface SlotConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxPerSlot: number;
}

export interface OnlinePaymentConfig {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
}

export interface Business {
  businessName: string;
  tagline: string;
  languageDefault: Lang;
  whatsappNumber: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  serviceAreas: string[];

  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  dineInEnabled: boolean;

  deliveryFee: number;
  minimumPickup: number;
  minimumDelivery: number;
  minimumDineIn: number;

  taxEnabled: boolean;
  taxRate: number;
  theme: string;

  heroStyle: HeroStyle;
  logo: string;
  heroImage: string;
  heroVideoPoster: string;
  heroBadge: string;

  hoursOpen: string;
  hoursClose: string;
  slots: SlotConfig;

  paymentMethods: PaymentMethods;
  socialLinks: SocialLinks;
  onlinePayment: OnlinePaymentConfig;
}

export interface ModifierOption {
  id: string;
  name_es: string;
  name_en: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name_es: string;
  name_en: string;
  required: boolean;
  maxSelect: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  category: string;
  price: number;
  image: string;
  featured: boolean;
  available: boolean;
  modifiers?: ModifierGroup[];
}

export interface CartLine {
  item: MenuItem;
  qty: number;
  notes: string;
  mods?: { groupId: string; optionIds: string[] }[];
}

export interface LastOrder {
  lines: { id: string; qty: number; notes: string }[];
  mode: FulfillMode;
  at: number;
}

export interface OrderRecord {
  orderNo: string;
  at: number;
  name: string;
  phone: string;
  mode: FulfillMode;
  address?: string;
  slot?: string;
  partySize?: number;
  payment: string;
  notes?: string;
  lines: Array<{
    name: string;
    qty: number;
    unitPrice: number;
    mods: Array<{ group: string; options: string[] }>;
    lineTotal: number;
  }>;
  sub: number;
  delivery: number;
  tax: number;
  grand: number;
}
