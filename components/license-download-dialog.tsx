"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { LicensePlaceholder } from "@/lib/types"
import type { Dict } from "@/lib/i18n"

interface LicenseDownloadDialogProps {
  slug: string
  name: string
  body: string
  placeholders: LicensePlaceholder[]
  trigger?: React.ReactNode
  t?: Dict["license"]
}

/**
 * Replaces all {{placeholder.<key>:-<default>}} tokens in body with user-provided values.
 */
function applyPlaceholders(body: string, values: Record<string, string>): string {
  return body.replace(
    /\{\{placeholder\.([a-zA-Z_][a-zA-Z0-9_]*):-([^}]*)\}\}/g,
    (_match, key, defaultVal) => {
      const v = values[key]
      return v !== undefined && v.trim() !== "" ? v.trim() : defaultVal
    }
  )
}

export function LicenseDownloadDialog({
  slug,
  name,
  body,
  placeholders,
  trigger,
  t,
}: LicenseDownloadDialogProps) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(placeholders.map((p) => [p.key, p.defaultValue]))
  )

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleDownload() {
    const filled = applyPlaceholders(body, values)
    const blob = new Blob([filled], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${slug}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-3.5 h-3.5" />
            {t?.download ?? "Download"}
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t?.downloadTitle(name) ?? `Download ${name}`}</DialogTitle>
            <DialogDescription>
              {placeholders.length > 0
                ? (t?.downloadHint ?? "Fill in the fields below before downloading. Leave blank to use the default value.")
                : (t?.downloadHintNone ?? "No fields to fill in. Click Download to save the license file.")}
            </DialogDescription>
          </DialogHeader>

          {placeholders.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-4 py-2">
                {placeholders.map((p) => (
                  <div key={p.key} className="flex flex-col gap-1.5">
                    <Label htmlFor={`field-${p.key}`} className="capitalize">
                      {p.key.replace(/_/g, " ")}
                    </Label>
                    <Input
                      id={`field-${p.key}`}
                      value={values[p.key] ?? ""}
                      placeholder={p.defaultValue}
                      onChange={(e) => handleChange(p.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t?.cancel ?? "Cancel"}
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-3.5 h-3.5" />
              {t?.download ?? "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
