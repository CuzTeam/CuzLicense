"use client"

import React, { useMemo } from "react"

// ─── Keyword highlight rules ──────────────────────────────────────────────────
const HIGHLIGHT_RULES: Array<{ pattern: RegExp; className: string }> = [
  {
    pattern: /\b(commercial|commercially|business|enterprise|profit|revenue|sell|sale|selling|sold)\b/gi,
    className: "hlkw-commercial",
  },
  {
    pattern: /\b(attribution|credit|credits|copyright|author|authorship|creator|originator)\b/gi,
    className: "hlkw-attribution",
  },
  {
    pattern: /\b(service|services|network|server|hosted|hosting|remote|interact|interaction|SaaS)\b/gi,
    className: "hlkw-service",
  },
  {
    pattern: /\b(permission|permit|permitted|grant|granted|rights|license|licence|sublicense)\b/gi,
    className: "hlkw-permission",
  },
  {
    pattern: /\b(prohibit|prohibited|restrict|restriction|forbidden|limitation|disclaim|disclaimer|warranty|without warranty)\b/gi,
    className: "hlkw-restriction",
  },
  {
    pattern: /\b(modify|modified|modification|derivative|adapt|adapted|adaptation|transform|translate)\b/gi,
    className: "hlkw-modification",
  },
  {
    pattern: /\b(distribute|distribution|redistribute|redistribution|sublicense|copy|copies)\b/gi,
    className: "hlkw-distribution",
  },
  {
    pattern: /\b(patent|patents|patented|royalty|royalty-free|royalties)\b/gi,
    className: "hlkw-patent",
  },
]

// Placeholder token regex: {{placeholder.key:-default}}
const PLACEHOLDER_RE = /\{\{placeholder\.([a-zA-Z_][a-zA-Z0-9_]*):-([^}]*)\}\}/g

// ─── Tokeniser ────────────────────────────────────────────────────────────────
type Token =
  | { type: "text"; value: string }
  | { type: "placeholder"; key: string; defaultValue: string }
  | { type: "keyword"; value: string; className: string }

function tokenise(text: string): Token[] {
  // First split by placeholders, then keyword-highlight text segments.
  const tokens: Token[] = []

  let lastIdx = 0
  PLACEHOLDER_RE.lastIndex = 0
  let m: RegExpExecArray | null

  while ((m = PLACEHOLDER_RE.exec(text)) !== null) {
    if (m.index > lastIdx) {
      tokens.push({ type: "text", value: text.slice(lastIdx, m.index) })
    }
    tokens.push({ type: "placeholder", key: m[1], defaultValue: m[2] })
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIdx) })
  }

  // Now keyword-highlight each text token
  const combined = new RegExp(
    HIGHLIGHT_RULES.map((r) => `(${r.pattern.source})`).join("|"),
    "gi"
  )

  return tokens.flatMap((tok) => {
    if (tok.type !== "text") return [tok]
    const result: Token[] = []
    let li = 0
    combined.lastIndex = 0
    let km: RegExpExecArray | null
    while ((km = combined.exec(tok.value)) !== null) {
      if (km.index > li) result.push({ type: "text", value: tok.value.slice(li, km.index) })
      let cls = "hlkw-default"
      for (let i = 0; i < HIGHLIGHT_RULES.length; i++) {
        if (km[i + 1] !== undefined) { cls = HIGHLIGHT_RULES[i].className; break }
      }
      result.push({ type: "keyword", value: km[0], className: cls })
      li = km.index + km[0].length
    }
    if (li < tok.value.length) result.push({ type: "text", value: tok.value.slice(li) })
    return result
  })
}

function renderTokens(tokens: Token[]): React.ReactNode {
  return tokens.map((tok, i) => {
    if (tok.type === "text") return tok.value
    if (tok.type === "placeholder") {
      return (
        <span
          key={i}
          className="inline-block rounded px-1 py-0 font-mono text-[0.8em] bg-primary/10 text-primary border border-primary/20"
          title={`Placeholder: ${tok.key}`}
        >
          {tok.defaultValue || tok.key}
        </span>
      )
    }
    // keyword — use span with Tailwind-compatible classes instead of <mark>
    return (
      <span key={i} className={`hlkw ${tok.className} font-semibold rounded-sm px-px`}>
        {tok.value}
      </span>
    )
  })
}

// ─── Main component ───────────────────────────────────────────────────────────
interface LicenseRenderProps {
  body: string
}

export function LicenseRender({ body }: LicenseRenderProps) {
  const renderedLines = useMemo(() => {
    return body.split("\n").map((line, idx) => {
      const trimmed = line.trimEnd()
      const leadingSpaces = line.match(/^(\s+)/)?.[1]?.length ?? 0
      const isIndented = leadingSpaces >= 3

      if (trimmed === "") return <div key={idx} className="h-3" aria-hidden />

      const isSectionHeading =
        /^\d+\.\s+[A-Z]/.test(trimmed) ||
        (/^[A-Z][A-Z\s]{4,}$/.test(trimmed) && trimmed.length < 60)

      const tokens = tokenise(trimmed)
      const nodes = renderTokens(tokens)

      if (isSectionHeading) {
        return (
          <h3 key={idx} className="text-sm font-semibold text-foreground mt-5 mb-1">
            {nodes}
          </h3>
        )
      }

      return (
        <p
          key={idx}
          className={`text-sm leading-relaxed text-foreground/80 ${
            isIndented ? "pl-4 border-l-2 border-border/40" : ""
          }`}
        >
          {nodes}
        </p>
      )
    })
  }, [body])

  return (
    <div className="license-render space-y-1 max-w-2xl mx-auto">
      {renderedLines}
    </div>
  )
}

// ─── Keyword legend ───────────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { label: "Commercial",    cls: "hlkw-commercial" },
  { label: "Attribution",   cls: "hlkw-attribution" },
  { label: "Service",       cls: "hlkw-service" },
  { label: "Permission",    cls: "hlkw-permission" },
  { label: "Restriction",   cls: "hlkw-restriction" },
  { label: "Modification",  cls: "hlkw-modification" },
  { label: "Distribution",  cls: "hlkw-distribution" },
  { label: "Patent",        cls: "hlkw-patent" },
]

export function KeywordLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {LEGEND_ITEMS.map(({ label, cls }) => (
        <span key={label} className={`text-xs font-medium hlkw ${cls}`}>
          {label}
        </span>
      ))}
    </div>
  )
}
