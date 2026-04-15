"use client"

import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"

export function LocaleToggle() {
  const { locale, setLocale } = useLocale()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-foreground"
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      title="Switch language / 切换语言"
    >
      {locale === "en" ? "中文" : "EN"}
    </Button>
  )
}
