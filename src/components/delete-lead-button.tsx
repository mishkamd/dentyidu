'use client'

import { deleteLead } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { useTransition, useState } from "react"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteLead(leadId)
        if (result.success) {
          toast.success(result.message)
          setOpen(false)
        } else {
          toast.error(result.message)
        }
      } catch (e) {
        toast.error("Eroare neașteptată la ștergere")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-zinc-400 dark:hover:text-red-400 transition-all duration-200"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl shadow-red-900/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">{t('dialog.deleteLead.title', 'Ștergere Programare')}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 pt-2 pl-1">
            {t('dialog.deleteLead.confirm', 'Ești sigur că vrei să ștergi această programare? Această acțiune este ireversibilă și va șterge permanent datele asociate.')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <DialogClose asChild>
            <Button variant="admin_secondary" size="admin_pill">{t('ui.cancel', 'Anulează')}</Button>
          </DialogClose>
          <Button 
            variant="admin_destructive" size="admin_pill" 
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('ui.deleting', 'Se șterge...')}
              </>
            ) : (
              t('ui.deleteForever', 'Șterge Definitiv')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
