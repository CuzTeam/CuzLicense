"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Search, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { LocaleToggle } from "@/components/locale-toggle"
import { useLocale } from "@/lib/locale-context"
import type { LicenseItem } from "@/lib/types"

interface AppSidebarProps {
  licenses: LicenseItem[]
}

export function AppSidebar({ licenses }: AppSidebarProps) {
  const pathname = usePathname()
  const { t } = useLocale()

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 border-r border-border bg-sidebar overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-sidebar-foreground truncate">{t.appName}</p>
        <LocaleToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {/* Static pages */}
        <SidebarItem
          href="/"
          label={t.nav.home}
          icon={<Home className="w-4 h-4" />}
          isActive={pathname === "/"}
        />
        <SidebarItem
          href="/browse"
          label={t.nav.browse}
          icon={<Search className="w-4 h-4" />}
          isActive={pathname === "/browse"}
        />
        <SidebarItem
          href="/assistant"
          label={t.nav.assistant}
          icon={<Wand2 className="w-4 h-4" />}
          isActive={pathname === "/assistant"}
        />

        <div className="px-2 py-3">
          <Separator />
        </div>

        {licenses.map((license) => (
          <SidebarItem
            key={license.slug}
            href={`/license/${license.slug}`}
            label={license.meta.spdx ?? license.slug}
            icon={<FileText className="w-4 h-4 shrink-0" />}
            isActive={pathname === `/license/${license.slug}`}
          />
        ))}
      </nav>
    </aside>
  )
}

interface SidebarItemProps {
  href: string
  label: string
  icon: React.ReactNode
  isActive: boolean
}

function SidebarItem({ href, label, icon, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors group",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      <span className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")}>
        {icon}
      </span>
      <span className="truncate flex-1">{label}</span>
      {isActive && (
        <span className="w-1 h-4 rounded-full bg-primary shrink-0" />
      )}
    </Link>
  )
}
