"use client";

import { useMemo, useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { useCart } from "@/lib/cart";
import ThemeRoot from "@/components/ThemeRoot";
import LanguageToggle from "@/components/LanguageToggle";
import { ProductCard, ProductModal } from "@/components/Product";
import CartDrawer from "@/components/CartDrawer";
import { FloatingWhatsApp, FloatingCart } from "@/components/Floating";
import { t } from "@/lib/i18n";
import { isOpenNow } from "@/lib/order";
import { MenuItem, CartLine } from "@/lib/types";
import { MapPin, Clock, Truck, ShoppingBag, MessageCircle, Phone, Utensils, RotateCcw, Facebook, Instagram, Globe, Check, Search, X } from "lucide-react";

// slug is forwarded from /menu/[slug] for future multi-tenant support —
// when multiple businesses are wired, StoreProvider will scope localStorage
// keys per slug (e.g. lineasur.business.{slug}.v1).
export default function Storefront({ slug: _slug }: { slug?: string }) {
  const { business, menu, lang, hydrated } = useStore();
  const { cart, addToCart, lastOrder, repeatLastOrder } = useCart();
  const [active, setActive] = useState<string>("__all");
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = useCallback((name: string) => {
    setToast(name);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const handleAdd = useCallback((item: MenuItem, qty: number, notes: string, mods?: CartLine["mods"]) => {
    addToCart(item, qty, notes, mods);
    setModalItem(null);
    showToast(lang === "es" ? item.name_es : item.name_en);
  }, [addToCart, lang, showToast]);

  const handleRepeatOrder = useCallback(() => {
    repeatLastOrder(menu);
    setCartOpen(true);
  }, [repeatLastOrder, menu]);

  const categories = useMemo(() => {
    const set: string[] = [];
    for (const m of menu) if (!set.includes(m.category)) set.push(m.category);
    return set;
  }, [menu]);

  const visible = useMemo(() => {
    const byCategory = active === "__all" ? menu : menu.filter((m) => m.category === active);
    if (!search.trim()) return byCategory;
    const q = search.toLowerCase();
    return byCategory.filter((m) =>
      m.name_es.toLowerCase().includes(q) ||
      m.name_en.toLowerCase().includes(q) ||
      m.description_es.toLowerCase().includes(q) ||
      m.description_en.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }, [menu, active, search]);

  const featured = useMemo(() => menu.filter((m) => m.featured && m.available), [menu]);
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const open = hydrated ? isOpenNow(business) : true;
  const name = business.businessName;
  const waClean = business.whatsappNumber.replace(/\D/g, "");

  return (
    <ThemeRoot themeId={business.theme}>
      {/* HERO */}
      <header className="relative">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          {renderHeroBackground(business)}
          <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />

          <div className="absolute top-3 right-3"><LanguageToggle /></div>

          {business.heroBadge && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold italic"
              style={{ background: "color-mix(in srgb, var(--bg) 55%, transparent)", color: "var(--accent)", border: "1px solid var(--border)" }}>
              {business.heroBadge}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-5 flex items-end gap-4">
            {business.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logo} alt={name} className="h-16 w-16 rounded-2xl object-cover shadow-lg" style={{ border: "2px solid var(--border)" }} />
            ) : (
              <div className="h-16 w-16 rounded-2xl grid place-items-center text-2xl font-black shadow-lg"
                style={{ background: "var(--primary)", color: "var(--primary-text)" }}>
                {name.slice(0, 1)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black leading-none brand-font drop-shadow">{name}</h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{business.tagline}</p>
            </div>
          </div>
        </div>

        {/* status strip */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 text-xs" style={{ borderBottom: "1px solid var(--border)" }}>
          <Badge active={open}>
            <Clock size={13} /> {open ? t("openNow", lang) : t("closed", lang)}
          </Badge>
          {business.pickupEnabled && <Badge><ShoppingBag size={13} /> {t("pickupAvailable", lang)}</Badge>}
          {business.deliveryEnabled && <Badge><Truck size={13} /> {t("deliveryAvailable", lang)}</Badge>}
          {business.dineInEnabled && <Badge><Utensils size={13} /> {t("dineInAvailable", lang)}</Badge>}
          <Badge><MapPin size={13} /> {business.serviceAreas.join(" · ")}</Badge>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 px-5 py-3">
          <a href={`https://wa.me/${waClean}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl font-bold text-center flex items-center justify-center gap-2"
            style={{ background: "#25D366", color: "#fff" }}>
            <MessageCircle size={18} /> WhatsApp
          </a>
          <a href={`tel:${business.phoneNumber}`}
            className="py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 card">
            <Phone size={18} /> {t("callUs", lang)}
          </a>
        </div>

        {hydrated && lastOrder && lastOrder.lines.length > 0 && cart.length === 0 && (
          <div className="px-5 pb-1">
            <button
              onClick={() => { handleRepeatOrder(); }}
              className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 card"
              style={{ color: "var(--accent)" }}
            >
              <RotateCcw size={16} /> {t("repeatOrder", lang)}
            </button>
          </div>
        )}
      </header>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="px-5 pt-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: "var(--accent)" }}>
            ★ {t("featured", lang)}
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {featured.map((m) => (
              <div key={m.id} className="w-36 shrink-0">
                <ProductCard item={m} lang={lang} onOpen={() => setModalItem(m)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SEARCH + CATEGORY FILTERS */}
      <nav className="sticky top-0 z-20 flex flex-col gap-2 px-5 py-2"
        style={{ background: "color-mix(in srgb, var(--bg) 92%, transparent)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)" }}>
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActive("__all"); }}
            placeholder={lang === "es" ? "Buscar platillos…" : "Search dishes…"}
            className="w-full pl-8 pr-8 py-2 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <X size={14} />
            </button>
          )}
        </div>
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button className="chip px-3 py-1.5 text-sm font-bold whitespace-nowrap" data-active={active === "__all"} onClick={() => { setActive("__all"); setSearch(""); }}>
            {t("all", lang)}
          </button>
          {categories.map((c) => (
            <button key={c} className="chip px-3 py-1.5 text-sm font-bold whitespace-nowrap" data-active={active === c} onClick={() => { setActive(c); setSearch(""); }}>
              {c}
            </button>
          ))}
        </div>
      </nav>

      {/* GRID */}
      <main className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3 pb-28">
        {visible.length === 0 ? (
          <p className="col-span-2 sm:col-span-3 text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
            {lang === "es" ? "Sin resultados para" : "No results for"} "{search}"
          </p>
        ) : (
          visible.map((m) => (
            <ProductCard key={m.id} item={m} lang={lang} onOpen={() => setModalItem(m)} />
          ))
        )}
      </main>

      {/* PAYMENTS + FOOTER */}
      <footer className="px-5 pt-4 pb-32 flex flex-col gap-6">
        {/* Payments */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>{t("payments", lang)}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {business.paymentMethods.cash && <PayChip>{t("cash", lang)}</PayChip>}
            {business.paymentMethods.zelle && <PayChip>Zelle</PayChip>}
            {business.paymentMethods.cashApp && <PayChip>Cash App</PayChip>}
            {business.paymentMethods.venmo && <PayChip>Venmo</PayChip>}
            {business.paymentMethods.card && <PayChip>{t("card", lang)}</PayChip>}
          </div>
        </div>

        {/* Business info */}
        <div className="card p-4 flex flex-col gap-3 text-sm">
          <p className="font-extrabold brand-font text-base">{business.businessName}</p>
          {business.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${business.address}, ${business.city}, ${business.state}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-2 hover:opacity-80 transition-opacity"
              style={{ color: "var(--text-muted)" }}
            >
              <MapPin size={15} className="mt-0.5 shrink-0" />
              <span>{business.address}, {business.city}, {business.state}</span>
            </a>
          )}
          {(business.hoursOpen && business.hoursClose) && (
            <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <Clock size={15} className="shrink-0" />
              <span>{business.hoursOpen} – {business.hoursClose}</span>
            </div>
          )}
          {business.phoneNumber && (
            <a href={`tel:${business.phoneNumber}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity" style={{ color: "var(--text-muted)" }}>
              <Phone size={15} className="shrink-0" />
              <span>{business.phoneNumber}</span>
            </a>
          )}
        </div>

        {/* Social links */}
        {(business.socialLinks.facebook || business.socialLinks.instagram || business.socialLinks.tiktok) && (
          <div className="flex gap-3 flex-wrap">
            {business.socialLinks.facebook && (
              <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                className="chip px-3 py-2 text-xs font-bold flex items-center gap-1.5">
                <Facebook size={14} /> Facebook
              </a>
            )}
            {business.socialLinks.instagram && (
              <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                className="chip px-3 py-2 text-xs font-bold flex items-center gap-1.5">
                <Instagram size={14} /> Instagram
              </a>
            )}
            {business.socialLinks.tiktok && (
              <a href={business.socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                className="chip px-3 py-2 text-xs font-bold flex items-center gap-1.5">
                <Globe size={14} /> TikTok
              </a>
            )}
          </div>
        )}

        {/* Branding */}
        <p className="text-xs text-center" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
          Powered by LíneaSur Menu Express
        </p>
      </footer>

      {modalItem && (
        <ProductModal
          item={modalItem}
          lang={lang}
          onClose={() => setModalItem(null)}
          onAdd={(qty, notes, mods) => handleAdd(modalItem, qty, notes, mods)}
        />
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <FloatingWhatsApp number={business.whatsappNumber} />
      <FloatingCart count={cartCount} onClick={() => setCartOpen(true)} />

      {/* Add to cart toast */}
      <div
        className="fixed top-5 left-1/2 z-50 transition-all duration-300 pointer-events-none"
        style={{
          transform: `translateX(-50%) translateY(${toast ? "0" : "-90px"})`,
          opacity: toast ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold shadow-lg text-sm"
          style={{ background: "var(--primary)", color: "var(--primary-text)" }}>
          <Check size={15} /> {toast} added
        </div>
      </div>
    </ThemeRoot>
  );
}

function Badge({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold"
      style={{
        background: active ? "var(--badge)" : "var(--surface)",
        color: active ? "var(--badge-text)" : "var(--text-muted)",
        border: "1px solid var(--border)",
      }}>
      {children}
    </span>
  );
}

function renderHeroBackground(business: { heroStyle: string; heroImage: string; heroVideoPoster: string }) {
  const img =
    business.heroStyle === "poster" && business.heroVideoPoster
      ? business.heroVideoPoster
      : business.heroImage;
  if ((business.heroStyle === "image" || business.heroStyle === "poster") && img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img} alt="" className="h-full w-full object-cover" />;
  }
  // template / fallback: branded hero with animated gradient + food pattern
  return (
    <div className="h-full w-full relative overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 120% 90% at 30% -10%, var(--primary), transparent 55%), radial-gradient(ellipse 80% 70% at 80% 110%, var(--accent), transparent 50%), var(--bg)"
      }} />
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="food-grid" x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
            <text x="10" y="42" fontSize="38" opacity="0.9">🍽</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#food-grid)" />
      </svg>
      <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
    </div>
  );
}

function PayChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 rounded-full font-bold card" style={{ color: "var(--text)" }}>{children}</span>
  );
}
