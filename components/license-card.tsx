import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AccessBadgeList } from "@/components/feature-badge"
import type { LicenseItem } from "@/lib/types"

interface LicenseCardProps {
  license: LicenseItem
}

export function LicenseCard({ license }: LicenseCardProps) {
  const { meta, slug } = license

  return (
    <Link href={`/license/${slug}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="h-full transition-colors hover:bg-accent/40">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-card-foreground leading-tight">
              {meta.name ?? slug}
            </p>
            {meta.spdx && (
              <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
                {meta.spdx as string}
              </Badge>
            )}
          </div>
          {meta.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
              {meta.description as string}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <AccessBadgeList meta={meta as Record<string, unknown>} />
        </CardContent>
      </Card>
    </Link>
  )
}
