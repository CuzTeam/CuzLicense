import { notFound } from "next/navigation"
import { Shell } from "@/components/shell"
import { LicensePageClient } from "@/components/license-page-client"
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

async function getLicense(slug: string): Promise<LicenseItem | null> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"
  try {
    const res = await fetch(`${baseUrl}/api/licenses/${slug}`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

export default async function LicensePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [license, allLicenses] = await Promise.all([getLicense(slug), getLicenses()])

  if (!license) notFound()

  return (
    <Shell licenses={allLicenses}>
      <LicensePageClient license={license} />
    </Shell>
  )
}
