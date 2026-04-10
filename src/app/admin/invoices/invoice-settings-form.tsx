
"use client"

import { useEffect, useState } from "react"
import { updateInvoiceSettings } from "@/app/actions/financial"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

interface InvoiceSettingsItem {
  id: string
  name: string
  language: string
  companyName: string
  companyAddress: string
  companyCif: string
  companyRegCom: string
  companyEmail: string
  bankName: string
  bankIban: string
  footerText: string
  logoUrl?: string | null
  tvaRate: number
}

type InvoiceSettingsFormValues = Omit<InvoiceSettingsItem, "logoUrl" | "tvaRate"> & {
  logoUrl: string
  tvaRate: string
}

function toFormValues(settings: InvoiceSettingsItem): InvoiceSettingsFormValues {
  const safeTvaRate = typeof settings.tvaRate === "number" && Number.isFinite(settings.tvaRate)
    ? settings.tvaRate
    : 0

  return {
    id: settings.id,
    name: settings.name || "",
    language: settings.language || "ro",
    companyName: settings.companyName || "",
    companyAddress: settings.companyAddress || "",
    companyCif: settings.companyCif || "",
    companyRegCom: settings.companyRegCom || "",
    companyEmail: settings.companyEmail || "",
    bankName: settings.bankName || "",
    bankIban: settings.bankIban || "",
    footerText: settings.footerText || "",
    logoUrl: settings.logoUrl || "",
    tvaRate: safeTvaRate.toString(),
  }
}

function buildFormsData(settingsList: InvoiceSettingsItem[]) {
  return Object.fromEntries(settingsList.map((settings) => [settings.id, toFormValues(settings)]))
}

export function InvoiceSettingsForm({ settingsList }: { settingsList: InvoiceSettingsItem[] }) {
  const [activeId, setActiveId] = useState(settingsList[0]?.id || "")
  const [loading, setLoading] = useState(false)
  const [formsData, setFormsData] = useState<Record<string, InvoiceSettingsFormValues>>(() => buildFormsData(settingsList))

  useEffect(() => {
    const nextFormsData = buildFormsData(settingsList)
    setFormsData(nextFormsData)
    setActiveId((currentActiveId) => {
      if (currentActiveId && nextFormsData[currentActiveId]) {
        return currentActiveId
      }

      return settingsList[0]?.id || ""
    })
  }, [settingsList])

  const activeSettings = formsData[activeId]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormsData(prev => ({
      ...prev,
      [activeId]: prev[activeId]
        ? { ...prev[activeId], [name]: value }
        : prev[activeId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSettings) return
    setLoading(true)
    try {
      const { id, name, language, logoUrl, tvaRate, ...data } = activeSettings
      await updateInvoiceSettings(id, {
        ...data,
        logoUrl: logoUrl || undefined,
        tvaRate: Number(tvaRate) || 0,
      })
      toast.success("Setările au fost actualizate!")
    } catch (error) {
      console.error(error)
      toast.error("A apărut o eroare la salvare.")
    } finally {
      setLoading(false)
    }
  }

  if (!settingsList.length) {
    return (
      <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
        Nu exista template-uri de factura disponibile.
      </div>
    )
  }

  if (!activeSettings) return null

  return (
    <div className="p-6 space-y-6">
      {/* Template Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-2 p-1 bg-gray-200/50 dark:bg-zinc-800/50 rounded-xl w-fit border border-gray-200 dark:border-white/5">
        {settingsList.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveId(s.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeId === s.id
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {s.language === 'fr' ? '🇫🇷' : '🇷🇴'} {s.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Date Companie</h3>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Nume Companie / Clinică</Label>
              <Input id="companyName" name="companyName" value={activeSettings.companyName} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Adresă</Label>
              <Input id="companyAddress" name="companyAddress" value={activeSettings.companyAddress} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyCif">CIF / CUI</Label>
                <Input id="companyCif" name="companyCif" value={activeSettings.companyCif} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyRegCom">Reg. Com.</Label>
                <Input id="companyRegCom" name="companyRegCom" value={activeSettings.companyRegCom} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email Contact</Label>
              <Input id="companyEmail" name="companyEmail" type="email" value={activeSettings.companyEmail} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Date Bancare & Altele</h3>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Banca</Label>
              <Input id="bankName" name="bankName" value={activeSettings.bankName} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankIban">Cont IBAN</Label>
              <Input id="bankIban" name="bankIban" value={activeSettings.bankIban} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tvaRate">TVA % (0 = fără TVA)</Label>
              <Input id="tvaRate" name="tvaRate" type="number" step="0.1" min="0" max="100" value={activeSettings.tvaRate} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL Logo (Opțional)</Label>
              <Input id="logoUrl" name="logoUrl" value={activeSettings.logoUrl || ""} onChange={handleChange} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText">Text Subsol (Legal)</Label>
              <Textarea 
                id="footerText" 
                name="footerText" 
                value={activeSettings.footerText} 
                onChange={handleChange} 
                className="h-[88px] resize-none"
                required 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/5">
          <Button variant="admin_primary" size="admin_pill" type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvează Setările
          </Button>
        </div>
      </form>
    </div>
  )
}
