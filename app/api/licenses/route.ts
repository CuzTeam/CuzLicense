import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { parseLicenseFile } from "@/lib/parse-license"

export async function GET() {
  const licensesDir = path.join(process.cwd(), "public", "licenses")

  if (!fs.existsSync(licensesDir)) {
    return NextResponse.json({ licenses: [] })
  }

  const files = fs
    .readdirSync(licensesDir)
    .filter((f) => f.endsWith(".license"))
    .sort()

  const licenses = files.map((filename) => {
    const filePath = path.join(licensesDir, filename)
    const raw = fs.readFileSync(filePath, "utf-8")
    const parsed = parseLicenseFile(raw)
    const slug = filename.replace(".license", "")
    return { slug, ...parsed }
  })

  return NextResponse.json({ licenses })
}
