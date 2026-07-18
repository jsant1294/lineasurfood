"use client";

import { useState } from "react";
import { MenuItem, Lang, CartLine } from "@/lib/types";
import { money, modTotal } from "@/lib/order";
import { t } from "@/lib/i18n";
import { Star, Plus, Minus, X } from "lucide-react";

export function ProductCard({
  item,
  lang,
  onOpen,
}: {
  item: MenuItem;
  lang: Lang;
  onOpen: () => void;
}) {
  const name = lang === "es" ? item.name_es : item.name_en;
  const soldOut = !item.available;
  return (
    <button
      onClick={() => !soldOut && onOpen()}
      disabled={soldOut}
      className="card overflow-hidden text-left flex flex-col w-full"
      style={{ opacity: soldOut ? 0.6 : 1, cursor: soldOut ? "not-allowed" : "pointer" }}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={name} className="h-full w-full object-cover" />
        {item.featured && !soldOut && (
          <span
            className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full"
            style={{ background: "var(--badge)", color: "var(--badge-text)" }}
          >
            <Star size={12} fill="currentColor" /> {t("featured", lang)}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center text-sm font-extrabold uppercase tracking-wide"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
            {t("soldOut", lang)}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <span className="font-bold leading-tight">{name}</span>
        <span className="font-extrabold" style={{ color: "var(--accent)" }}>
          {money(item.price)}
        </span>
      </div>
    </button>
  );
}

export function ProductModal({
  item,
  lang,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  lang: Lang;
  onClose: () => void;
  onAdd: (qty: number, notes: string, mods: CartLine["mods"]) => void;
}) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedMods, setSelectedMods] = useState<Map<string, string[]>>(
    () => new Map((item.modifiers ?? []).map((g) => [g.id, []]))
  );

  const name = lang === "es" ? item.name_es : item.name_en;
  const desc = lang === "es" ? item.description_es : item.description_en;
  const groups = item.modifiers ?? [];

  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    setSelectedMods((prev) => {
      const next = new Map(prev);
      const current = next.get(groupId) ?? [];
      if (current.includes(optionId)) {
        next.set(groupId, current.filter((id) => id !== optionId));
      } else if (maxSelect === 1) {
        next.set(groupId, [optionId]);
      } else if (current.length < maxSelect) {
        next.set(groupId, [...current, optionId]);
      }
      return next;
    });
  };

  const allRequiredFilled = groups
    .filter((g) => g.required)
    .every((g) => (selectedMods.get(g.id) ?? []).length > 0);

  const modPrice = Array.from(selectedMods.entries()).reduce((sum, [groupId, optIds]) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return sum;
    return sum + optIds.reduce((s, oid) => {
      const opt = group.options.find((o) => o.id === oid);
      return s + (opt?.price ?? 0);
    }, 0);
  }, 0);

  const linePrice = (item.price + modPrice) * qty;

  const handleAdd = () => {
    const modsPayload: CartLine["mods"] = Array.from(selectedMods.entries())
      .filter(([, ids]) => ids.length > 0)
      .map(([groupId, optionIds]) => ({ groupId, optionIds }));
    onAdd(qty, notes.trim(), modsPayload.length > 0 ? modsPayload : undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="card w-full sm:max-w-md max-h-[92vh] overflow-y-auto no-scrollbar"
        style={{ borderRadius: "20px 20px var(--radius) var(--radius)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full overflow-hidden" style={{ borderRadius: "20px 20px 0 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={name} className="h-full w-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 grid place-items-center h-9 w-9 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold brand-font">{name}</h2>
            <span className="text-lg font-extrabold whitespace-nowrap" style={{ color: "var(--accent)" }}>
              {money(item.price)}
            </span>
          </div>
          {desc && <p className="text-sm" style={{ color: "var(--text-muted)" }}>{desc}</p>}

          {/* Modifier groups */}
          {groups.map((group) => {
            const selected = selectedMods.get(group.id) ?? [];
            const groupName = lang === "es" ? group.name_es : group.name_en;
            return (
              <div key={group.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold">{groupName}</span>
                  {group.required && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                      style={{ background: "var(--primary)", color: "var(--primary-text)" }}>
                      {lang === "es" ? "Requerido" : "Required"}
                    </span>
                  )}
                  {group.maxSelect > 1 && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      ({lang === "es" ? `máx. ${group.maxSelect}` : `max ${group.maxSelect}`})
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => {
                    const optName = lang === "es" ? opt.name_es : opt.name_en;
                    const isSelected = selected.includes(opt.id);
                    const isDisabled = !isSelected && group.maxSelect > 1 && selected.length >= group.maxSelect;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => !isDisabled && toggleOption(group.id, opt.id, group.maxSelect)}
                        disabled={isDisabled}
                        className="chip px-3 py-1.5 text-sm font-bold flex items-center gap-1"
                        data-active={isSelected}
                        style={{ opacity: isDisabled ? 0.4 : 1 }}
                      >
                        {optName}
                        {opt.price > 0 && (
                          <span className="text-xs font-bold" style={{ color: isSelected ? "inherit" : "var(--accent)" }}>
                            +{money(opt.price)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{t("quantity", lang)}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-9 w-9 grid place-items-center card" aria-label="minus"><Minus size={16} /></button>
              <span className="w-6 text-center font-bold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}
                className="h-9 w-9 grid place-items-center card" aria-label="plus"><Plus size={16} /></button>
            </div>
          </div>

          <label className="text-sm font-bold flex flex-col gap-1">
            {t("notes", lang)}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t("notesPlaceholder", lang)}
              className="p-2 text-sm resize-none"
            />
          </label>

          <button
            className="btn-primary py-3 text-base disabled:opacity-50"
            disabled={!allRequiredFilled}
            onClick={handleAdd}
          >
            {t("addToOrder", lang)} · {money(linePrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
