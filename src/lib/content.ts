
import { DEFAULT_BLOG_CONTENT } from "@/lib/constants"
import { getContent, getContentForLocale } from "@/lib/get-content"

export type BlogItem = {
    title: string;
    description: string;
    imageBefore: string;
    imageAfter: string;
    image?: string;
    videoUrl?: string;
    tags?: string;
    isFavorite?: boolean;
    type?: 'COMPARISON' | 'SINGLE' | 'STANDARD';
    duration?: string;
    warrantyTitle?: string;
    warrantyPoints?: string;
}

export type BlogContent = {
    sectionTitle?: string;
    sectionDescription?: string;
    introText?: string;
    items: BlogItem[];
}

export async function getBlogContent(): Promise<BlogContent> {
  const content = await getContent("blog")
  
  if (!content?.value) return { items: [] }
  
  try {
    return JSON.parse(content.value) as BlogContent
  } catch {
    return { items: [] }
  }
}

export async function getBlogContentWithDefaults(): Promise<BlogContent> {
    const content = await getBlogContent();
    if (content.items.length === 0) {
        return {
            ...content,
            ...DEFAULT_BLOG_CONTENT
        }
    }
    return content;
}

export async function getBlogContentForLocale(locale: string): Promise<BlogContent> {
  const content = await getContentForLocale("blog", locale)

  if (!content?.value) return { items: [] }

  try {
    return JSON.parse(content.value) as BlogContent
  } catch {
    return { items: [] }
  }
}

export async function getBlogContentForLocaleWithFallback(locale: string): Promise<BlogContent> {
  const content = await getBlogContentForLocale(locale)
  if (content.items.length > 0) return content

  // Fallback to RO
  if (locale !== "ro") {
    const roContent = await getBlogContent()
    if (roContent.items.length > 0) return roContent
  }

  return { ...content, ...DEFAULT_BLOG_CONTENT }
}
