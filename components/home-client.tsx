"use client"

import Link from "next/link"
import { LicenseCard } from "@/components/license-card"
import { useLocale } from "@/lib/locale-context"
import type { LicenseItem } from "@/lib/types"

export function HomeClient({ licenses }: { licenses: LicenseItem[] }) {
  const { t } = useLocale()
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground mb-1">{t.home.title}</h1>
        <p className="text-sm text-muted-foreground">{t.home.subtitle(licenses.length)}</p>
      </div>

      {licenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm font-medium text-foreground mb-1">{t.home.noLicenses}</p>
          <p className="text-xs text-muted-foreground">
            {t.home.noLicensesHint}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {licenses.map((license) => (
            <LicenseCard key={license.slug} license={license} />
          ))}
        </div>
      )}
    </div>
  )
}
