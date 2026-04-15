"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Empty } from "@/components/ui/empty"
import { Search, X } from "lucide-react"
import { parseAccessFlags } from "@/lib/types"
import type { LicenseItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"

interface BrowseClientProps {
  licenses: LicenseItem[]
}

// Collect all unique access flag names across all licenses
function collectAllFlags(licenses: LicenseItem[]): string[] {
  const set = new Set<string>()
  for (const l of licenses) {
    for (const { name } of parseAccessFlags(l.meta as Record<string, unknown>)) {
      set.add(name)
    }
  }
  return Array.from(set).sort()
}

export function BrowseClient({ licenses }: BrowseClientProps) {
  const { t } = useLocale()
  const [query, setQuery] = useState("")
  const [activeFlags, setActiveFlags] = useState<Map<string, boolean>>(new Map())

  const allFlags = useMemo(() => collectAllFlags(licenses), [licenses])

  function toggleFlag(name: string, value: boolean) {
    setActiveFlags((prev) => {
      const next = new Map(prev)
      const current = next.get(name)
      // Cycle: unset → true → false → unset
      if (current === undefined) {
        next.set(name, value)
      } else if (current === value) {
        next.delete(name)
      } else {
        next.set(name, value)
      }
      return next
    })
  }

  const filtered = useMemo(() => {
    return licenses.filter((l) => {
      // Text search
      const q = query.toLowerCase().trim()
      if (q) {
        const haystack = [
          l.meta.spdx ?? "",
          l.meta.name ?? "",
          l.meta.description ?? "",
        ].join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      // Flag filters
      if (activeFlags.size > 0) {
        const flags = parseAccessFlags(l.meta as Record<string, unknown>)
        const flagMap = new Map(flags.map((f) => [f.name, f.value]))
        for (const [name, required] of activeFlags.entries()) {
          const actual = flagMap.get(name)
          if (actual !== required) return false
        }
      }
      return true
    })
  }, [licenses, query, activeFlags])

  function clearFilters() {
    setQuery("")
    setActiveFlags(new Map())
  }

  const hasFilters = query.trim() !== "" || activeFlags.size > 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground mb-1">{t.browse.title}</h1>
        <p className="text-sm text-muted-foreground">{t.browse.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t.browse.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Flag filters */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-2">{t.browse.filterLabel}</p>
        <div className="flex flex-wrap gap-1.5">
          {allFlags.map((name) => {
            const state = activeFlags.get(name)
            return (
              <div key={name} className="flex gap-0.5">
                <button
                  onClick={() => toggleFlag(name, true)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-l-md border px-2 py-0.5 text-xs font-mono transition-colors",
                    state === true
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title={`Require ${name} = true`}
                >
                  +{name}
                </button>
                <button
                  onClick={() => toggleFlag(name, false)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-r-md border-y border-r px-2 py-0.5 text-xs font-mono transition-colors",
                    state === false
                      ? "border-destructive bg-destructive/15 text-destructive"
                      : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title={`Require ${name} = false`}
                >
                  -{name}
                </button>
              </div>
            )
          })}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3" />
              {t.browse.clear}
            </button>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-4">
        {t.browse.results(filtered.length, licenses.length)}
      </p>

      {/* Results */}
      {filtered.length === 0 ? (
        <Empty>
          <p className="text-sm font-medium text-foreground">{t.browse.noMatch}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.browse.noMatchHint}</p>
        </Empty>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {filtered.map((license) => {
            const flags = parseAccessFlags(license.meta as Record<string, unknown>)
            return (
              <Link
                key={license.slug}
                href={`/license/${license.slug}`}
                className="flex items-start gap-4 px-5 py-4 bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm text-foreground">
                      {license.meta.name ?? license.slug}
                    </span>
                    {license.meta.spdx && (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {license.meta.spdx as string}
                      </Badge>
                    )}
                  </div>
                  {license.meta.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {license.meta.description as string}
                    </p>
                  )}
                  {flags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {flags.map(({ name, value }) => (
                        <span
                          key={name}
                          className={cn(
                            "font-mono text-[10px] px-1.5 py-0.5 rounded border",
                            value
                              ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
                              : "border-border bg-muted/40 text-muted-foreground"
                          )}
                        >
                          {value ? "+" : "-"}{name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
