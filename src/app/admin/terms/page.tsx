import { getContent } from "@/lib/get-content"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { TermsContentForm } from "@/components/terms-content-form"
import { PrivacyContentForm } from "@/components/privacy-content-form"
import { CookiesContentForm } from "@/components/cookies-content-form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const dynamic = 'force-dynamic'

async function getTermsContent() {
  const content = await getContent("terms")
  if (!content?.value) return {}
  try { return JSON.parse(content.value) as { sectionTitle?: string, sectionDescription?: string } } catch { return {} }
}

async function getPrivacyContent() {
  const content = await getContent("privacy")
  if (!content?.value) return {}
  try { return JSON.parse(content.value) as { sectionTitle?: string, sectionDescription?: string } } catch { return {} }
}

async function getCookiesContent() {
  const content = await getContent("cookies")
  if (!content?.value) return {}
  try { return JSON.parse(content.value) as { sectionTitle?: string, sectionDescription?: string } } catch { return {} }
}

export default async function TermsEditorPage() {
  const [termsContent, privacyContent, cookiesContent] = await Promise.all([
    getTermsContent(),
    getPrivacyContent(),
    getCookiesContent()
  ])

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">
          {t["admin.terms.subtitle"] || "Website management"}
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
          {t["admin.terms.title"] || "Editează Pagini Legale"}
        </h1>
      </header>

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="termeni-si-conditii" className="border-b-0 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden mb-6">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b border-gray-100 dark:border-white/5 transition-none m-0">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-0">{t["admin.terms.termsTitle"] || "Termeni și Condiții"}</h3>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-6">
            <TermsContentForm initialData={termsContent} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="politica-confidentialitate" className="border-b-0 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden mb-6">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b border-gray-100 dark:border-white/5 transition-none m-0">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-0">{t["admin.terms.privacyTitle"] || "Politică de Confidențialitate"}</h3>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-6">
            <PrivacyContentForm initialData={privacyContent} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="politica-cookies" className="border-b-0 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden mb-6">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b border-gray-100 dark:border-white/5 transition-none m-0">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-0">{t["admin.terms.cookiesTitle"] || "Politică de Cookies"}</h3>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-6">
            <CookiesContentForm initialData={cookiesContent} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
