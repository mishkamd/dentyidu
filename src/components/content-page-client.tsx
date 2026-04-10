"use client"

import { useLanguage } from "@/components/language-provider"
import { HeroContentForm } from "@/components/hero-content-form"
import { PricesContentForm } from "@/components/prices-content-form"
import { ContactContentForm } from "@/components/contact-content-form"
import { ProcessContentForm } from "@/components/process-content-form"
import { FaqContentForm } from "@/components/faq-content-form"
import { MenuContentForm } from "@/components/menu-content-form"
import { FooterContentForm } from "@/components/footer-content-form"
import { ChartContentForm } from "@/components/chart-content-form"
import { ConsultationContentForm } from "@/components/consultation-content-form"
import { BlogContentForm } from "@/components/blog-content-form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const SECTIONS = [
  { key: "meniu-navigare", tKey: "admin.content.sections.menu", fallback: "Meniu Navigare", contentKey: "menu" },
  { key: "continut-hero", tKey: "admin.content.sections.hero", fallback: "Conținut Homepage (Hero)", contentKey: "hero" },
  { key: "preturi-servicii", tKey: "admin.content.sections.prices", fallback: "Prețuri și Servicii", contentKey: "prices" },
  { key: "grafic-statistici", tKey: "admin.content.sections.chart", fallback: "Grafic Economii (Statistici)", contentKey: "chart" },
  { key: "procesul-lucru", tKey: "admin.content.sections.process", fallback: "Procesul de Lucru", contentKey: "process" },
  { key: "blog-transformari", tKey: "admin.content.sections.blog", fallback: "Blog / Transformări", contentKey: "blog" },
  { key: "sectiune-consultatie", tKey: "admin.content.sections.consultation", fallback: "Secțiune Consultație", contentKey: "consultation" },
  { key: "intrebari-faq", tKey: "admin.content.sections.faq", fallback: "Întrebări Frecvente (FAQ)", contentKey: "faq" },
  { key: "informatii-contact", tKey: "admin.content.sections.contact", fallback: "Informații Contact", contentKey: "contact" },
  { key: "footer", tKey: "admin.content.sections.footer", fallback: "Footer", contentKey: "footer" },
] as const

function renderForm(contentKey: string, data: any) {
  switch (contentKey) {
    case "menu": return <MenuContentForm initialData={data} locale="ro" />
    case "hero": return <HeroContentForm initialData={data} locale="ro" />
    case "prices": return <PricesContentForm initialData={data} locale="ro" />
    case "chart": return <ChartContentForm initialData={data} locale="ro" />
    case "process": return <ProcessContentForm initialData={data} locale="ro" />
    case "consultation": return <ConsultationContentForm initialData={data} locale="ro" />
    case "blog": return <BlogContentForm initialData={data} locale="ro" />
    case "faq": return <FaqContentForm initialData={data} locale="ro" />
    case "contact": return <ContactContentForm initialData={data} locale="ro" />
    case "footer": return <FooterContentForm initialData={data} locale="ro" />
    default: return null
  }
}

export function ContentPageClient({ data }: { data: Record<string, any> }) {
  const { t } = useLanguage()

  return (
    <Accordion type="multiple" className="w-full">
      {SECTIONS.map(({ key, tKey, fallback, contentKey }) => (
        <AccordionItem key={key} value={key} className="border-b-0 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden mb-6">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b border-gray-100 dark:border-white/5 transition-none m-0">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-0">{t(tKey, fallback)}</h3>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-6">
            {renderForm(contentKey, data[contentKey] || {})}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
