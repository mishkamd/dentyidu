import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { MobileMenu } from "@/components/mobile-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { LogoLink } from "@/components/logo-link"

import { getContentForLocaleWithFallback } from "@/lib/get-content"
import { getServerLocale, getTranslations } from "@/lib/locale-server"

export async function Navbar() {
  const locale = await getServerLocale()

  const [contactInfo, heroContent, menuContent, t] = await Promise.all([
    getContentForLocaleWithFallback<{ phone?: string }>("contact", locale, {}),
    getContentForLocaleWithFallback<{ icon?: string; logo?: string; logoType?: "image" | "text" }>("hero", locale, {}),
    getContentForLocaleWithFallback<{ items: Array<{ label: string; href: string }> } | null>("menu", locale, null),
    getTranslations(locale)
  ])

  const defaultLinks = [
    { href: "/", label: t["nav.home"] || "Acasă" },
    { href: "#preturi", label: t["nav.prices"] || "Prețuri" },
    { href: "#despre", label: t["nav.about"] || "Despre" },
    { href: "/blog", label: t["nav.blog"] || "Blog" },
    { href: "#contact", label: t["nav.contact"] || "Contact" },
  ]

  const phone = contactInfo?.phone || "+373 60 000 000"

  // Use translation keys for menu item labels, falling back to Content values
  const links = (menuContent?.items && menuContent.items.length > 0 
    ? menuContent.items 
    : defaultLinks
  ).map((item, i) => ({
    ...item,
    label: t[`navbar.items.${i}.label`] || item.label,
  }))

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass-card backdrop-blur-xl shadow-sm rounded-full px-4 sm:px-6 py-3 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between gap-4 max-w-5xl w-full mx-auto ring-1 ring-border/5 pointer-events-auto">
        {/* Logo */}
        <LogoLink 
          href="/" 
          className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-all group shrink-0 md:justify-self-start"
        >
          {heroContent.icon ? (
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <Image src={heroContent.icon} alt="Icon" fill className="object-contain" sizes="40px" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground rotate-3 shadow-lg shadow-primary/20">
              D
            </div>
          )}
          
          {heroContent.logo ? (
            heroContent.logoType === 'text' ? (
              <span className="text-lg font-bold tracking-tight">{heroContent.logo}</span>
            ) : (
              <Image 
                src={heroContent.logo} 
                alt="Logo" 
                width={0} 
                height={0} 
                sizes="100vw" 
                className="h-6 w-auto object-contain" 
              />
            )
          ) : (
            <span className="tracking-tight">Denty.</span>
          )}
        </LogoLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 md:justify-self-center">
          {links.map((link, i) => (
            <Link 
              key={i} 
              href={link.href}
              prefetch={false}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0 md:justify-self-end">
          <LanguageSelector />
          <div className="hidden sm:flex items-center gap-1">
             <ModeToggle />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className="hidden md:inline-flex rounded-full transition-all"
          >
            <Link href={`tel:${phone.replace(/\s/g, '')}`} prefetch={false}>
              <Phone className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
              <span className="sr-only">{t["nav.call"] || "Sună"}</span>
            </Link>
          </Button>

          <div className="flex items-center md:hidden">
              <MobileMenu phone={phone} links={links} />
          </div>
        </div>
      </nav>
    </div>
  )
}
