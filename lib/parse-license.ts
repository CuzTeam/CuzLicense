import type { LicensePlaceholder } from "@/lib/types"

export interface LicenseMeta {
  name?: string
  spdx?: string
  description?: string
  [key: string]: unknown
}

export interface ParsedLicense {
  meta: LicenseMeta
  body: string
  placeholders: LicensePlaceholder[]
}

/**
 * Parse {{placeholder.<key>:-<default>}} tokens from the body.
 * Pattern: {{placeholder.owner:-John Doe}}
 */
export function parsePlaceholders(body: string): LicensePlaceholder[] {
  const regex = /\{\{placeholder\.([a-zA-Z_][a-zA-Z0-9_]*):-([^}]*)\}\}/g
  const seen = new Set<string>()
  const results: LicensePlaceholder[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(body)) !== null) {
    const key = match[1]
    const defaultValue = match[2].trim()
    if (!seen.has(key)) {
      seen.add(key)
      results.push({ key, label: key, defaultValue })
    }
  }
  return results
}

export function parseLicenseFile(raw: string): ParsedLicense {
  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

  if (!frontmatterMatch) {
    const body = raw.trim()
    return { meta: {}, body, placeholders: parsePlaceholders(body) }
  }

  const yamlBlock = frontmatterMatch[1]
  const body = frontmatterMatch[2].trim()

  const meta: LicenseMeta = {}
  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const rawVal = line.slice(colonIdx + 1).trim()

    if (rawVal === "true") {
      meta[key] = true
    } else if (rawVal === "false") {
      meta[key] = false
    } else if (!isNaN(Number(rawVal)) && rawVal !== "") {
      meta[key] = Number(rawVal)
    } else {
      meta[key] = rawVal
    }
  }

  return { meta, body, placeholders: parsePlaceholders(body) }
}
