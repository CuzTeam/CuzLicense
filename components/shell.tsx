import { AppSidebar } from "@/components/app-sidebar"
import type { LicenseItem } from "@/lib/types"

interface ShellProps {
  licenses: LicenseItem[]
  children: React.ReactNode
}

export function Shell({ licenses, children }: ShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar licenses={licenses} />
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
