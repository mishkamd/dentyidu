import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary border border-primary/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] [a&]:hover:bg-primary/30",
        secondary:
          "border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/80 [a&]:hover:text-primary transition-colors",
        destructive:
          "border-transparent bg-destructive/20 text-destructive [a&]:hover:bg-destructive/30",
        outline:
          "text-muted-foreground border-border [a&]:hover:bg-muted/50 [a&]:hover:text-primary [a&]:hover:border-primary/30 transition-all",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
