'use client'

import { useState, useActionState } from "react"
import { createLead } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Globe, MessageSquare, Wallet, Link, ShieldCheck, Clock, CheckCircle2, ArrowRight, Upload } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile"

const initialState = {
  message: "",
  errors: {},
  inputs: {},
}

export function LeadForm({
  title,
  buttonText,
  nameLabel,
  emailLabel,
  phoneLabel,
  countryLabel,
  descriptionLabel,
  budgetLabel,
  radiographyLabel,
  footerText,
  className,
}: {
  title?: string
  buttonText?: string
  nameLabel?: string
  emailLabel?: string
  phoneLabel?: string
  countryLabel?: string
  descriptionLabel?: string
  budgetLabel?: string
  radiographyLabel?: string
  footerText?: string
  className?: string
}) {
  const [state, formAction, isPending] = useActionState(createLead, initialState)
  const [isUploadMode, setIsUploadMode] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const { t } = useLanguage()

  const resolvedTitle = title || t("form.title", "Solicită o consultație")
  const resolvedButtonText = buttonText || t("form.submit", "Trimite Cererea")
  const resolvedNameLabel = nameLabel || t("form.name", "Nume complet")
  const resolvedEmailLabel = emailLabel || t("form.email", "Email")
  const resolvedPhoneLabel = phoneLabel || t("form.phone", "Telefon")
  const resolvedCountryLabel = countryLabel || t("form.country", "Țara de origine")
  const resolvedDescriptionLabel = descriptionLabel || t("form.description", "Descrie problema")
  const resolvedBudgetLabel = budgetLabel || t("form.budget", "Buget estimat")
  const resolvedRadiographyLabel = radiographyLabel || t("form.radiography", "Radiografie")
  const resolvedFooterText = footerText || t("form.footer", "Apasă trimite pentru a accepta termenii și condițiile de prelucrare a datelor cu caracter personal conform standardelor GDPR.")
  const resolvedSecure = t("form.secure", "Secure & 100% Confidential")

  return (
    <Card className={`relative w-full max-w-lg mx-auto border-none shadow-none bg-transparent ${className || ""}`}>

      <CardHeader className="space-y-4 pb-2 pt-6 md:pb-4 md:pt-8 relative z-10">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <div className="h-6 w-1 bg-emerald-500 rounded-full" />
              {resolvedTitle}
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground text-xs pl-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{resolvedSecure}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0 self-start sm:self-center">
            <Clock className="w-3 h-3" /> 1 min
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <form action={(fd) => { if (captchaToken) fd.set("captchaToken", captchaToken); formAction(fd) }} className="space-y-4 pt-0 md:space-y-6 md:pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 group/input">
              <Label htmlFor="name" className="text-muted-foreground font-medium transition-colors group-focus-within/input:text-primary">{resolvedNameLabel}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within/input:text-primary transition-colors" />
                <Input id="name" name="name" defaultValue={state?.inputs?.name} placeholder={t("form.namePlaceholder", "Ion Popescu")} required className="pl-10 h-11 md:h-12 bg-background border-input text-foreground placeholder:text-muted-foreground/50 hover:bg-muted/50 transition-colors focus:border-primary/50 focus:ring-primary/20 focus:bg-background" />
              </div>
              {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>}
            </div>

            <div className="space-y-2 group/input">
              <Label htmlFor="email" className="text-muted-foreground font-medium transition-colors group-focus-within/input:text-primary">{resolvedEmailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within/input:text-primary transition-colors" />
                <Input id="email" name="email" type="email" defaultValue={state?.inputs?.email} placeholder={t("form.emailPlaceholder", "ion@email.com")} required className="pl-10 h-11 md:h-12 bg-background border-input text-foreground placeholder:text-muted-foreground/50 hover:bg-muted/50 transition-colors focus:border-primary/50 focus:ring-primary/20 focus:bg-background" />
              </div>
              {state?.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2 group/input">
              <div className="flex items-center h-6">
                <Label htmlFor="phone" className="text-muted-foreground font-medium transition-colors group-focus-within/input:text-primary">{resolvedPhoneLabel}</Label>
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within/input:text-primary transition-colors" />
                <Input id="phone" name="phone" type="tel" defaultValue={state?.inputs?.phone} placeholder={t("form.phonePlaceholder", "+40 700...")} required className="pl-10 h-11 md:h-12 bg-background border-input text-foreground placeholder:text-muted-foreground/50 hover:bg-muted/50 transition-colors focus:border-primary/50 focus:ring-primary/20 focus:bg-background" />
              </div>
              {state?.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone}</p>}
            </div>

            <div className="space-y-2 group/input">
              <div className="flex items-center justify-between h-6">
                <Label htmlFor={isUploadMode ? "radiographyFile" : "radiographyLink"} className="text-muted-foreground font-medium transition-colors group-focus-within/input:text-primary">{resolvedRadiographyLabel}</Label>
                <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setIsUploadMode(false)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all ${!isUploadMode ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {t("ui.link", "Link")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUploadMode(true)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all ${isUploadMode ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {t("ui.upload", "Upload")}
                  </button>
                </div>
              </div>
              <div className="relative">
                {isUploadMode ? (
                  <>
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within/input:text-primary transition-colors" />
                    <Input
                      id="radiographyFile"
                      name="radiographyFile"
                      type="file"
                      accept="image/*,.pdf"
                      className="pl-10 h-11 md:h-12 bg-background border-input text-foreground file:text-foreground file:bg-transparent file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground/50 hover:bg-muted/50 transition-colors focus:border-primary/50 focus:ring-primary/20 focus:bg-background pt-2"
                    />
                  </>
                ) : (
                  <>
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within/input:text-primary transition-colors" />
                    <Input
                      id="radiographyLink"
                      name="radiographyLink"
                      defaultValue={state?.inputs?.radiographyLink}
                      placeholder={t("form.radiographyLinkPlaceholder", "Link (opțional)")}
                      className="pl-10 h-11 md:h-12 bg-background border-input text-foreground placeholder:text-muted-foreground/50 hover:bg-muted/50 transition-colors focus:border-primary/50 focus:ring-primary/20 focus:bg-background"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 group/input">
              <Label htmlFor="country" className="text-muted-foreground font-medium transition-colors group-focus-within/input:text-primary">{resolvedCountryLabel}</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within/input:text-primary transition-colors" />
                <Input id="country" name="country" defaultValue={state?.inputs?.country} placeholder={t("form.countryPlaceholder", "România")} required className="pl-10 h-11 md:h-12 bg-background border-input text-foreground placeholder:text-muted-foreground/50 hover:bg-muted/50 transition-colors focus:border-primary/50 focus:ring-primary/20 focus:bg-background" />
              </div>
              {state?.errors?.country && <p className="text-red-500 text-xs mt-1">{state.errors.country}</p>}
            </div>

            <div className="space-y-2 group/input">
              <Label htmlFor="budget" className="text-muted-foreground font-medium transition-colors group-focus-within/input:text-primary">{resolvedBudgetLabel}</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within/input:text-primary transition-colors" />
                <Input id="budget" name="budget" defaultValue={state?.inputs?.budget} placeholder={t("form.budgetPlaceholder", "ex: 2000€")} className="pl-10 h-11 md:h-12 bg-background border-input text-foreground placeholder:text-muted-foreground/50 hover:bg-muted/50 transition-colors focus:border-primary/50 focus:ring-primary/20 focus:bg-background" />
              </div>
            </div>
          </div>

          <div className="space-y-2 group/input">
            <Label htmlFor="description" className="text-muted-foreground font-medium transition-colors group-focus-within/input:text-primary">{resolvedDescriptionLabel}</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-4 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within/input:text-primary transition-colors" />
              <Textarea id="description" name="description" defaultValue={state?.inputs?.description} placeholder={t("form.descriptionPlaceholder", "Cum te putem ajuta?")} required className="pl-10 min-h-[80px] md:min-h-[100px] bg-background border-input text-foreground placeholder:text-muted-foreground/50 hover:bg-muted/50 transition-colors focus:border-primary/50 focus:ring-primary/20 focus:bg-background resize-none" />
            </div>
            {state?.errors?.description && <p className="text-red-500 text-xs mt-1">{state.errors.description}</p>}
          </div>

          <CloudflareTurnstile
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
          />

          <div className="pt-2 md:pt-4">
            <Button
              type="submit"
              className="w-full h-14 text-sm shadow-lg shadow-[#5eb561]/20 group rounded-full bg-[#5eb561] hover:bg-[#52a155]"
              disabled={isPending}
              variant="default"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  {t("ui.loading", "Se trimite...")}
                </span>
              ) : (
                <>
                  {resolvedButtonText}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>

          {state?.message && (
            <p className={`text-center text-sm font-medium py-2 px-4 rounded-lg animate-in fade-in slide-in-from-top-2 ${state.success ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
              {state.message}
            </p>
          )}

          <p className="text-[10px] text-center text-muted-foreground leading-tight">
            {resolvedFooterText}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
