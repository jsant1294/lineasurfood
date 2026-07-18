"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useCart } from "@/lib/cart";
import ThemeRoot from "@/components/ThemeRoot";
import ImageInput from "@/components/ImageInput";
import { THEME_LIST } from "@/data/themes";
import { Business, MenuItem, ModifierGroup, ModifierOption, OrderRecord } from "@/lib/types";
import { money } from "@/lib/order";
import Link from "next/link";
import {
  Store, UtensilsCrossed, Eye, QrCode, Printer, Plus, Trash2, Copy,
  Star, ArrowUp, ArrowDown, Check, RotateCcw, Save, Lock, ClipboardList,
  Settings2, X, CreditCard, Eye as EyeIcon, EyeOff,
} from "lucide-react";

type Tab = "business" | "menu" | "orders" | "payments";

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        onUnlock();
      } else {
        setError(true);
        setPin("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6" style={{ background: "var(--bg)" }}>
      <div className="card p-8 w-full max-w-xs flex flex-col items-center gap-5 text-center">
        <div className="h-14 w-14 rounded-2xl grid place-items-center" style={{ background: "var(--primary)" }}>
          <Lock size={24} style={{ color: "var(--primary-text)" }} />
        </div>
        <div>
          <h1 className="text-xl font-black brand-font">Admin · LíneaSur</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Enter your PIN to continue</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="······"
          className="w-full p-3 text-center text-2xl tracking-widest"
          autoFocus
        />
        {error && (
          <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>Incorrect PIN</p>
        )}
        <button className="btn-primary w-full py-3" onClick={submit} disabled={submitting}>
          {submitting ? "Checking…" : "Unlock"}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { business, menu, saveBusiness, saveMenu, resetData, hydrated } = useStore();
  const { resetCart } = useCart();
  const [tab, setTab] = useState<Tab>("business");
  const [toast, setToast] = useState("");
  const [authed, setAuthed] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  if (!hydrated) return null;

  if (!authed) {
    return (
      <ThemeRoot themeId={business.theme}>
        <PinGate onUnlock={() => setAuthed(true)} />
      </ThemeRoot>
    );
  }

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  return (
    <ThemeRoot themeId={business.theme}>
      <div className="max-w-3xl mx-auto pb-20">
        <header className="sticky top-0 z-20 px-5 py-3 flex items-center justify-between"
          style={{ background: "color-mix(in srgb, var(--bg) 92%, transparent)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h1 className="text-lg font-black brand-font">Admin · LíneaSur</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{business.businessName}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="chip px-3 py-1.5 text-xs font-bold flex items-center gap-1"><Eye size={14} /> Preview</Link>
            <Link href="/qr" className="chip px-3 py-1.5 text-xs font-bold flex items-center gap-1"><QrCode size={14} /> QR</Link>
            <Link href="/flyer" className="chip px-3 py-1.5 text-xs font-bold flex items-center gap-1"><Printer size={14} /> Flyer</Link>
          </div>
        </header>

        {/* tabs */}
        <div className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar">
          <button className="chip px-4 py-2 text-sm font-bold flex items-center gap-2 whitespace-nowrap" data-active={tab === "business"} onClick={() => setTab("business")}>
            <Store size={16} /> Business
          </button>
          <button className="chip px-4 py-2 text-sm font-bold flex items-center gap-2 whitespace-nowrap" data-active={tab === "menu"} onClick={() => setTab("menu")}>
            <UtensilsCrossed size={16} /> Menu ({menu.length})
          </button>
          <button className="chip px-4 py-2 text-sm font-bold flex items-center gap-2 whitespace-nowrap" data-active={tab === "orders"} onClick={() => setTab("orders")}>
            <ClipboardList size={16} /> Orders
          </button>
          <button className="chip px-4 py-2 text-sm font-bold flex items-center gap-2 whitespace-nowrap" data-active={tab === "payments"} onClick={() => setTab("payments")}>
            <CreditCard size={16} /> Payments
          </button>
        </div>

        {tab === "business" ? (
          <BusinessTab business={business} onSave={async (b) => {
            const ok = await saveBusiness(b);
            flash(ok ? "Saved ✓" : "Save failed — try again");
          }} />
        ) : tab === "menu" ? (
          <MenuTab menu={menu} onSave={async (m) => {
            const ok = await saveMenu(m);
            flash(ok ? "Saved ✓" : "Save failed — try again");
          }} />
        ) : tab === "payments" ? (
          <PaymentsTab business={business} onSave={async (b: Business) => {
            const ok = await saveBusiness(b);
            flash(ok ? "Saved ✓" : "Save failed — try again");
          }} />
        ) : (
          <OrdersTab />
        )}

        {tab !== "orders" && (
          <div className="px-5 pt-6">
            <button onClick={() => setShowResetModal(true)}
              className="chip px-3 py-1.5 text-xs font-bold flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <RotateCcw size={14} /> Reset sample data
            </button>
          </div>
        )}
      </div>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card p-6 w-full max-w-xs flex flex-col gap-4 text-center">
            <p className="font-extrabold text-lg">Reset to sample data?</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>All customizations will be lost and cannot be recovered.</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl font-bold card" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className="flex-1 py-2.5 rounded-xl font-bold"
                style={{ background: "var(--primary)", color: "var(--primary-text)" }}
                onClick={async () => { await resetData(); resetCart(); flash("Reset"); setShowResetModal(false); }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg"
          style={{ background: "var(--primary)", color: "var(--primary-text)" }}>
          <Check size={16} /> {toast}
        </div>
      )}
    </ThemeRoot>
  );
}

/* ---------------- ORDERS TAB ---------------- */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function OrdersTab() {
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateKey, setDateKey] = useState(todayKey);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders?date=${dateKey}`)
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [dateKey]);

  const goDay = (delta: number) => {
    const d = new Date(dateKey + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setDateKey(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  const today = todayKey();
  const totalRevenue = orders?.reduce((s, o) => s + o.grand, 0) ?? 0;

  return (
    <div className="px-5 flex flex-col gap-4">
      {/* Date nav */}
      <div className="flex items-center justify-between card p-3">
        <button onClick={() => goDay(-1)} className="chip px-3 py-1.5 text-sm font-bold">← Prev</button>
        <span className="font-bold text-sm">{dateKey === today ? "Today" : dateKey}</span>
        <button onClick={() => goDay(1)} className="chip px-3 py-1.5 text-sm font-bold" disabled={dateKey >= today}>
          Next →
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : !orders?.length ? (
        <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>No orders for this date</p>
      ) : (
        <>
          {/* Summary */}
          <div className="card p-4 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-2xl font-black">{orders.length}</p>
              <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Orders</p>
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color: "var(--accent)" }}>{money(totalRevenue)}</p>
              <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Revenue</p>
            </div>
          </div>

          {[...orders].reverse().map((o) => (
            <OrderCard key={`${o.orderNo}-${o.at}`} order={o} />
          ))}
        </>
      )}
    </div>
  );
}

const MODE_COLOR: Record<string, string> = {
  pickup: "#3b82f6",
  delivery: "#f59e0b",
  dinein: "#10b981",
};
const MODE_LABEL: Record<string, string> = {
  pickup: "Pickup",
  delivery: "Delivery",
  dinein: "Dine-In",
};

function OrderCard({ order }: { order: OrderRecord }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(order.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const color = MODE_COLOR[order.mode] ?? "var(--accent)";

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold brand-font">{order.orderNo}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: color + "22", color }}>
              {MODE_LABEL[order.mode] ?? order.mode}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{time}</span>
          </div>
          <p className="text-sm font-bold mt-0.5">{order.name} · {order.phone}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-extrabold" style={{ color: "var(--accent)" }}>{money(order.grand)}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {order.lines.length} item{order.lines.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <button className="text-xs font-bold text-left" style={{ color: "var(--text-muted)" }}
        onClick={() => setExpanded((v) => !v)}>
        {expanded ? "▲ Hide details" : "▼ Show details"}
      </button>

      {expanded && (
        <div className="flex flex-col gap-1.5 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
          {order.lines.map((l, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm">
                <span className="font-bold">{l.qty}× {l.name}</span>
                <span style={{ color: "var(--accent)" }}>{money(l.lineTotal)}</span>
              </div>
              {l.mods.map((m, j) => (
                <p key={j} className="text-xs pl-3" style={{ color: "var(--text-muted)" }}>
                  + {m.group}: {m.options.join(", ")}
                </p>
              ))}
            </div>
          ))}
          {order.address && <p className="text-xs" style={{ color: "var(--text-muted)" }}>📍 {order.address}</p>}
          {order.slot && <p className="text-xs" style={{ color: "var(--text-muted)" }}>⏰ {order.slot}</p>}
          {order.notes && <p className="text-xs" style={{ color: "var(--text-muted)" }}>📝 {order.notes}</p>}
          <div className="flex justify-between text-xs font-bold pt-1.5" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
            <span>{order.payment}</span>
            <span>Total: {money(order.grand)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- PAYMENTS TAB ---------------- */
function SecretInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-bold">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2.5 pr-10 font-mono text-sm"
        />
        <button type="button" onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}>
          {visible ? <EyeOff size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
    </div>
  );
}

function PaymentsTab({ business, onSave }: { business: Business; onSave: (b: Business) => void }) {
  const [b, setB] = useState<Business>(business);
  const [stripeSecret, setStripeSecret] = useState("");
  const [paypalSecret, setPaypalSecret] = useState("");
  const [configured, setConfigured] = useState({ stripe: false, paypal: false });

  useEffect(() => {
    fetch("/api/payment/status")
      .then((r) => r.json())
      .then((d) => setConfigured({ stripe: !!d.stripeConfigured, paypal: !!d.paypalConfigured }))
      .catch(() => {});
  }, []);

  const setOp = <K extends keyof Business["onlinePayment"]>(k: K, v: Business["onlinePayment"][K]) =>
    setB((p) => ({ ...p, onlinePayment: { ...p.onlinePayment, [k]: v } }));

  const save = async () => {
    const payload = { ...b, stripeSecretKey: stripeSecret || undefined, paypalSecret: paypalSecret || undefined };
    await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    onSave(b);
  };

  return (
    <div className="px-5 flex flex-col gap-5">
      <div className="card p-4 text-sm" style={{ borderLeft: "3px solid var(--accent)" }}>
        <p className="font-bold mb-1">How online payments work</p>
        <p style={{ color: "var(--text-muted)" }}>
          Enter your own Stripe or PayPal credentials below. When enabled, customers pay before
          their WhatsApp order is sent — giving you confirmed revenue, not just a message.
          Your secret keys are stored server-side and never exposed to the browser.
        </p>
      </div>

      {/* STRIPE */}
      <Section title="Stripe">
        <div className="flex items-center justify-between">
          <Toggle label="Accept card payments via Stripe" value={b.onlinePayment.stripeEnabled}
            onChange={(v) => setOp("stripeEnabled", v)} />
          {configured.stripe && (
            <span className="text-xs px-2 py-1 rounded-full font-bold"
              style={{ background: "#10b98122", color: "#10b981" }}>● Secret saved</span>
          )}
        </div>
        {b.onlinePayment.stripeEnabled && (
          <>
            <Text label="Publishable Key (pk_live_… or pk_test_…)"
              value={b.onlinePayment.stripePublishableKey}
              onChange={(v) => setOp("stripePublishableKey", v)}
              placeholder="pk_live_…" />
            <SecretInput label="Secret Key (sk_live_… or sk_test_…) — stored server-side only"
              value={stripeSecret}
              onChange={setStripeSecret}
              placeholder={configured.stripe ? "Leave blank to keep existing" : "sk_live_…"} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Get your keys at dashboard.stripe.com → Developers → API keys
            </p>
          </>
        )}
      </Section>

      {/* PAYPAL */}
      <Section title="PayPal">
        <div className="flex items-center justify-between">
          <Toggle label="Accept PayPal payments" value={b.onlinePayment.paypalEnabled}
            onChange={(v) => setOp("paypalEnabled", v)} />
          {configured.paypal && (
            <span className="text-xs px-2 py-1 rounded-full font-bold"
              style={{ background: "#10b98122", color: "#10b981" }}>● Secret saved</span>
          )}
        </div>
        {b.onlinePayment.paypalEnabled && (
          <>
            <Text label="Client ID" value={b.onlinePayment.paypalClientId}
              onChange={(v) => setOp("paypalClientId", v)}
              placeholder="AYour…PayPalClientId" />
            <SecretInput label="Client Secret — stored server-side only"
              value={paypalSecret}
              onChange={setPaypalSecret}
              placeholder={configured.paypal ? "Leave blank to keep existing" : "EYour…PayPalSecret"} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Get your credentials at developer.paypal.com → Apps & Credentials
            </p>
          </>
        )}
      </Section>

      <button className="btn-primary py-3 flex items-center justify-center gap-2" onClick={save}>
        <Save size={18} /> Save Payment Settings
      </button>
    </div>
  );
}

/* ---------------- BUSINESS TAB ---------------- */
function BusinessTab({ business, onSave }: { business: Business; onSave: (b: Business) => void }) {
  const [b, setB] = useState<Business>(business);
  const set = <K extends keyof Business>(k: K, v: Business[K]) => setB((p) => ({ ...p, [k]: v }));

  return (
    <div className="px-5 flex flex-col gap-5">
      <Section title="Identity">
        <Text label="Business Name" value={b.businessName} onChange={(v) => set("businessName", v)} />
        <Text label="Tagline" value={b.tagline} onChange={(v) => set("tagline", v)} />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold">Default Language</span>
          <div className="flex gap-2">
            {(["es", "en"] as const).map((l) => (
              <button key={l} className="chip px-4 py-1.5 text-sm font-bold" data-active={b.languageDefault === l} onClick={() => set("languageDefault", l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <ImageInput label="Logo" value={b.logo} onChange={(v) => set("logo", v)} targetWidth={400} targetHeight={400} />
        </div>
      </Section>

      <Section title="Hero — Premium Add-On">
        <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "var(--surface-alt)", color: "var(--accent)" }}>
          ★ Custom hero is a paid customization. Charge a setup fee per client.
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold">Hero Style</span>
          <div className="flex flex-wrap gap-2">
            {([
              ["image", "Photo"],
              ["poster", "Poster / Flyer"],
              ["template", "Branded (no image)"],
            ] as const).map(([id, lbl]) => (
              <button key={id} className="chip px-3 py-1.5 text-sm font-bold" data-active={b.heroStyle === id} onClick={() => set("heroStyle", id)}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        {b.heroStyle === "image" && (
          <ImageInput label="Hero Photo" value={b.heroImage} onChange={(v) => set("heroImage", v)} aspect="aspect-video" targetWidth={1200} targetHeight={675} />
        )}
        {b.heroStyle === "poster" && (
          <ImageInput label="Poster / Flyer Image" value={b.heroVideoPoster} onChange={(v) => set("heroVideoPoster", v)} aspect="aspect-video" targetWidth={1200} targetHeight={675} />
        )}
        <Text label="Hero Badge (small tagline over hero)" value={b.heroBadge} onChange={(v) => set("heroBadge", v)} placeholder="Lo hacemos conveniente" />
      </Section>

      <Section title="Contact & Location">
        <Text label="WhatsApp Number (with country code)" value={b.whatsappNumber} onChange={(v) => set("whatsappNumber", v)} placeholder="14049925807" />
        <Text label="Phone" value={b.phoneNumber} onChange={(v) => set("phoneNumber", v)} />
        <Text label="Address" value={b.address} onChange={(v) => set("address", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="City" value={b.city} onChange={(v) => set("city", v)} />
          <Text label="State" value={b.state} onChange={(v) => set("state", v)} />
        </div>
        <Text label="Service Areas (comma separated)" value={b.serviceAreas.join(", ")} onChange={(v) => set("serviceAreas", v.split(",").map((s) => s.trim()).filter(Boolean))} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Opens" value={b.hoursOpen} onChange={(v) => set("hoursOpen", v)} type="time" />
          <Text label="Closes" value={b.hoursClose} onChange={(v) => set("hoursClose", v)} type="time" />
        </div>
      </Section>

      <Section title="Fulfillment">
        <div className="flex flex-col gap-2">
          <Toggle label="Pickup enabled" value={b.pickupEnabled} onChange={(v) => set("pickupEnabled", v)} />
          <Toggle label="Delivery enabled" value={b.deliveryEnabled} onChange={(v) => set("deliveryEnabled", v)} />
          <Toggle label="Dine-In enabled (comedor)" value={b.dineInEnabled} onChange={(v) => set("dineInEnabled", v)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {b.pickupEnabled && <Num label="Min. Pickup ($)" value={b.minimumPickup} onChange={(v) => set("minimumPickup", v)} />}
          {b.deliveryEnabled && <Num label="Min. Delivery ($)" value={b.minimumDelivery} onChange={(v) => set("minimumDelivery", v)} />}
          {b.dineInEnabled && <Num label="Min. Dine-In ($)" value={b.minimumDineIn} onChange={(v) => set("minimumDineIn", v)} />}
        </div>
        {b.deliveryEnabled && <Num label="Delivery Fee ($)" value={b.deliveryFee} onChange={(v) => set("deliveryFee", v)} />}
        <Toggle label="Charge tax" value={b.taxEnabled} onChange={(v) => set("taxEnabled", v)} />
        {b.taxEnabled && <Num label="Tax Rate (%)" value={b.taxRate} onChange={(v) => set("taxRate", v)} />}
      </Section>

      <Section title="Time Slots">
        <Toggle label="Offer time slots" value={b.slots.enabled} onChange={(v) => set("slots", { ...b.slots, enabled: v })} />
        {b.slots.enabled && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Interval</span>
              <div className="flex gap-2">
                {[15, 30, 60].map((iv) => (
                  <button key={iv} className="chip px-3 py-1.5 text-sm font-bold" data-active={b.slots.intervalMinutes === iv} onClick={() => set("slots", { ...b.slots, intervalMinutes: iv })}>
                    {iv}m
                  </button>
                ))}
              </div>
            </div>
            <Num label="Max orders / slot" value={b.slots.maxPerSlot} onChange={(v) => set("slots", { ...b.slots, maxPerSlot: Math.round(v) })} />
          </div>
        )}
      </Section>

      <Section title="Payment Methods">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(b.paymentMethods) as (keyof Business["paymentMethods"])[]).map((k) => (
            <button key={k} className="chip px-3 py-1.5 text-sm font-bold capitalize" data-active={b.paymentMethods[k]}
              onClick={() => set("paymentMethods", { ...b.paymentMethods, [k]: !b.paymentMethods[k] })}>
              {k}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Theme">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {THEME_LIST.map((th) => (
            <button key={th.id} onClick={() => set("theme", th.id)}
              className="card p-3 text-left flex items-center gap-2"
              style={{ outline: b.theme === th.id ? `2px solid ${th.primary}` : "none" }}>
              <span className="h-6 w-6 rounded-full shrink-0" style={{ background: th.primary, border: `2px solid ${th.accent}` }} />
              <span className="text-xs font-bold">{th.label_es}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Social">
        <Text label="Facebook" value={b.socialLinks.facebook} onChange={(v) => set("socialLinks", { ...b.socialLinks, facebook: v })} />
        <Text label="Instagram" value={b.socialLinks.instagram} onChange={(v) => set("socialLinks", { ...b.socialLinks, instagram: v })} />
        <Text label="TikTok" value={b.socialLinks.tiktok} onChange={(v) => set("socialLinks", { ...b.socialLinks, tiktok: v })} />
      </Section>

      <button className="btn-primary py-3 flex items-center justify-center gap-2" onClick={() => onSave(b)}>
        <Save size={18} /> Save Business
      </button>
    </div>
  );
}

/* ---------------- MENU TAB ---------------- */
function MenuTab({ menu, onSave }: { menu: MenuItem[]; onSave: (m: MenuItem[]) => void }) {
  const [items, setItems] = useState<MenuItem[]>(menu);

  const update = (id: string, patch: Partial<MenuItem>) =>
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const remove = (id: string) => setItems((prev) => prev.filter((m) => m.id !== id));
  const duplicate = (id: string) => setItems((prev) => {
    const src = prev.find((m) => m.id === id);
    if (!src) return prev;
    const copy = { ...src, id: `${id}-${Date.now()}`, name_es: src.name_es + " (copia)", name_en: src.name_en + " (copy)", featured: false };
    const i = prev.findIndex((m) => m.id === id);
    return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)];
  });
  const move = (id: string, dir: -1 | 1) => setItems((prev) => {
    const i = prev.findIndex((m) => m.id === id);
    const j = i + dir;
    if (j < 0 || j >= prev.length) return prev;
    const next = [...prev];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const add = () => setItems((prev) => [
    ...prev,
    {
      id: `item-${Date.now()}`, name_es: "Nuevo Platillo", name_en: "New Item",
      description_es: "", description_en: "", category: "General", price: 0,
      image: "", featured: false, available: true, modifiers: [],
    },
  ]);

  return (
    <div className="px-5 flex flex-col gap-3">
      <button onClick={add} className="btn-primary py-2.5 flex items-center justify-center gap-2">
        <Plus size={18} /> Add Item
      </button>

      {items.map((m, idx) => (
        <div key={m.id} className="card p-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <ImageInput label="" value={m.image} onChange={(v) => update(m.id, { image: v })} targetWidth={800} targetHeight={800} />
            <div className="flex-1 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Text label="Nombre (ES)" value={m.name_es} onChange={(v) => update(m.id, { name_es: v })} />
                <Text label="Name (EN)" value={m.name_en} onChange={(v) => update(m.id, { name_en: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Text label="Category" value={m.category} onChange={(v) => update(m.id, { category: v })} />
                <Num label="Price ($)" value={m.price} onChange={(v) => update(m.id, { price: v })} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Text label="Descripción (ES)" value={m.description_es} onChange={(v) => update(m.id, { description_es: v })} />
            <Text label="Description (EN)" value={m.description_en} onChange={(v) => update(m.id, { description_en: v })} />
          </div>

          <ModifiersEditor
            modifiers={m.modifiers ?? []}
            onChange={(mods) => update(m.id, { modifiers: mods })}
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <button className="chip px-3 py-1.5 text-xs font-bold flex items-center gap-1" data-active={m.featured} onClick={() => update(m.id, { featured: !m.featured })}>
                <Star size={13} /> Featured
              </button>
              <button className="chip px-3 py-1.5 text-xs font-bold" data-active={m.available} onClick={() => update(m.id, { available: !m.available })}>
                {m.available ? "Available" : "Sold Out"}
              </button>
              <span className="px-2 py-1.5 text-xs font-bold" style={{ color: "var(--accent)" }}>{money(m.price)}</span>
            </div>
            <div className="flex gap-1">
              <IconBtn onClick={() => move(m.id, -1)} disabled={idx === 0}><ArrowUp size={14} /></IconBtn>
              <IconBtn onClick={() => move(m.id, 1)} disabled={idx === items.length - 1}><ArrowDown size={14} /></IconBtn>
              <IconBtn onClick={() => duplicate(m.id)}><Copy size={14} /></IconBtn>
              <IconBtn onClick={() => remove(m.id)}><Trash2 size={14} /></IconBtn>
            </div>
          </div>
        </div>
      ))}

      <button className="btn-primary py-3 flex items-center justify-center gap-2 sticky bottom-4" onClick={() => onSave(items)}>
        <Save size={18} /> Save Menu
      </button>
    </div>
  );
}

/* ---------------- MODIFIERS EDITOR ---------------- */
function ModifiersEditor({
  modifiers,
  onChange,
}: {
  modifiers: ModifierGroup[];
  onChange: (mods: ModifierGroup[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const addGroup = () => onChange([...modifiers, {
    id: `mg-${Date.now()}`,
    name_es: "Personalizar",
    name_en: "Customize",
    required: false,
    maxSelect: 1,
    options: [],
  }]);

  const removeGroup = (gid: string) => onChange(modifiers.filter((g) => g.id !== gid));

  const updateGroup = (gid: string, patch: Partial<ModifierGroup>) =>
    onChange(modifiers.map((g) => g.id === gid ? { ...g, ...patch } : g));

  const addOption = (gid: string) => {
    const group = modifiers.find((g) => g.id === gid);
    if (!group) return;
    updateGroup(gid, {
      options: [...group.options, {
        id: `mo-${Date.now()}`,
        name_es: "Opción",
        name_en: "Option",
        price: 0,
      }],
    });
  };

  const updateOption = (gid: string, oid: string, patch: Partial<ModifierOption>) =>
    onChange(modifiers.map((g) => g.id === gid
      ? { ...g, options: g.options.map((o) => o.id === oid ? { ...o, ...patch } : o) }
      : g
    ));

  const removeOption = (gid: string, oid: string) =>
    onChange(modifiers.map((g) => g.id === gid
      ? { ...g, options: g.options.filter((o) => o.id !== oid) }
      : g
    ));

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-bold flex items-center gap-1.5 self-start"
        style={{ color: "var(--text-muted)" }}
      >
        <Settings2 size={13} />
        Modifiers ({modifiers.length}) {open ? "▲" : "▼"}
      </button>

      {open && (
        <div className="flex flex-col gap-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {modifiers.map((g) => (
            <div key={g.id} className="flex flex-col gap-2 p-3 rounded-xl card">
              <div className="grid grid-cols-2 gap-2">
                <Text label="Grupo (ES)" value={g.name_es} onChange={(v) => updateGroup(g.id, { name_es: v })} />
                <Text label="Group (EN)" value={g.name_en} onChange={(v) => updateGroup(g.id, { name_en: v })} />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Toggle label="Required" value={g.required} onChange={(v) => updateGroup(g.id, { required: v })} />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Max picks:</span>
                  {[1, 2, 3].map((n) => (
                    <button key={n} className="chip h-7 w-7 text-xs font-bold grid place-items-center"
                      data-active={g.maxSelect === n}
                      onClick={() => updateGroup(g.id, { maxSelect: n })}>
                      {n}
                    </button>
                  ))}
                </div>
                <button className="ml-auto h-7 w-7 grid place-items-center card" onClick={() => removeGroup(g.id)}>
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {g.options.map((o) => (
                  <div key={o.id} className="grid items-end gap-1.5" style={{ gridTemplateColumns: "1fr 1fr 60px 32px" }}>
                    <Text label="" value={o.name_es} onChange={(v) => updateOption(g.id, o.id, { name_es: v })} placeholder="ES" />
                    <Text label="" value={o.name_en} onChange={(v) => updateOption(g.id, o.id, { name_en: v })} placeholder="EN" />
                    <Num label="" value={o.price} onChange={(v) => updateOption(g.id, o.id, { price: v })} />
                    <button className="h-9 w-8 grid place-items-center card" onClick={() => removeOption(g.id, o.id)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button className="chip px-2.5 py-1 text-xs font-bold flex items-center gap-1 self-start mt-1"
                  onClick={() => addOption(g.id)}>
                  <Plus size={12} /> Add option
                </button>
              </div>
            </div>
          ))}

          <button className="chip px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 self-start"
            onClick={addGroup}>
            <Plus size={13} /> Add modifier group
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- shared field components ---------------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-4 flex flex-col gap-3">
      <h3 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: "var(--accent)" }}>{title}</h3>
      {children}
    </section>
  );
}
function Text({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{label}</span>}
      <input type={type} className="p-2.5 text-sm" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{label}</span>}
      <input type="number" step="0.01" className="p-2.5 text-sm" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
    </label>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center justify-between w-full">
      <span className="text-sm font-bold">{label}</span>
      <span className="h-6 w-11 rounded-full p-0.5 transition-colors" style={{ background: value ? "var(--primary)" : "var(--border)" }}>
        <span className="block h-5 w-5 rounded-full bg-white transition-transform" style={{ transform: value ? "translateX(20px)" : "translateX(0)" }} />
      </span>
    </button>
  );
}
function IconBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="h-8 w-8 grid place-items-center card disabled:opacity-30">{children}</button>
  );
}
