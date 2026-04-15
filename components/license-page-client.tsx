"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LicenseRender, KeywordLegend } from "@/components/license-render"
import { AccessBadgeList } from "@/components/feature-badge"
import { LicenseDownloadDialog } from "@/components/license-download-dialog"
import { useLocale } from "@/lib/locale-context"
import type { LicenseItem } from "@/lib/types"

export function LicensePageClient({ license }: { license: LicenseItem }) {
  const { t } = useLocale()
  const displayName = license.meta.name ?? license.slug

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        {t.license.backHome}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-semibold text-foreground">{displayName}</h1>
            {license.meta.spdx && (
              <Badge variant="secondary" className="font-mono text-xs">
                {license.meta.spdx as string}
              </Badge>
            )}
          </div>
          {license.meta.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {license.meta.description as string}
            </p>
          )}
        </div>
        <LicenseDownloadDialog
          slug={license.slug}
          name={displayName}
          body={license.body}
          placeholders={license.placeholders}
          t={t.license}
        />
      </div>

      {/* Access flags */}
      <AccessBadgeList meta={license.meta as Record<string, unknown>} />

      <Separator className="my-6" />

      {/* Keyword legend */}
      <div className="mb-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
          {t.license.keywordLegend}
        </p>
        <KeywordLegend />
      </div>

      {/* License body */}
      <div className="rounded-lg border border-border bg-card p-8">
        <LicenseRender body={license.body} />
      </div>
    </div>
  )
}
