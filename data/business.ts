import { Business } from "@/lib/types";

export const DEFAULT_BUSINESS: Business = {
  businessName: "Sabor de Mi Abuela",
  tagline: "Authentic Tamales & Mexican Food",
  languageDefault: "es",
  whatsappNumber: "14049925807",
  phoneNumber: "404-992-5807",
  address: "120 Main St",
  city: "Alpharetta",
  state: "GA",
  serviceAreas: ["Alpharetta", "Roswell", "Norcross"],

  pickupEnabled: true,
  deliveryEnabled: true,
  dineInEnabled: true,

  deliveryFee: 5,
  minimumPickup: 0,
  minimumDelivery: 15,
  minimumDineIn: 0,

  taxEnabled: true,
  taxRate: 8,
  theme: "rojo",

  heroStyle: "image",
  logo: "",
  heroImage: "",
  heroVideoPoster: "",
  heroBadge: "Lo hacemos conveniente",

  hoursOpen: "07:00",
  hoursClose: "23:00",
  slots: { enabled: true, intervalMinutes: 30, maxPerSlot: 6 },

  paymentMethods: {
    cash: true,
    zelle: true,
    cashApp: true,
    venmo: false,
    card: false,
  },
  socialLinks: {
    facebook: "",
    instagram: "sabordemiabuela",
    tiktok: "",
  },
};

// merge stored business onto defaults so new fields are never undefined
export function mergeBusiness(stored: Partial<Business> | null | undefined): Business {
  if (!stored) return DEFAULT_BUSINESS;
  return {
    ...DEFAULT_BUSINESS,
    ...stored,
    slots: { ...DEFAULT_BUSINESS.slots, ...(stored.slots ?? {}) },
    paymentMethods: { ...DEFAULT_BUSINESS.paymentMethods, ...(stored.paymentMethods ?? {}) },
    socialLinks: { ...DEFAULT_BUSINESS.socialLinks, ...(stored.socialLinks ?? {}) },
  };
}
