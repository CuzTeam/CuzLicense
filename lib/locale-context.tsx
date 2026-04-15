"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { dict, type Locale, type Dict } from "./i18n"

interface LocaleContextValue {
  locale: Locale
  t: Dict
  setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  t: dict.en,
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null
    if (saved === "zh" || saved === "en") setLocaleState(saved)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem("locale", l)
  }

  return (
    <LocaleContext.Provider value={{ locale, t: dict[locale], setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
