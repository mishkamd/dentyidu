"use client"

import * as React from "react"
import { 
  Check, 
  ChevronsUpDown,
  Clock,
  CalendarCheck,
  PlaneLanding,
  Building2,
  Stethoscope,
  CheckCircle2
} from "lucide-react"
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
import { updatePatientStatus } from "@/app/actions/logistics"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

const statusConfig = [
  {
    value: "IN_ASTEPTARE",
    labelKey: "status.patient.waiting",
    fallback: "ÎN AȘTEPTARE",
    icon: Clock,
    className: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
    iconClass: "text-amber-600 dark:text-amber-400"
  },
  {
    value: "PROGRAMAT",
    labelKey: "status.patient.scheduled",
    fallback: "PROGRAMAT",
    icon: CalendarCheck,
    className: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    iconClass: "text-indigo-600 dark:text-indigo-400"
  },
  {
    value: "SOSIT",
    labelKey: "status.patient.arrived",
    fallback: "SOSIT",
    icon: PlaneLanding,
    className: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30",
    iconClass: "text-sky-600 dark:text-sky-400"
  },
  {
    value: "CAZAT",
    labelKey: "status.patient.housed",
    fallback: "CAZAT",
    icon: Building2,
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    iconClass: "text-emerald-600 dark:text-emerald-400"
  },
  {
    value: "IN_TRATAMENT",
    labelKey: "status.patient.inTreatment",
    fallback: "ÎN TRATAMENT",
    icon: Stethoscope,
    className: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/30",
    iconClass: "text-teal-600 dark:text-teal-400"
  },
  {
    value: "FINALIZAT",
    labelKey: "status.patient.completed",
    fallback: "FINALIZAT",
    icon: CheckCircle2,
    className: "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/30",
    iconClass: "text-slate-600 dark:text-slate-400"
  },
]

// Exported for use in other components (e.g. patient-details-dialog)
export const statuses = statusConfig.map(s => ({ ...s, label: s.fallback }))

export function PatientStatusSelect({ id, status, role }: { id: string, status: string, role?: string }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(status)
  const [isPending, setIsPending] = React.useState(false)
  const { t } = useLanguage()

  // Resolve translated labels
  const translatedStatuses = statusConfig.map(s => ({ ...s, label: t(s.labelKey, s.fallback) }))

  const currentStatus = translatedStatuses.find((s) => s.value === value) || translatedStatuses[0]
  const CurrentIcon = currentStatus.icon

  // Filter statuses based on role
  const availableStatuses = role === 'DENTIST' 
    ? translatedStatuses.filter(s => ['IN_TRATAMENT', 'FINALIZAT'].includes(s.value) || s.value === status)
    : translatedStatuses

  async function onSelect(newValue: string) {
    if (newValue === value) {
      setOpen(false)
      return
    }
    
    setValue(newValue)
    setOpen(false)
    setIsPending(true)
    
    const result = await updatePatientStatus(id, newValue)
    
    if (result.error) {
      toast.error(t('toast.statusUpdateError', 'Nu s-a putut actualiza statusul'))
      setValue(status) // revert
    } else {
      toast.success(t('toast.statusUpdated', 'Status actualizat'))
    }
    
    setIsPending(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          disabled={isPending}
          className={cn(
            "flex items-center justify-between h-8 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 w-[150px] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
            currentStatus.className
          )}
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className={cn("w-3.5 h-3.5", currentStatus.iconClass)} />
            <span className="truncate">{isPending ? "..." : (currentStatus.label || value)}</span>
          </div>
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[170px] p-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-xl shadow-[#0F5A5C]/5" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              <div className="flex flex-col gap-0.5 relative">
                                {availableStatuses.map((framework, index) => {
                  const Icon = framework.icon;
                  const isSelected = value === framework.value;
                  return (
                    <CommandItem
                      key={framework.value}
                      value={framework.value}
                      onSelect={() => onSelect(framework.value)}
                      className={cn(
                        "relative z-10 flex items-center gap-2.5 px-1.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer rounded-lg transition-all",
                        isSelected 
                          ? "bg-gray-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white border-gray-200/60 dark:border-white/5 shadow-sm" 
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors",
                        framework.className
                      )}>
                        <Icon className="w-3 h-3" strokeWidth={isSelected ? 2.5 : 2} />
                      </div>
                      
                      <span className={cn(
                        "flex-1 truncate",
                        isSelected && "font-bold"
                      )}>
                        {framework.label}
                      </span>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 opacity-100 ml-auto shrink-0" />
                      )}
                    </CommandItem>
                  )
                })}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
