import { Shell } from "@/components/shell"
import { BrowseClient } from "@/components/browse-client"
import type { LicenseItem } from "@/lib/types"

async function getLicenses(): Promise<LicenseItem[]> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"
  try {
    const res = await fetch(`${baseUrl}/api/licenses`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return data.licenses ?? []
  } catch {
    return []
  }
}

export default async function BrowsePage() {
  const licenses = await getLicenses()
  return (
    <Shell licenses={licenses}>
      <BrowseClient licenses={licenses} />
    </Shell>
  )
}
