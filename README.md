# LíneaSur Menu Express v1.6

Digital Menus • WhatsApp Orders • QR Codes • Built for Small Businesses

Bilingual (ES/EN), mobile-first ordering system for Latino food vendors, food trucks, meal-prep, caterers, bakeries, and snack vendors. No database, no auth, no backend — everything persists in the browser via LocalStorage. Sellable as a $299/year product for LíneaSur Digital Media clients.

## Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript + Tailwind CSS v4
- Lucide icons, `qrcode` for QR generation
- LocalStorage persistence only

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start
```

## Routes
| Route | Purpose |
|---|---|
| `/` | Customer storefront (menu → modal → cart → checkout → WhatsApp) |
| `/menu/[slug]` | Same storefront, slug reserved for future multi-tenant |
| `/checkout` | Order form → generates WhatsApp message |
| `/admin` | Business settings + menu management (no login, MVP) |
| `/qr` | Scan-to-order landing page |
| `/flyer` | Printable 8.5×11 flyer with QR (use browser Print) |

## Admin
Go to `/admin`. Two tabs:
- **Business** — name, logo/hero (upload or phone camera), contact, service areas, hours, pickup/delivery, fees, tax, payment methods, theme, socials.
- **Menu** — add/edit/delete/duplicate items, toggle Featured & Sold Out, reorder, set bilingual names + descriptions, prices, and photos (camera or upload).

Click **Save** on each tab to persist. Use **Preview**, **QR**, **Flyer** buttons in the header. "Reset sample data" restores the demo.

## Themes
Six skins switch colors, radius, fonts, badges, and hero overlays instantly:
`rojo` (Taquería) · `verde` (Tamal) · `dorado` (Premium) · `negro` (Food Truck) · `azul` (Mariscos) · `rosa` (Panadería).

## New in v1.6
- **Order numbers** — every WhatsApp order gets `#MMDD-NN` (per-day rolling counter) so the kitchen can call out orders.
- **Three fulfillment modes** — Pickup, Delivery, and **Dine-In (comedor)**. Dine-in asks for party size instead of an address and shows the address to come eat at.
- **Per-mode minimums** — set separate minimums for pickup / delivery / dine-in in admin (pickup & dine-in can be $0).
- **Time slots** — admin sets interval (15/30/60 min) + max orders per slot; checkout only offers future, in-hours slots.
- **Repeat last order** — one tap rebuilds the customer's previous cart from LocalStorage (skips sold-out items).
- **Hero as a premium add-on** — admin picks hero style (Photo / Poster-flyer / Branded) plus a small hero badge tagline. Flagged in the UI as a paid customization so you can charge a setup fee per client.

## Images
Photos are downscaled to 900px and stored as JPEG data URLs in LocalStorage to stay small. Both desktop upload and `capture="environment"` phone-camera intake are supported.

## Deploy (Vercel)
```bash
vercel
```
No environment variables required for the MVP.

## Future-ready (no major refactor)
The store layer (`lib/store.tsx`) and types (`lib/types.ts`) are isolated so you can swap LocalStorage for Supabase, add Stripe at checkout, wire `/menu/[slug]` to real tenants, and layer in order tracking, analytics, reviews, NFC ordering, and Google Business — without touching the UI components.

---
Built for LíneaSur Digital Media.
