import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md",
  {
    variants: {
      status: {
        active:
          "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
        pending:
          "border-transparent bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
        inactive:
          "border-transparent bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20",
        error:
          "border-transparent bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
        info:
          "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        warning:
          "border-transparent bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
        purple:
          "border-transparent bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        orange:
          "border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
        slate:
          "border-transparent bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status?: "active" | "pending" | "inactive" | "error" | "info" | "success" | "warning" | "purple" | "orange" | "slate"
}

function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ status }), className)} {...props} />
  )
}

export { StatusBadge, statusBadgeVariants }
