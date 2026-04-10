import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogoLink } from "@/components/logo-link"

import { getContentForLocaleWithFallback } from "@/lib/get-content"
import { getServerLocale, getTranslations } from "@/lib/locale-server"

type ContactInfo = {
  phone?: string; email?: string; address?: string;
}

type FooterData = {
  brandDescription?: string; newsletterTitle?: string; newsletterDescription?: string;
  copyrightText?: string; quickLinksTitle?: string; contactTitle?: string;
  newsletterButtonText?: string; newsletterPlaceholder?: string;
  facebook?: string; instagram?: string; linkedin?: string; twitter?: string;
  quickLinks?: { label: string; href: string }[]; legalLinks?: { label: string; url: string }[];
}

export async function Footer() {
  const locale = await getServerLocale()

  const [contactData, heroContent, footerContent, t] = await Promise.all([
    getContentForLocaleWithFallback<ContactInfo>("contact", locale, {}),
    getContentForLocaleWithFallback<{ icon?: string; logo?: string; logoType?: "image" | "text" }>("hero", locale, {}),
    getContentForLocaleWithFallback<FooterData>("footer", locale, {}),
    getTranslations(locale)
  ])

  const contactInfo = {
    phone: contactData.phone || "+373 60 000 000",
    email: contactData.email || "contact@dentymd.md",
    address: t["contact.address"] || contactData.address || "Strada Ștefan cel Mare 1, Chișinău, Moldova",
  }

  const socialLinks = {
    facebook: footerContent.facebook,
    instagram: footerContent.instagram,
    linkedin: footerContent.linkedin,
    twitter: footerContent.twitter,
  }

  // Use translation keys for quickLinks labels, falling back to Content values
  const quickLinks = (footerContent.quickLinks && footerContent.quickLinks.length > 0 
    ? footerContent.quickLinks 
    : [
      { label: t["nav.home"] || "Acasă", href: "/" },
      { label: t["nav.about"] || "Despre Noi", href: "#despre" },
      { label: t["nav.prices"] || "Lista de Prețuri", href: "#preturi" },
      { label: t["nav.contact"] || "Contact", href: "#contact" },
      { label: t["footer.terms"] || "Termeni și Condiții", href: "/terms-and-conditions" },
    ]
  ).map((item, i) => ({
    ...item,
    label: t[`footer.quickLinks.${i}.label`] || item.label,
  }))

  return (
    <footer className="bg-[#0f172a] text-gray-400 pt-20 pb-10 border-t border-emerald-900/20 font-sans relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <LogoLink 
              href="/" 
              className="flex items-center gap-2 text-2xl font-bold text-white group"
            >
              {heroContent.icon ? (
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  <Image src={heroContent.icon} alt="Icon" fill className="object-contain" sizes="40px" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  D
                </div>
              )}
              
              {heroContent.logo ? (
                heroContent.logoType === 'text' ? (
                  <span className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">{heroContent.logo}</span>
                ) : (
                  <div className="relative h-8 w-32">
                     <Image src={heroContent.logo} alt="Logo" fill className="object-contain object-left brightness-0 invert" />
                  </div>
                )
              ) : (
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200 group-hover:text-primary transition-colors duration-300">DentyMD</span>
              )}
            </LogoLink>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xs">
              {t["footer.brandDescription"] || footerContent.brandDescription || "Redefinim standardele stomatologiei moderne. Tratamente premium, tehnologie de ultimă oră și grijă pentru pacient, totul la prețuri corecte."}
            </p>
            <div className="flex gap-4">
              {socialLinks.facebook && (
                <Link href={socialLinks.facebook} prefetch={false} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {socialLinks.instagram && (
                <Link href={socialLinks.instagram} prefetch={false} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {socialLinks.linkedin && (
                <Link href={socialLinks.linkedin} prefetch={false} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                  <Linkedin className="h-5 w-5" />
                </Link>
              )}
              {socialLinks.twitter && (
                <Link href={socialLinks.twitter} prefetch={false} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-8 uppercase tracking-wider text-sm border-l-4 border-emerald-500 pl-3">{t["footer.quickLinksTitle"] || footerContent.quickLinksTitle || "Link-uri Rapide"}</h3>
            <ul className="space-y-4 text-sm">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} prefetch={false} className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors group">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-8 uppercase tracking-wider text-sm border-l-4 border-emerald-500 pl-3">{t["footer.contactTitle"] || footerContent.contactTitle || "Contact"}</h3>
            <ul className="space-y-4 sm:space-y-6 text-sm">
              <li className="flex items-start gap-4 group">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="leading-relaxed pt-1">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <Phone className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="pt-1">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <Mail className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="pt-1">{contactInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-8 uppercase tracking-wider text-sm border-l-4 border-emerald-500 pl-3">{t["footer.newsletterTitle"] || footerContent.newsletterTitle || "Newsletter"}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {t["footer.newsletterDescription"] || footerContent.newsletterDescription || "Abonează-te pentru noutăți și oferte exclusive. Nu trimitem spam, doar zâmbete."}
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Input 
                  placeholder={t["footer.newsletterPlaceholder"] || footerContent.newsletterPlaceholder || "Email-ul tău"}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-12 pl-4 pr-4 rounded-xl transition-all hover:bg-white/10"
                />
              </div>
              <Button className="w-full h-11 md:h-12 rounded-full bg-[#5eb561] hover:bg-[#52a155]">
                {t["footer.newsletterButtonText"] || footerContent.newsletterButtonText || "Abonează-te Acum"}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p suppressHydrationWarning>{t["footer.copyrightText"] || footerContent.copyrightText || `© ${new Date().getFullYear()} DentyMD. ${t["footer.rightsReserved"] || "Toate drepturile rezervate."}`}</p>
          {footerContent.legalLinks && footerContent.legalLinks.length > 0 ? (
          <div className="flex gap-6">
            {footerContent.legalLinks.map((link: any, index: number) => (
              <Link key={index} href={link.url} prefetch={false} className="hover:text-emerald-400 transition-colors">
                {t[`footer.legalLinks.${index}.label`] || link.label}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex gap-6">
            <Link href="/privacy" prefetch={false} className="hover:text-emerald-400 transition-colors">{t["footer.privacy"] || "Confidențialitate"}</Link>
            <Link href="/cookies" prefetch={false} className="hover:text-emerald-400 transition-colors">{t["footer.cookies"] || "Cookies"}</Link>
            <Link href="/terms" prefetch={false} className="hover:text-emerald-400 transition-colors">{t["footer.terms"] || "Termeni"}</Link>
          </div>
        )}
        </div>
      </div>
    </footer>
  )
}
