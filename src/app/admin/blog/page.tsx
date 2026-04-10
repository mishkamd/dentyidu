import { prisma } from "@/lib/prisma"
import { getBlogContentWithDefaults, getBlogContentForLocale } from "@/lib/content"
import type { BlogContent } from "@/lib/content"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { SUPPORTED_LOCALES } from "@/lib/i18n"
import { BlogLocaleTabs } from "@/components/blog-locale-tabs"

export const dynamic = 'force-dynamic'

export default async function BlogAdminPage() {
  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  // Load blog content for all supported locales
  const allLocaleData: Record<string, BlogContent> = {}
  for (const loc of SUPPORTED_LOCALES) {
    if (loc === "ro") {
      allLocaleData[loc] = await getBlogContentWithDefaults()
    } else {
      allLocaleData[loc] = await getBlogContentForLocale(loc)
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">
          {t["admin.blog.subtitle"] || "Website management"}
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t["admin.blog.title"] || "Blog & Galerie Foto"}
        </h1>
      </header>

      <BlogLocaleTabs
        allLocaleData={allLocaleData}
        locales={[...SUPPORTED_LOCALES]}
        roData={allLocaleData["ro"]}
        managePostsLabel={t["admin.blog.managePosts"] || "Administrare Postări"}
      />
    </div>
  )
}
