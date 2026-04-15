import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { parseLicenseFile } from "@/lib/parse-license"

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const filePath = path.join(process.cwd(), "public", "licenses", `${slug}.license`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const raw = fs.readFileSync(filePath, "utf-8")
  const parsed = parseLicenseFile(raw)

  return NextResponse.json({ slug, ...parsed })
}
