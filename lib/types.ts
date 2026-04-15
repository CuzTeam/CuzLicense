export interface LicensePlaceholder {
  key: string
  label: string
  defaultValue: string
}

export interface LicenseItem {
  slug: string
  meta: {
    name?: string
    spdx?: string
    description?: string
    [key: string]: unknown
  }
  body: string
  placeholders: LicensePlaceholder[]
}

/**
 * Parse all `access.<name>: true|false` keys from meta.
 * Returns an array of { name, value } sorted by name.
 */
export function parseAccessFlags(meta: Record<string, unknown>): Array<{ name: string; value: boolean }> {
  return Object.entries(meta)
    .filter(([k]) => k.startsWith("access."))
    .map(([k, v]) => ({ name: k.replace("access.", ""), value: v as boolean }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
