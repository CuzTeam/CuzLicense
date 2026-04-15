import { cn } from "@/lib/utils"
import { parseAccessFlags } from "@/lib/types"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AccessBadgeProps {
  name: string
  value: boolean
}

export function AccessBadge({ name, value }: AccessBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-mono text-xs font-normal",
        value
          ? "border-emerald-500/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
          : "border-border bg-muted/40 text-muted-foreground"
      )}
    >
      {value ? (
        <Check className="w-3 h-3 shrink-0" />
      ) : (
        <X className="w-3 h-3 shrink-0" />
      )}
      {name}
    </Badge>
  )
}

export function AccessBadgeList({
  meta,
}: {
  meta: Record<string, unknown>
}) {
  const flags = parseAccessFlags(meta)
  if (flags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map(({ name, value }) => (
        <AccessBadge key={name} name={name} value={value} />
      ))}
    </div>
  )
}
