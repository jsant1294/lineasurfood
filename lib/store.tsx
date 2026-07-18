"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Business, MenuItem, Lang } from "@/lib/types";
import { DEFAULT_BUSINESS } from "@/data/business";
import { SAMPLE_MENU } from "@/data/menu";

interface StoreShape {
  business: Business;
  menu: MenuItem[];
  lang: Lang;
  hydrated: boolean;
  setLang: (l: Lang) => void;
  saveBusiness: (b: Business) => Promise<boolean>;
  saveMenu: (m: MenuItem[]) => Promise<boolean>;
  resetData: () => Promise<void>;
}

const StoreContext = createContext<StoreShape | null>(null);

export function StoreProvider({
  children,
  initialBusiness,
  initialMenu,
}: {
  children: React.ReactNode;
  initialBusiness: Business;
  initialMenu: MenuItem[];
}) {
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [lang, setLangState] = useState<Lang>(initialBusiness.languageDefault);

  const saveBusiness = useCallback(async (b: Business) => {
    const res = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    if (res.ok) setBusiness(b);
    return res.ok;
  }, []);

  const saveMenu = useCallback(async (m: MenuItem[]) => {
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(m),
    });
    if (res.ok) setMenu(m);
    return res.ok;
  }, []);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const resetData = useCallback(async () => {
    await Promise.all([saveBusiness(DEFAULT_BUSINESS), saveMenu(SAMPLE_MENU)]);
    setLangState(DEFAULT_BUSINESS.languageDefault);
  }, [saveBusiness, saveMenu]);

  return (
    <StoreContext.Provider value={{
      business, menu, lang, hydrated: true,
      setLang, saveBusiness, saveMenu, resetData,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreShape {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
