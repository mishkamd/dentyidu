import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LeadForm } from "@/components/lead-form"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Plane, Smile, ShieldCheck, Star, Gem, Sparkles, Crown, Scan, Zap, Heart, Shield, Activity, Award, TrendingUp, Clock, Wallet, ArrowUpRight, Stethoscope, Calendar, UserCheck, Mic, PhoneOff } from "lucide-react"

import { getBlogContentForLocaleWithFallback } from "@/lib/content"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getContentForLocaleWithFallback } from "@/lib/get-content"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { mergeItemsWithTranslations } from "@/lib/content-translations"

import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo"

export const revalidate = 60 // Revalidate every 60 seconds

type HeroContent = {
  title?: string
  subtitle?: string
  seoTitle?: string
  whatsappLink?: string
  icon?: string
  logo?: string
  logoType?: "image" | "text"
  badge1Title?: string
  badge1Description?: string
  badge2Title?: string
  badge2Description?: string
  button1Text?: string
  button2Text?: string
  card2Title?: string
  card2Description?: string
  ratingValue?: string
  ratingText?: string
  mainImage?: string
  card1Avatar1?: string
  card1Avatar2?: string
}

export async function generateMetadata() {
  const locale = await getServerLocale()
  const [heroContent, t] = await Promise.all([
    getContentForLocaleWithFallback<HeroContent>("hero", locale, {}),
    getTranslations(locale),
  ])

  const title = heroContent?.seoTitle || t["seo.defaultTitle"] || "DentyMD - Implant Dentar Chișinău | Turism Dentar Moldova"
  const description = t["seo.defaultDescription"] || "Clinică stomatologică în Chișinău. Implanturi dentare, fațete E-max, coroane zirconiu — economie până la 70%. Consultație online gratuită."

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

type PricesContent = {
  sectionTitle?: string;
  sectionDescription?: string;
  items: Array<{ title: string; description: string; price: string; oldPrice?: string }>
}

type ChartContent = {
  legend1?: string
  legend2?: string
  legend3?: string
  items: Array<{
    label: string
    v1: number
    v2: number
    v3: number
  }>
}

type ContactContent = {
  sectionTitle?: string;
  sectionDescription?: string;
  phone?: string;
  email?: string;
  address?: string;
  supportTitle?: string;
  supportDescription?: string;
  feedbackTitle?: string;
  feedbackDescription?: string;
  pressTitle?: string;
  pressDescription?: string;
  formTitle?: string;
  formButtonText?: string;
  formFooterText?: string;
  formNameLabel?: string;
  formEmailLabel?: string;
  formPhoneLabel?: string;
  formCountryLabel?: string;
  formDescriptionLabel?: string;
  formBudgetLabel?: string;
  formRadiographyLabel?: string;
}

type ProcessContent = {
  sectionTitle?: string;
  sectionDescription?: string;
  subtitle?: string;
  items: Array<{ title: string; description: string }>
}

type ConsultationContent = {
  title?: string
  description?: string
  buttonText?: string
  consultationTime?: string
  consultationLiveText?: string
  consultationFreeText?: string
  feature1?: string
  feature2?: string
  feature3?: string
  videoCallImage?: string
  doctorImage?: string
}

type FaqContent = {
  sectionTitle?: string;
  sectionDescription?: string;
  items: Array<{ question: string; answer: string }>
}

export default async function Home() {
  const locale = await getServerLocale()

  const [
    heroContent,
    blogContent,
    contactContent,
    processContent,
    faqContent,
    pricesContent,
    chartContent,
    consultationContent,
    t
  ] = await Promise.all([
    getContentForLocaleWithFallback<HeroContent>("hero", locale, {}),
    getBlogContentForLocaleWithFallback(locale),
    getContentForLocaleWithFallback<ContactContent>("contact", locale, {}),
    getContentForLocaleWithFallback<ProcessContent>("process", locale, { items: [] }),
    getContentForLocaleWithFallback<FaqContent>("faq", locale, { items: [] }),
    getContentForLocaleWithFallback<PricesContent>("prices", locale, { items: [] }),
    getContentForLocaleWithFallback<ChartContent | null>("chart", locale, null),
    getContentForLocaleWithFallback<ConsultationContent>("consultation", locale, {}),
    getTranslations(locale)
  ])

  const title = t["homepage.hero.title"] || heroContent?.title || "Zâmbetul Perfect\nLa Prețuri Corecte"
  const subtitle = t["homepage.hero.subtitle"] || heroContent?.subtitle || "Tratamente stomatologice de top în Chișinău. Economisește până la 70% față de Europa de Vest, folosind materiale premium și tehnologie de ultimă oră."
  const whatsappLink = heroContent?.whatsappLink || "https://wa.me/40700000000"

  const pricesToDisplay = mergeItemsWithTranslations(
    pricesContent?.items || [],
    "homepage.prices.items",
    ["title", "description"],
    t
  )

  const getIconAndColor = (index: number) => {
    const styles = [
      { icon: Gem, color: "bg-teal-500/10 text-emerald-400" },
      { icon: Sparkles, color: "bg-blue-500/10 text-blue-400" },
      { icon: Crown, color: "bg-purple-500/10 text-purple-400" },
      { icon: Scan, color: "bg-emerald-500/10 text-emerald-400" },
      { icon: Zap, color: "bg-yellow-500/10 text-yellow-400" },
      { icon: Heart, color: "bg-rose-500/10 text-rose-400" },
      { icon: Shield, color: "bg-indigo-500/10 text-indigo-400" },
      { icon: Activity, color: "bg-orange-500/10 text-orange-400" },
      { icon: Award, color: "bg-cyan-500/10 text-cyan-400" },
    ]
    return styles[index % styles.length]
  }

  // Split title for styling if it contains newline
  const titleParts = title.split('\n')
  const mainTitle = titleParts[0]
  const secondaryTitle = titleParts.slice(1).join('\n')

  const blogPosts = mergeItemsWithTranslations(
    blogContent.items.slice(-2),
    "homepage.blog.items",
    ["title", "description", "tags", "warrantyTitle", "warrantyPoints"],
    t
  ).map(item => ({
    ...item,
    tags: item.tags || "",
    warrantyTitle: item.warrantyTitle || t["blog.warranty"] || "Garanție DentyMD",
    warrantyPoints: item.warrantyPoints || t["blog.warrantyPoints"] || "Certificat de garanție internațional,Pașaport implantologic inclus,Control periodic gratuit"
  }))

  // Process Steps Data
  const defaultIcons = [Stethoscope, Calendar, Plane, Smile]
  const processSteps = mergeItemsWithTranslations(
    processContent?.items || [],
    "homepage.process.items",
    ["title", "description"],
    t
  ).map((item, idx) => ({
    ...item,
    desc: item.description,
    icon: defaultIcons[idx % defaultIcons.length]
  }))



  // FAQ Data
  const faqItems = mergeItemsWithTranslations(
    faqContent?.items || [],
    "homepage.faq.items",
    ["question", "answer"],
    t
  )

  // JSON-LD Structured Data
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: SITE_NAME,
    description: subtitle,
    url: SITE_URL,
    image: heroContent?.mainImage || `${SITE_URL}/image/hero-main.jpg`,
    telephone: contactContent?.phone || "+373 60 000 000",
    email: contactContent?.email || "contact@dentymd.md",
    address: {
      "@type": "PostalAddress",
      streetAddress: contactContent?.address || "Strada Ștefan cel Mare 1",
      addressLocality: "Chișinău",
      addressCountry: "MD",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "47.0105",
      longitude: "28.8638",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      ratingCount: "2000",
    },
    priceRange: "€€",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    availableLanguage: ["Romanian", "English", "French"],
    medicalSpecialty: "Dentistry",
  }

  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } : null

  const serviceSchemas = (pricesToDisplay || []).map((item) => ({
    "@type": "MedicalProcedure",
    name: item.title,
    description: item.description,
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: "EUR",
    },
  }))

  const medicalServiceSchema = serviceSchemas.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: SITE_NAME,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tratamente Dentare",
      itemListElement: serviceSchemas,
    },
  } : null

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
    ],
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {medicalServiceSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalServiceSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6 relative overflow-hidden bg-background">
        {/* Ambient Background Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse dark:bg-primary/10"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000 dark:bg-teal-900/20"></div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text Content */}
            <div className="lg:w-1/2 relative z-10 flex flex-col items-start text-left w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t["homepage.hero.ratingText"] || heroContent?.ratingText || "Acceptăm pacienți noi pentru luna aceasta"}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6 w-full">
                {mainTitle} <br />
                {secondaryTitle && <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">{secondaryTitle}</span>}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                {subtitle}
              </p>

              <div className="flex flex-row gap-3 sm:gap-4">
                <Link href="#contact" className="flex items-center justify-center gap-2 bg-[#5eb561] text-white px-6 py-3 sm:px-14 sm:py-5 rounded-full text-[10px] sm:text-sm font-bold uppercase tracking-wider hover:bg-[#52a155] transition-all duration-200 active:scale-95 shadow-lg shadow-[#5eb561]/20 group">
                  {t["homepage.hero.button1Text"] || heroContent?.button1Text || "Solicită Plan Tratament"}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-transparent border border-gray-200 dark:border-[#2b2b2e] text-zinc-600 dark:text-[#9ca3af] px-6 py-3 sm:px-8 sm:py-4 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-[#1a1a1c] hover:text-zinc-900 dark:hover:text-white transition-all duration-200 active:scale-95 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  {t["homepage.hero.button2Text"] || heroContent?.button2Text || "WhatsApp"}
                </Link>
              </div>

              <div className="mt-6 sm:mt-10 flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div className="flex -space-x-2 sm:-space-x-3">
                  <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full border-2 border-background overflow-hidden relative">
                    <Image src={heroContent?.card1Avatar1 || "/image/hero-avatar-1.jpg"} alt="Pacient mulțumit DentyMD" fill className="object-cover" sizes="40px" priority />
                  </div>
                  <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full border-2 border-background overflow-hidden relative">
                    <Image src={heroContent?.card1Avatar2 || "/image/hero-avatar-2.jpg"} alt="Pacient mulțumit DentyMD" fill className="object-cover" sizes="40px" priority />
                  </div>
                  <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary">
                    +2k
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex text-yellow-400 text-xs">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-medium text-foreground text-[11px] sm:text-sm">{t["homepage.hero.ratingValue"] || heroContent?.ratingValue || "4.9/5"} {t["homepage.hero.ratingText"] || "din recenzii"}</span>
                </div>
              </div>
            </div>

            {/* Bento Grid Visual */}
            <div className="lg:w-1/2 relative mt-12 lg:mt-0 w-full">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {/* Card 1: Main Image */}
                <div className="col-span-2 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 relative group h-64 sm:h-80 md:h-[400px]">
                  <Image
                    src={heroContent?.mainImage || "/image/hero-main.jpg"}
                    alt="Clinica stomatologică DentyMD Chișinău"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-4 rounded-xl flex items-center justify-between border border-white/20">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t["homepage.hero.card2Description"] || heroContent?.card2Description || "Economie medie"}</p>
                      <p className="text-base sm:text-lg font-bold text-foreground">{t["homepage.hero.card2Title"] || heroContent?.card2Title || "€4,500 / pacient"}</p>
                    </div>
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Technology */}
                <div className="bg-card p-4 sm:p-6 rounded-3xl shadow-lg shadow-border/50 border border-border flex flex-col justify-between h-40 sm:h-48 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Scan className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg md:text-lg font-bold text-foreground mb-0.5 sm:mb-1">{t["homepage.hero.badge1Title"] || heroContent?.badge1Title || "3D"}</p>
                    <p className="text-xs sm:text-sm md:text-sm text-muted-foreground">{t["homepage.hero.badge1Description"] || heroContent?.badge1Description || "Tomografie Computerizată & Scanare Digitală incluse."}</p>
                  </div>
                </div>

                {/* Card 3: Team */}
                <div className="relative bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col justify-between h-40 sm:h-48 overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                  <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-base sm:text-lg md:text-lg font-bold text-white mb-0.5 sm:mb-1">{t["homepage.hero.badge2Title"] || heroContent?.badge2Title || "Echipă Certificată"}</p>
                    <p className="text-xs sm:text-sm md:text-sm text-slate-400">{t["homepage.hero.badge2Description"] || heroContent?.badge2Description || "Specialiști cu experiență internațională."}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prices Section */}
      <section id="preturi" className="py-16 md:py-24 bg-muted/50 dark:bg-zinc-900/20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4">{t["homepage.prices.sectionTitle"] || pricesContent?.sectionTitle || "Transparență Totală"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t["homepage.prices.sectionDescription"] || pricesContent?.sectionDescription || "Prețuri fixe, fără costuri ascunse. Planul de tratament este stabilit și agreat înainte de a începe orice procedură."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricesToDisplay.map((item, index) => {
              const style = getIconAndColor(index)
              const Icon = style.icon
              return (
                <div key={index} className="bg-card border border-border p-6 rounded-2xl hover:shadow-lg hover:shadow-primary/5 transition-all group flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full ${style.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-primary">€{item.price}</span>
                    {item.oldPrice && <span className="text-sm text-muted-foreground line-through">€{item.oldPrice}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              )
            })}
          </div>

          {/* Diagnostics Statistics Chart */}
          <div className="mt-8 sm:mt-16 bg-card border border-border rounded-[2rem] p-4 sm:p-8 md:p-12 relative overflow-hidden flex flex-col w-full shadow-sm">
            {/* Header / Legend */}
            <div className="w-full flex justify-start mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2.5 sm:gap-4 md:gap-8 bg-zinc-50 dark:bg-zinc-800/50 px-4 sm:px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border border-border w-full sm:w-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0"></div>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{t["homepage.chart.legend1"] || chartContent?.legend1 || "Europa (UE)"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 dark:bg-zinc-600 shrink-0"></div>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{t["homepage.chart.legend2"] || chartContent?.legend2 || "Marea Britanie"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-teal-500 shrink-0"></div>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{t["homepage.chart.legend3"] || chartContent?.legend3 || "SUA & Canada"}</span>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="w-full relative px-0 sm:px-2">
              {/* Background Grid Lines & Bottom Axis labels (Hidden on very small mobile) */}
              <div className="hidden sm:flex absolute top-0 bottom-0 left-[150px] md:left-[220px] right-2 md:right-8 justify-between z-0 pointer-events-none">
                {[0, 10, 20, 30, 40, 50, 60].map((step) => (
                  <div key={step} className="h-full border-l border-zinc-100 dark:border-zinc-800/60 relative flex flex-col justify-end">
                    <span className="absolute -bottom-8 -translate-x-1/2 text-xs text-zinc-400 font-semibold">{step}%</span>
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="relative z-10 flex flex-col gap-6 sm:gap-7 w-full pb-4 sm:pb-10">
                {mergeItemsWithTranslations(
                  chartContent?.items && chartContent.items.length > 0 ? chartContent.items : [
                    { label: 'Implanturi Dentare', v1: 21, v2: 15, v3: 16 },
                    { label: 'Fațete E-max', v1: 15, v2: 14, v3: 14 },
                    { label: 'Coroane Zirconiu', v1: 11, v2: 15, v3: 16 },
                    { label: 'Albire Dentară', v1: 16, v2: 13, v3: 11 },
                    { label: 'Tratamente Endodonție', v1: 12, v2: 13, v3: 13 },
                  ],
                  "homepage.chart.items",
                  ["label"],
                  t
                ).map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-0">
                    {/* Label - Above on Mobile, Left on Desktop */}
                    <div className="w-full sm:w-[150px] md:w-[220px] shrink-0 sm:pr-6 sm:text-right">
                      <span className="text-sm font-bold text-foreground">{item.label}</span>
                    </div>
                    {/* Stacked Bar container (based on 60% max scale mapped to 100% diagram width) */}
                    <div className="flex-1 flex h-12 sm:h-11 md:h-[50px] rounded-lg sm:rounded-r-xl sm:rounded-l-md overflow-hidden sm:mr-2 md:mr-8 shadow-sm">
                      <div
                        style={{ width: `${(item.v1 / 60) * 100}%` }}
                        className="bg-emerald-500 h-full flex items-center justify-center text-white text-xs md:text-sm font-bold border-r border-white/10"
                      >
                        {item.v1}%
                      </div>
                      <div
                        style={{ width: `${(item.v2 / 60) * 100}%` }}
                        className="bg-zinc-800 dark:bg-zinc-600 h-full flex items-center justify-center text-white text-xs md:text-sm font-bold border-r border-white/10"
                      >
                        {item.v2}%
                      </div>
                      <div
                        style={{ width: `${(item.v3 / 60) * 100}%` }}
                        className="bg-teal-500 h-full flex items-center justify-center text-white text-xs md:text-sm font-bold"
                      >
                        {item.v3}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-16">
            <div className="md:w-3/4 lg:w-1/2 text-center h-fit relative">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">{t["homepage.process.subtitle"] || processContent?.subtitle || "Simplu și Eficient"}</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">{t["homepage.process.sectionTitle"] || processContent?.sectionTitle || "4 Pași spre Zâmbetul Tău"}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                {t["homepage.process.sectionDescription"] || processContent?.sectionDescription || "Am simplificat procesul de turism dentar pentru ca tu să te concentrezi doar pe rezultat. Ne ocupăm noi de restul."}
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative pt-12">
              {processSteps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <div key={idx} className="flex flex-col items-center text-center group relative">

                    {/* Horizontal connecting line (Desktop only) */}
                    {idx !== processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-[2.5rem] left-[50%] w-full h-[2px] bg-border/60 -z-10 group-hover:bg-primary/40 transition-colors"></div>
                    )}

                    <div className="w-20 h-20 rounded-full bg-background border-4 border-primary/10 text-primary flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm mb-6 z-10 shrink-0">
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>

                    {/* Vertical connecting line (Mobile only) */}
                    {idx !== processSteps.length - 1 && (
                      <div className="block md:hidden w-[2px] h-12 bg-border/60 mt-6 group-hover:bg-primary/40 transition-colors"></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Blog / Transformations Section */}
      <section id="blog" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-row justify-between items-center sm:items-end mb-10 sm:mb-16 gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-4">{t["homepage.blog.sectionTitle"] || blogContent?.sectionTitle || "Transformări Reale"}</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl hidden sm:block">
                {t["blog.sectionDescription"] || blogContent?.sectionDescription || "Rezultate care vorbesc de la sine. Pacienți reali, povești reale."}
              </p>
            </div>
            <Link href="/blog" className="text-primary font-semibold hover:text-primary/80 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap shrink-0">
              {t["blog.viewAll"] || "Vezi toate"} <span className="hidden sm:inline">{t["blog.cases"] || "cazurile"}</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post, i) => (
              <Dialog key={i}>
                <DialogTrigger asChild>
                  <div className="group relative rounded-3xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer">
                    <div className="grid grid-cols-2 h-64">
                      <div className="relative h-full border-r border-border">
                        <Image src={post.imageBefore} alt={`${post.title} - înainte de tratament`} fill className="object-cover" />
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded">BEFORE</div>
                      </div>
                      <div className="relative h-full">
                        <Image src={post.imageAfter} alt={`${post.title} - după tratament`} fill className="object-cover" />
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded">AFTER</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {post.tags?.split(',').map((tag, t) => (
                          <span key={t} className="px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{post.description}</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border">
                  <div className="flex flex-col md:grid md:grid-cols-2 h-[85vh] md:h-[600px] overflow-y-auto md:overflow-hidden">
                    {/* Left side: Images */}
                    <div className="relative min-h-[350px] sm:min-h-[450px] md:min-h-0 md:h-full bg-black/5 border-b md:border-b-0 md:border-r border-border shrink-0">
                      <div className="absolute inset-0 flex flex-col">
                        <div className="relative flex-1 border-b border-border/50 group overflow-hidden">
                          <Image src={post.imageBefore} alt={`${post.title} - înainte de tratament`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                            {t["blog.beforeLabel"] || "SITUAȚIA INIȚIALĂ"}
                          </div>
                        </div>
                        <div className="relative flex-1 group overflow-hidden">
                          <Image src={post.imageAfter} alt={`${post.title} - după tratament`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-6 left-6 bg-primary/90 backdrop-blur-md text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">
                            {t["blog.afterLabel"] || "REZULTAT FINAL"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Content */}
                    <div className="p-6 md:p-12 flex flex-col h-auto md:h-full relative bg-card/50">

                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags?.split(',').map((tag, t) => (
                          <span key={t} className="px-3 py-1 rounded-full border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider bg-primary/5">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>

                      <DialogTitle className="text-3xl md:text-3xl md:text-4xl font-bold mb-3 leading-tight text-foreground">{post.title}</DialogTitle>

                      <p className="text-muted-foreground text-lg mb-8 font-medium">
                        {post.description}
                      </p>

                      <div className="bg-background/50 rounded-2xl p-6 border border-border/50 mb-auto shadow-sm">
                        <h4 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                          {post.warrantyTitle || "Garanție DentyMD"}
                        </h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                          {(post.warrantyPoints || "Certificat de garanție internațional,Pașaport implantologic inclus,Control periodic gratuit").split(',').map((point, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-emerald-500" />
                              </div>
                              <span>{point.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="#contact" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5eb561] text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-[#52a155] transition-all shadow-lg shadow-[#5eb561]/25 hover:translate-y-[-2px]">
                          {t["blog.ctaConsultation"] || "Vreau o consultație"}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section className="py-10 md:py-24 bg-background relative px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl sm:rounded-[3rem] overflow-hidden p-4 sm:p-10 lg:p-16 relative flex flex-col lg:flex-row items-center gap-6 sm:gap-10 lg:gap-20 shadow-2xl border border-white/10">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-teal-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 relative space-y-3 sm:space-y-6 lg:space-y-8 z-10 flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs sm:text-sm font-medium backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {t["homepage.consultation.consultationLiveText"] || consultationContent?.consultationLiveText || "Consultație Online Disponibilă"}
              </div>

              <h3 className="text-xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                {t["homepage.consultation.title"] || consultationContent?.title || "Evaluare Online"}
              </h3>

              <p className="text-white/70 text-xs sm:text-lg lg:text-xl leading-relaxed max-w-xl font-light">
                {t["homepage.consultation.description"] || consultationContent?.description || "Trimite radiografia ta și primește un plan preliminar de tratament cu o estimare de cost, direct din confortul casei tale."}
              </p>

              <ul className="space-y-2 sm:space-y-4 pt-2 sm:pt-4 text-left w-full max-w-sm lg:max-w-none">
                {[
                  t["homepage.consultation.feature1"] || consultationContent?.feature1 || "Plan de tratament detaliat",
                  t["homepage.consultation.feature2"] || consultationContent?.feature2 || "Estimare de cost transparentă",
                  t["homepage.consultation.feature3"] || consultationContent?.feature3 || "Asistență organizare călătorie"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                      <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-400" />
                    </div>
                    <span className="text-white/90 font-medium text-xs sm:text-lg">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 sm:pt-6 lg:pt-8 w-full">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full lg:w-auto h-11 sm:h-16 px-6 sm:px-10 text-xs sm:text-base font-bold uppercase tracking-wider shadow-lg shadow-[#5eb561]/20 hover:shadow-xl hover:shadow-[#5eb561]/30 hover:scale-105 transition-all rounded-full bg-[#5eb561] hover:bg-[#52a155]">
                      {t["homepage.consultation.buttonText"] || consultationContent?.buttonText || "Solicită Plan Tratament"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <DialogTitle className="text-xl">{t["consultation.dialogTitle"] || "Solicită un consult gratuit"}</DialogTitle>
                    <LeadForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Visual Side */}
            <div className="w-full md:w-1/2 relative flex justify-center items-center z-10 pt-10 md:pt-0">
              {/* Main Phone/Device Frame */}
              <div className="relative w-[220px] sm:w-[360px] aspect-[9/16] rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-3 bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl rotate-[-4deg] hover:rotate-0 transition-transform duration-700">
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-black">
                  {consultationContent?.videoCallImage ? (
                    <Image src={consultationContent.videoCallImage} alt="Consultație video online DentyMD" fill className="object-cover opacity-90" />
                  ) : (
                    <Image src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80" alt="Consultație video online DentyMD" fill className="object-cover opacity-90" />
                  )}

                  {/* UI Overlay on Device */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between">
                    <div className="flex bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-sm font-semibold">{t["homepage.consultation.consultationTime"] || consultationContent?.consultationTime || "12:45"}</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg cursor-pointer">
                        <PhoneOff className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Picture in Picture */}
                  <div className="absolute top-6 right-6 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                    {consultationContent?.doctorImage ? (
                      <Image src={consultationContent.doctorImage} alt="Medic stomatolog DentyMD" fill className="object-cover" />
                    ) : (
                      <Image src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80" alt="Medic stomatolog DentyMD" fill className="object-cover" />
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute top-[15%] sm:top-1/4 left-0 sm:-left-12 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2 sm:p-4 flex items-center gap-2 sm:gap-4 animate-bounce hover:scale-105 transition-transform" style={{ animationDuration: '3s' }}>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0">
                  <Scan className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col pr-2 sm:pr-4">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">Status</span>
                  <span className="font-extrabold text-xs sm:text-base text-slate-800">{t["homepage.consultation.consultationLiveText"] || consultationContent?.consultationLiveText || "Consultație Live"}</span>
                </div>
              </div>

              <div className="absolute bottom-[20%] sm:bottom-1/4 -right-2 sm:-right-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2 sm:p-4 flex items-center gap-2 sm:gap-4 animate-bounce hover:scale-105 transition-transform delay-1000" style={{ animationDuration: '4s' }}>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
                  <Gem className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col pr-2 sm:pr-4">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">Cost</span>
                  <span className="font-extrabold text-xs sm:text-base text-emerald-600">{t["homepage.consultation.consultationFreeText"] || consultationContent?.consultationFreeText || "100% Gratuit"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4">{t["homepage.faq.sectionTitle"] || faqContent?.sectionTitle || "Întrebări Frecvente"}</h2>
            <p className="text-muted-foreground">
              {t["homepage.faq.sectionDescription"] || faqContent?.sectionDescription || "Tot ce trebuie să știi despre tratamentul tău în Chișinău."}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border px-4 sm:px-6 rounded-2xl data-[state=open]:ring-1 data-[state=open]:ring-primary/20">
                <AccordionTrigger className="hover:no-underline py-6 text-left font-medium text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6">{t["contact.sectionTitle"] || contactContent?.sectionTitle || "Începe Călătoria Ta"}</h2>
              <p className="text-muted-foreground text-lg mb-12">
                {t["contact.sectionDescription"] || contactContent?.sectionDescription || "Completează formularul și te contactăm în maxim 24 de ore cu un plan preliminar și o estimare de cost. Fără obligații."}
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center shrink-0 text-primary shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{t["contact.supportTitle"] || contactContent?.supportTitle || "Suport Telefonic"}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{t["contact.supportDescription"] || contactContent?.supportDescription || "Luni - Vineri, 09:00 - 18:00"}</p>
                    <a href={`tel:${(contactContent?.phone || "+373 60 000 000").replace(/\s/g, '')}`} className="text-primary font-semibold hover:underline">{contactContent?.phone || "+373 60 000 000"}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center shrink-0 text-primary shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{t["contact.emailTitle"] || contactContent?.feedbackTitle || "Email"}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{t["contact.emailDescription"] || contactContent?.feedbackDescription || "Răspundem în maxim 24h"}</p>
                    <a href={`mailto:${contactContent?.email || "contact@dentymd.md"}`} className="text-primary font-semibold hover:underline">{contactContent?.email || "contact@dentymd.md"}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center shrink-0 text-primary shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{t["contact.locationTitle"] || contactContent?.pressTitle || "Locație"}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{t["contact.locationDescription"] || contactContent?.pressDescription || "Chișinău, Moldova"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <LeadForm
                title={contactContent?.formTitle}
                buttonText={contactContent?.formButtonText}
                footerText={contactContent?.formFooterText}
                nameLabel={contactContent?.formNameLabel}
                emailLabel={contactContent?.formEmailLabel}
                phoneLabel={contactContent?.formPhoneLabel}
                countryLabel={contactContent?.formCountryLabel}
                descriptionLabel={contactContent?.formDescriptionLabel}
                budgetLabel={contactContent?.formBudgetLabel}
                radiographyLabel={contactContent?.formRadiographyLabel}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
