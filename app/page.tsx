import { Shell } from "@/components/shell"
import { HomeClient } from "@/components/home-client"
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

export default async function HomePage() {
  const licenses = await getLicenses()
  return (
    <Shell licenses={licenses}>
      <HomeClient licenses={licenses} />
    </Shell>
  )
}
