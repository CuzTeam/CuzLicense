"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Empty } from "@/components/ui/empty"
import { parseAccessFlags } from "@/lib/types"
import type { LicenseItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChevronRight, RotateCcw, Check } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

/**
 * Whitelist of access flag names that the Assistant understands.
 * Any license that contains access flags NOT in this list will be excluded
 * from recommendations to avoid presenting licenses with unclear conditions.
 */
const WHITELIST_FLAGS = new Set([
  "commercial",
  "modification",
  "distribution",
  "private-use",
  "patent-use",
  "sublicense",
  "attribution-required",
  "virality",
])

interface Question {
  id: string
  /** The access flag this question maps to */
  flag: string
  /** Expected value when user answers "yes" */
  yesValue: boolean
  text: string
  hint?: string
}

const QUESTIONS: Question[] = [
  {
    id: "q-commercial",
    flag: "commercial",
    yesValue: true,
    text: "Do you want to allow commercial use of the software?",
    hint: "e.g. selling products, using in a for-profit service",
  },
  {
    id: "q-modification",
    flag: "modification",
    yesValue: true,
    text: "Should others be allowed to modify the source code?",
  },
  {
    id: "q-distribution",
    flag: "distribution",
    yesValue: true,
    text: "Should others be allowed to distribute copies of the software?",
  },
  {
    id: "q-private-use",
    flag: "private-use",
    yesValue: true,
    text: "Should private/internal use (without distributing) be permitted?",
  },
  {
    id: "q-patent",
    flag: "patent-use",
    yesValue: true,
    text: "Do you want to grant patent rights to users?",
    hint: "Protects users from patent claims by contributors",
  },
  {
    id: "q-attribution",
    flag: "attribution-required",
    yesValue: false,
    text: "Should users be free to use the software without crediting you?",
    hint: 'Answer "No" if you want to require attribution',
  },
  {
    id: "q-virality",
    flag: "virality",
    yesValue: false,
    text: "Should derivatives be allowed under different (non-copyleft) licenses?",
    hint: 'Answer "No" if you want all derivatives to share the same license (copyleft)',
  },
  {
    id: "q-sublicense",
    flag: "sublicense",
    yesValue: true,
    text: "Should others be allowed to sublicense the software?",
    hint: "i.e. grant the same rights to third parties",
  },
]

type Answer = "yes" | "no"

function isWhitelisted(license: LicenseItem): boolean {
  const flags = parseAccessFlags(license.meta as Record<string, unknown>)
  for (const { name } of flags) {
    if (!WHITELIST_FLAGS.has(name)) return false
  }
  return true
}

export function AssistantClient({ licenses }: { licenses: LicenseItem[] }) {
  const { t } = useLocale()
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map())
  const [showResults, setShowResults] = useState(false)

  const whitelisted = useMemo(() => licenses.filter(isWhitelisted), [licenses])

  function answer(questionId: string, value: Answer) {
    setAnswers((prev) => {
      const next = new Map(prev)
      if (next.get(questionId) === value) {
        next.delete(questionId)
      } else {
        next.set(questionId, value)
      }
      return next
    })
  }

  function reset() {
    setAnswers(new Map())
    setShowResults(false)
  }

  // Build required flag map from answers
  const requirements = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const q of QUESTIONS) {
      const ans = answers.get(q.id)
      if (ans === undefined) continue
      map.set(q.flag, ans === "yes" ? q.yesValue : !q.yesValue)
    }
    return map
  }, [answers])

  const matches = useMemo(() => {
    if (!showResults) return []
    return whitelisted.filter((l) => {
      const flags = new Map(
        parseAccessFlags(l.meta as Record<string, unknown>).map((f) => [f.name, f.value])
      )
      for (const [flag, required] of requirements.entries()) {
        if (flags.get(flag) !== required) return false
      }
      return true
    })
  }, [showResults, whitelisted, requirements])

  const answeredCount = answers.size

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground mb-1">{t.assistant.title}</h1>
        <p className="text-sm text-muted-foreground">{t.assistant.subtitle}</p>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-4 mb-8">
        {QUESTIONS.map((q, idx) => {
          const ans = answers.get(q.id)
          const tq = t.assistant.questions[idx]
          return (
            <div key={q.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-xs font-mono text-muted-foreground w-5 mt-0.5">
                  {idx + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground mb-1">{tq.text}</p>
                  {tq.hint && (
                    <p className="text-xs text-muted-foreground mb-3">{tq.hint}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => answer(q.id, "yes")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                        ans === "yes"
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {ans === "yes" && <Check className="w-3 h-3" />}
                      {t.assistant.yes}
                    </button>
                    <button
                      onClick={() => answer(q.id, "no")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                        ans === "no"
                          ? "border-destructive bg-destructive/15 text-destructive"
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {ans === "no" && <Check className="w-3 h-3" />}
                      {t.assistant.no}
                    </button>
                    {ans !== undefined && (
                      <button
                        onClick={() => {
                          setAnswers((prev) => {
                            const next = new Map(prev)
                            next.delete(q.id)
                            return next
                          })
                        }}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t.assistant.skip}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          onClick={() => setShowResults(true)}
          disabled={answeredCount === 0}
          className="gap-2"
        >
          {t.assistant.findBtn}
          <ChevronRight className="w-4 h-4" />
        </Button>
        {(answeredCount > 0 || showResults) && (
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="w-3.5 h-3.5" />
            {t.assistant.resetBtn}
          </Button>
        )}
        {answeredCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {t.assistant.answered(answeredCount, QUESTIONS.length)}
          </span>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <>
          <Separator className="mb-6" />
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground mb-1">
              {matches.length > 0 ? t.assistant.resultsTitle(matches.length) : t.assistant.noMatch}
            </h2>
            {matches.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t.assistant.noMatchHint}
              </p>
            )}
          </div>
          {matches.length === 0 ? (
            <Empty>
              <p className="text-sm text-muted-foreground">{t.assistant.noMatchEmpty}</p>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map((license) => {
                const flags = parseAccessFlags(license.meta as Record<string, unknown>)
                return (
                  <Link
                    key={license.slug}
                    href={`/license/${license.slug}`}
                    className="rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors p-4"
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm text-foreground">
                        {license.meta.name ?? license.slug}
                      </span>
                      {license.meta.spdx && (
                        <Badge variant="secondary" className="font-mono text-xs">
                          {license.meta.spdx as string}
                        </Badge>
                      )}
                    </div>
                    {license.meta.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {license.meta.description as string}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {flags.map(({ name, value }) => (
                        <span
                          key={name}
                          className={cn(
                            "font-mono text-[10px] px-1.5 py-0.5 rounded border",
                            value
                              ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
                              : "border-border bg-muted/40 text-muted-foreground"
                          )}
                        >
                          {value ? "+" : "-"}{name}
                        </span>
                      ))}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
