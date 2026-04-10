import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* ── Canonical variant styles (referenced by aliases below) ── */
const filled =
  "bg-[var(--btn-accent)] text-[var(--btn-accent-fg)] border-none shadow-sm hover:bg-[var(--btn-accent-hover)] hover:scale-105"
const outlined =
  "bg-transparent border-none shadow-[inset_0_0_0_2px_var(--btn-accent)] text-[var(--btn-accent-text)] hover:bg-[var(--btn-accent)] hover:text-[var(--btn-accent-fg)] hover:shadow-none"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-bold uppercase tracking-widest ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: filled,
        destructive: outlined,
        outline: outlined,
        secondary: outlined,
        ghost:
          "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-[var(--btn-accent-ghost-hover)] hover:text-[var(--btn-accent-text)] dark:hover:text-[var(--btn-accent-text)]",
        link: "text-[var(--btn-accent)] underline-offset-4 hover:underline shadow-none",
        // Legacy aliases — point to canonical styles
        admin_primary: filled,
        admin_primary_strong: filled,
        admin_secondary: outlined,
        admin_destructive: outlined,
        admin_green: filled,
      },
      size: {
        default: "h-[36px] text-[13px] px-5",
        sm: "h-[30px] text-[11px] px-4",
        lg: "h-[42px] text-[14px] px-6 md:px-8",
        icon: "h-10 w-10 p-0",
        // Legacy aliases
        admin_submit: "h-[42px] text-[14px] px-6 md:px-8",
        admin_pill: "h-[36px] text-[13px] px-5",
        admin_pill_sm: "h-[30px] text-[11px] px-4",
        admin_pill_lg: "h-[42px] text-[14px] px-6 md:px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
