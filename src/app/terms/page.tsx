import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getContent } from "@/lib/get-content"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import DOMPurify from "isomorphic-dompurify"

export const revalidate = 3600

export const metadata = {
  title: "Termeni și Condiții - DentyMD",
  description: "Termenii și condițiile de utilizare",
}

async function getPageContent() {
  const content = await getContent("terms")
  
  if (!content?.value) return null
  
  try {
    return JSON.parse(content.value) as { 
      sectionTitle?: string
      sectionDescription?: string
    }
  } catch {
    return null
  }
}

export default async function Terms() {
  const content = await getPageContent()
  const locale = await getServerLocale()
  const t = await getTranslations(locale)
  const title = content?.sectionTitle || t["legal.terms.title"] || "Termeni și Condiții"
  
  const defaultBody = t["legal.terms.defaultBody"] || "<p>Acesta este documentul implicit pentru Termeni și Condiții. Îl puteți edita din panoul de administrare.</p>"

  const body = content?.sectionDescription || defaultBody

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{title}</h1>
          
          <div 
            className="prose prose-invert max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
          />

          {!content && (
            <p suppressHydrationWarning className="text-sm text-muted-foreground mt-12 pt-8 border-t border-border">
              {t["legal.lastUpdated"] || "Ultima actualizare"}: {new Date().toLocaleDateString(locale === 'ro' ? 'ro-RO' : locale === 'fr' ? 'fr-FR' : 'en-US')}
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
