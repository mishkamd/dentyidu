"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-emerald-500/10 data-[state=on]:text-emerald-400 data-[state=on]:shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted hover:text-foreground",
        outline:
          "border border-border bg-transparent hover:bg-muted hover:text-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed, onPressedChange, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(toggleVariants({ variant, size, className }))}
        onClick={(e) => {
          onClick?.(e)
          onPressedChange?.(!pressed)
        }}
        data-state={pressed ? "on" : "off"}
        {...props}
      />
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle, toggleVariants }
