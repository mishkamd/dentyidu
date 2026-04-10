"use client"

import { useState } from "react"
import { ArrowRightLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { moveToLogistics } from "@/app/actions/logistics"
import { toast } from "sonner"

interface MoveToLogisticsButtonProps {
  leadId: string
  hasPatient: boolean
}

export function MoveToLogisticsButton({ leadId, hasPatient }: MoveToLogisticsButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isTransferred, setIsTransferred] = useState(hasPatient)

  const handleTransfer = async () => {
    if (isTransferred) return

    setIsLoading(true)
    try {
      const result = await moveToLogistics(leadId)
      if (result.success) {
        setIsTransferred(true)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Eroare la transfer")
    } finally {
      setIsLoading(false)
    }
  }

  if (isTransferred) {
    return (
      <div className="inline-flex items-center rounded-full font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] text-[10px] px-3 py-1 w-[140px] justify-center h-8">
        LOGISTICĂ
      </div>
    )
  }

  return (
    <Button
      variant="admin_primary" size="admin_pill"
      
      onClick={handleTransfer}
      disabled={isLoading}
      className="w-[140px] justify-between text-[10px] tracking-widest"
    >
      <span className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ArrowRightLeft className="h-3 w-3" />
        )}
        Transferă
      </span>
    </Button>
  )
}
