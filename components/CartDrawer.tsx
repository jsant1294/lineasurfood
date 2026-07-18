"use client";

import { useStore } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { computeTotals, money, lineTotal } from "@/lib/order";
import { t } from "@/lib/i18n";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { business, lang } = useStore();
  const { cart, updateQty, removeFromCart } = useCart();
  const router = useRouter();
  // Drawer is pre-checkout — no mode selected yet, so we compute without delivery fee.
  // Delivery fee (if any) is shown as a separate notice below.
  const totals = computeTotals(cart, business, "pickup");

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity"
        style={{
          background: "rgba(0,0,0,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col transition-transform"
        style={{
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-lg font-extrabold brand-font flex items-center gap-2">
            <ShoppingBag size={20} /> {t("yourOrder", lang)}
          </h2>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center card" aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center px-6">
            <div>
              <p className="font-bold">{t("emptyCart", lang)}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{t("emptyCartHint", lang)}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
            {cart.map((l) => {
              const name = lang === "es" ? l.item.name_es : l.item.name_en;
              return (
                <div key={l.item.id + l.notes} className="card p-3 flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.item.image} alt={name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <span className="font-bold leading-tight">{name}</span>
                      <span className="font-extrabold whitespace-nowrap" style={{ color: "var(--accent)" }}>
                        {money(lineTotal(l))}
                      </span>
                    </div>
                    {l.notes && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{l.notes}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(l.item.id, l.qty - 1)} className="h-7 w-7 grid place-items-center card" aria-label="minus"><Minus size={14} /></button>
                        <span className="w-5 text-center text-sm font-bold">{l.qty}</span>
                        <button onClick={() => updateQty(l.item.id, l.qty + 1)} className="h-7 w-7 grid place-items-center card" aria-label="plus"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(l.item.id)} className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Trash2 size={14} /> {t("remove", lang)}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cart.length > 0 && (
          <div className="p-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
            <Row label={t("subtotal", lang)} value={money(totals.sub)} />
            {business.taxEnabled && <Row label={`${t("tax", lang)} (${business.taxRate}%)`} value={money(totals.tax)} muted />}
            {business.deliveryEnabled && business.deliveryFee > 0 && (
              <Row label={`+ ${t("deliveryFee", lang)}`} value={money(business.deliveryFee)} muted note />
            )}
            <Row label={t("total", lang)} value={money(totals.sub + totals.tax)} big />
            <button
              className="btn-primary py-3 mt-1"
              onClick={() => { onClose(); router.push("/checkout"); }}
            >
              {t("checkout", lang)}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function Row({ label, value, big, muted, note }: { label: string; value: string; big?: boolean; muted?: boolean; note?: boolean }) {
  return (
    <div className="flex justify-between" style={{ color: muted ? "var(--text-muted)" : "var(--text)" }}>
      <span className={big ? "font-extrabold" : note ? "text-xs italic" : "text-sm"}>{label}</span>
      <span className={big ? "font-extrabold text-lg" : note ? "text-xs" : "text-sm font-bold"}>{note ? `(${value})` : value}</span>
    </div>
  );
}
