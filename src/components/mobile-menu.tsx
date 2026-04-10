"use client"

import * as React from "react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { Menu, X, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

interface MobileMenuProps {
  links: Array<{ href: string; label: string }>
  phone?: string
}

export function MobileMenu({ links, phone }: MobileMenuProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full transition-all"
      >
        {isOpen ? (
          <X className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        ) : (
          <Menu className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        )}
      </Button>

      {isOpen && mounted && createPortal(
        <>
        <div className="fixed inset-0 z-[99]" onClick={() => setIsOpen(false)} />
        <div className="fixed top-[7rem] left-8 right-8 sm:left-12 sm:right-12 glass-card backdrop-blur-xl p-5 rounded-2xl animate-in slide-in-from-top-5 duration-200 z-[100] ring-1 ring-border/5 shadow-2xl">
          <div className="flex flex-col gap-4 items-center justify-center mt-2">
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className={cn(
                  "text-base sm:text-lg font-semibold w-full text-center py-2 transition-all",
                  "text-muted-foreground hover:text-primary",
                  index === 0 && "text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex justify-center mt-2 items-center gap-4">
               {phone && (
                 <Link href={`tel:${phone.replace(/\s/g, '')}`} prefetch={false}>
                   <Button variant="ghost" size="icon" className="rounded-full h-14 w-14">
                     <Phone className="h-6 w-6 rotate-0 scale-100 transition-all" />
                     <span className="sr-only">{t("nav.callNow", "Sună acum:")} {phone}</span>
                   </Button>
                 </Link>
               )}
               <div className="[&_button]:h-14 [&_button]:w-14 [&_svg]:h-6 [&_svg]:w-6">
                 <ModeToggle />
               </div>
            </div>
          </div>
        </div>
        </>,
        document.body
      )}
    </>
  )
}
