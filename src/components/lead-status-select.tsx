"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { updateLeadStatus } from "@/app/actions/leads"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

const statusConfig = [
  {
    value: "NOU",
    labelKey: "status.lead.new",
    fallback: "NOU",
    className: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    value: "CONTACTAT",
    labelKey: "status.lead.contacted",
    fallback: "CONTACTAT",
    className: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  {
    value: "OFERTA_TRIMISA",
    labelKey: "status.lead.offerSent",
    fallback: "OFERTĂ TRIMISĂ",
    className: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  {
    value: "PROGRAMAT",
    labelKey: "status.lead.scheduled",
    fallback: "PROGRAMAT",
    className: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    value: "FINALIZAT",
    labelKey: "status.lead.completed",
    fallback: "FINALIZAT",
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: "PIERDUT",
    labelKey: "status.lead.lost",
    fallback: "PIERDUT",
    className: "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20",
  },
  {
    value: "ANULAT",
    labelKey: "status.lead.cancelled",
    fallback: "ANULAT",
    className: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
  },
]

interface LeadStatusSelectProps {
  leadId: string
  currentStatus: string
}

export function LeadStatusSelect({ leadId, currentStatus: initialStatus }: LeadStatusSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState(initialStatus)
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()
  const { t } = useLanguage()

  const statuses = statusConfig.map(s => ({ ...s, label: t(s.labelKey, s.fallback) }))

  const currentStatusObj = statuses.find((s) => s.value === status)

  const handleStatusChange = (newStatus: string) => {
    const oldStatus = status
    setStatus(newStatus)
    setOpen(false)
    
    startTransition(async () => {
      const result = await updateLeadStatus(leadId, newStatus)
      if (result.error) {
        setStatus(oldStatus)
        toast.error(t('toast.statusUpdateError', 'Eroare la actualizarea statusului'))
      } else {
        toast.success(t('toast.statusUpdated', 'Status actualizat'))
        router.refresh()
      }
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          disabled={isPending}
          className={cn(
            "flex items-center justify-between h-8 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider border shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 w-[140px] hover:shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
            currentStatusObj?.className || "text-zinc-500 border-gray-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor] opacity-80" />
            <span className="truncate">{isPending ? "..." : (currentStatusObj?.label || status)}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-xl shadow-emerald-900/5">
        <Command>
          <CommandList>
            <CommandGroup>
              {statuses.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={() => handleStatusChange(framework.value)}
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wider cursor-pointer rounded-lg mb-1 last:mb-0 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "data-[selected='true']:bg-emerald-50 dark:data-[selected='true']:bg-emerald-500/10",
                    framework.className.replace('bg-', 'hover:bg-').replace('border-', 'hover:border-')
                  )}
                >
                  <div className={cn(
                    "mr-2 h-2 w-2 rounded-full",
                    framework.className.match(/text-(\w+-\d+)/)?.[0].replace('text-', 'bg-') || "bg-zinc-300"
                  )} />
                  <span className={cn(status === framework.value && "font-bold")}>
                    {framework.label}
                  </span>
                  {status === framework.value && (
                    <Check className="ml-auto h-3 w-3 opacity-100" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
