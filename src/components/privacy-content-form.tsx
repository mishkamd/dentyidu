"use client"

import { useActionState, useState, useEffect } from "react"
import { updatePrivacyContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useLanguage } from "@/components/language-provider"

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
}

export function PrivacyContentForm({ 
  initialData,
  locale = "ro",
}: { 
  initialData: { sectionTitle?: string; sectionDescription?: string }
  locale?: string
}) {
  const [state, formAction, isPending] = useActionState(updatePrivacyContent, initialState)
  const [content, setContent] = useState(initialData.sectionDescription || "")
  const { t } = useLanguage()

  // Update content when initialData changes (e.g. after save and revalidation)
  useEffect(() => {
    if (initialData.sectionDescription) {
      const timer = setTimeout(() => {
        setContent(initialData.sectionDescription!)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [initialData.sectionDescription])

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {state.message && (
        <div className={`p-4 rounded-xl border mb-6 backdrop-blur-sm ${state.success ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
          <p className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            {state.success ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
            {state.message}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("admin.legal.configTitle", "Configurare Pagină")}</h3>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sectionTitle" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("admin.legal.pageTitle", "Titlu Pagină")}</Label>
          <Input 
            id="sectionTitle" 
            name="sectionTitle" 
            defaultValue={initialData.sectionTitle} 
            required 
            placeholder="Politică de Confidențialitate" 
            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
          {state.errors?.sectionTitle && (
            <p className="text-sm text-red-500">{state.errors.sectionTitle[0]}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sectionDescription" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("admin.legal.content", "Conținut")}</Label>
          <div className="prose-editor-container [&_.tiptap]:bg-white [&_.tiptap]:dark:bg-zinc-900/50 [&_.tiptap]:border-gray-200 [&_.tiptap]:dark:border-white/10 [&_.tiptap]:rounded-xl [&_.tiptap]:min-h-[300px] [&_.tiptap]:p-4">
            <RichTextEditor 
              value={content} 
              onChange={setContent}
              className="min-h-[250px] text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <input 
            type="hidden" 
            name="sectionDescription" 
            value={content} 
          />
          {state.errors?.sectionDescription && (
            <p className="text-sm text-red-500">{state.errors.sectionDescription[0]}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end sticky bottom-6 z-50">
        <Button 
          type="submit" 
          disabled={isPending} 
          variant="admin_primary_strong" size="admin_submit"
        >
          {isPending ? t("ui.saving", "Se salvează...") : t("ui.saveChanges", "Salvează Modificările")}
        </Button>
      </div>
    </form>
  )
}
