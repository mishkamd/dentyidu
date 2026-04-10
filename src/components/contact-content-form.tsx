"use client"

import { useActionState } from "react"
import { updateContactContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
}

export function ContactContentForm({ 
  initialData,
  locale = "ro",
}: { 
  initialData: { 
    sectionTitle?: string;
    sectionDescription?: string;
    phone?: string; 
    email?: string; 
    address?: string;
    supportTitle?: string;
    supportDescription?: string;
    feedbackTitle?: string;
    feedbackDescription?: string;
    pressTitle?: string;
    pressDescription?: string;
    formTitle?: string;
    formButtonText?: string;
    formFooterText?: string;
    formNameLabel?: string;
    formEmailLabel?: string;
    formPhoneLabel?: string;
    formCountryLabel?: string;
    formDescriptionLabel?: string;
    formBudgetLabel?: string;
    formRadiographyLabel?: string;
  } 
  locale?: string
}) {
  const [state, formAction, isPending] = useActionState(updateContactContent, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {state.message && (
        <div className={`p-4 rounded-xl border mb-6 ${state.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          <p className="text-sm font-bold uppercase tracking-wider">
            {state.message}
          </p>
        </div>
      )}

      <div className="mb-6 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Secțiune (CTA)</Label>
            <Input 
              name="sectionTitle" 
              defaultValue={initialData.sectionTitle} 
              placeholder="Contactează-ne"
              className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere Secțiune (CTA)</Label>
            <Textarea 
              name="sectionDescription" 
              defaultValue={initialData.sectionDescription} 
              placeholder="Email, sună sau completează formularul..."
              className="min-h-[100px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="grid gap-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Informații Contact</h3>
          
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Număr Telefon</Label>
            <Input 
              id="phone" 
              name="phone" 
              defaultValue={initialData.phone || "+373 60 000 000"} 
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
            {state.errors?.phone && (
              <p className="text-sm text-red-500">{state.errors.phone[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Adresă Email</Label>
            <Input 
              id="email" 
              name="email" 
              defaultValue={initialData.email || "contact@dentymd.md"} 
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
            {state.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Locație</Label>
            <Textarea 
              id="address" 
              name="address" 
              defaultValue={initialData.address || "Strada Ștefan cel Mare 1, Chișinău, Moldova"} 
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
            {state.errors?.address && (
              <p className="text-sm text-red-500">{state.errors.address[0]}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="grid gap-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Secțiuni Suport</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Suport</Label>
              <Input 
                name="supportTitle" 
                defaultValue={initialData.supportTitle} 
                placeholder="Suport Clienți"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere Suport</Label>
              <Input 
                name="supportDescription" 
                defaultValue={initialData.supportDescription} 
                placeholder="Echipa noastră este aici pentru tine"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Feedback</Label>
              <Input 
                name="feedbackTitle" 
                defaultValue={initialData.feedbackTitle} 
                placeholder="Feedback"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere Feedback</Label>
              <Input 
                name="feedbackDescription" 
                defaultValue={initialData.feedbackDescription} 
                placeholder="Părerea ta contează"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Presă</Label>
              <Input 
                name="pressTitle" 
                defaultValue={initialData.pressTitle} 
                placeholder="Presă"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere Presă</Label>
              <Input 
                name="pressDescription" 
                defaultValue={initialData.pressDescription} 
                placeholder="Noutăți și apariții media"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="grid gap-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Formular Lead-uri</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Formular</Label>
              <Input 
                name="formTitle" 
                defaultValue={initialData.formTitle} 
                placeholder="Solicită o consultație"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Text Buton</Label>
              <Input 
                name="formButtonText" 
                defaultValue={initialData.formButtonText} 
                placeholder="Trimite Cererea"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Text Footer (Disclaimers)</Label>
            <Textarea 
                name="formFooterText" 
                defaultValue={initialData.formFooterText} 
                placeholder="Prin trimiterea formularului ești de acord cu..."
                className="min-h-[80px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
            <div className="col-span-2">
              <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Etichete Câmpuri</h4>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Label Nume</Label>
              <Input 
                name="formNameLabel" 
                defaultValue={initialData.formNameLabel} 
                placeholder="Nume complet"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Label Email</Label>
              <Input 
                name="formEmailLabel" 
                defaultValue={initialData.formEmailLabel} 
                placeholder="Email"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Label Telefon</Label>
              <Input 
                name="formPhoneLabel" 
                defaultValue={initialData.formPhoneLabel} 
                placeholder="Telefon"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Label Țară</Label>
              <Input 
                name="formCountryLabel" 
                defaultValue={initialData.formCountryLabel} 
                placeholder="Țara de origine"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Label Descriere</Label>
              <Input 
                name="formDescriptionLabel" 
                defaultValue={initialData.formDescriptionLabel} 
                placeholder="Descrie problema"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Label Buget</Label>
              <Input 
                name="formBudgetLabel" 
                defaultValue={initialData.formBudgetLabel} 
                placeholder="Buget estimat (Opțional)"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Label Radiografie</Label>
              <Input 
                name="formRadiographyLabel" 
                defaultValue={initialData.formRadiographyLabel} 
                placeholder="Link Radiografie (Opțional)"
                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isPending} 
          variant="admin_primary_strong" size="admin_submit"
          className="w-full md:w-auto"
        >
          {isPending ? "Se salvează..." : "Salvează Modificările"}
        </Button>
      </div>
    </form>
  )
}
