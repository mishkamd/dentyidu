'use server'

import { getCurrentAdmin } from "@/lib/get-current-admin"
import { prisma } from "@/lib/prisma"
import { HeroContentSchema, PricesContentSchema, BlogContentSchema, ContactContentSchema, ProcessContentSchema, FaqContentSchema, TermsContentSchema, MenuContentSchema, FooterContentSchema, ChartContentSchema, ConsultationContentSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { log } from "@/lib/logger"
import { getServerT } from "@/lib/locale-server"

type ContentState = {
  errors?: Record<string, string[]>
  message: string
  success?: boolean
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Helper to save file
const saveFile = async (file: File | string | null): Promise<string | null> => {
  if (!file || typeof file === "string") return null
  if (file.size === 0 || file.name === "undefined") return null

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) return null

  // Validate file size
  if (file.size > MAX_FILE_SIZE) return null

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
  // Modified to save to src/app/image as requested
  const uploadDir = path.join(process.cwd(), "src/app/image")

  try {
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)
    // Return path accessible via our new route handler
    return `/image/${filename}`
  } catch (e) {
    log.error('file_upload_error', 'Upload failed', e)
    return null
  }
}

export async function updateHeroContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const iconFile = formData.get("iconFile") as File
  const logoFile = formData.get("logoFile") as File
  const existingIcon = formData.get("existingIcon") as string
  const existingLogo = formData.get("existingLogo") as string

  const logoType = formData.get("logoType") as "image" | "text" || "image"
  const logoText = formData.get("logoText") as string

  // Handle Main Image
  const mainImageFile = formData.get("mainImageFile") as File
  const existingMainImage = formData.get("existingMainImage") as string
  let mainImage = existingMainImage
  if (mainImageFile && mainImageFile.size > 0) {
    const saved = await saveFile(mainImageFile)
    if (saved) mainImage = saved
  }

  // Handle Card Avatars
  const card1Avatar1File = formData.get("card1Avatar1File") as File
  const existingCard1Avatar1 = formData.get("existingCard1Avatar1") as string
  let card1Avatar1 = existingCard1Avatar1
  if (card1Avatar1File && card1Avatar1File.size > 0) {
    const saved = await saveFile(card1Avatar1File)
    if (saved) card1Avatar1 = saved
  }

  const card1Avatar2File = formData.get("card1Avatar2File") as File
  const existingCard1Avatar2 = formData.get("existingCard1Avatar2") as string
  let card1Avatar2 = existingCard1Avatar2
  if (card1Avatar2File && card1Avatar2File.size > 0) {
    const saved = await saveFile(card1Avatar2File)
    if (saved) card1Avatar2 = saved
  }

  let icon = existingIcon
  if (iconFile && iconFile.size > 0) {
    const savedIcon = await saveFile(iconFile)
    if (savedIcon) icon = savedIcon
  }

  let logo = existingLogo
  if (logoType === "image") {
    if (logoFile && logoFile.size > 0) {
      const savedLogo = await saveFile(logoFile)
      if (savedLogo) logo = savedLogo
    }
  } else {
    logo = logoText
  }

  const rawData = {
    title: formData.get("title") || "",
    subtitle: formData.get("subtitle") || "",
    seoTitle: formData.get("seoTitle") || "",
    whatsappLink: formData.get("whatsappLink") || "",
    icon,
    logo,
    logoType,
    mainImage,
    card1Avatar1,
    card1Avatar2,
    badge1Title: formData.get("badge1Title") || "",
    badge1Description: formData.get("badge1Description") || "",
    badge2Title: formData.get("badge2Title") || "",
    badge2Description: formData.get("badge2Description") || "",
    button1Text: formData.get("button1Text") || "",
    button2Text: formData.get("button2Text") || "",
    card2Title: formData.get("card2Title") || "",
    card2Description: formData.get("card2Description") || "",
    ratingValue: formData.get("ratingValue") || "",
    ratingText: formData.get("ratingText") || "",
  }

  const validated = HeroContentSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  const locale = (formData.get("locale") as string) || "ro"

  try {
    await prisma.content.upsert({
      where: { key_locale: { key: "hero", locale } },
      update: {
        value: JSON.stringify(validated.data),
      },
      create: { key: "hero", locale, value: JSON.stringify(validated.data),
      },
    })
  } catch {
    return { message: t('action.content.updateError', 'Eroare la actualizarea conținutului.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/admin/blog')
  revalidatePath('/')
  return { message: t('action.content.updateSuccess', 'Conținut actualizat cu succes!'), success: true }
}

export async function updatePricesContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const titles = formData.getAll("titles")
  const descriptions = formData.getAll("descriptions")
  const prices = formData.getAll("prices")
  const oldPrices = formData.getAll("oldPrices")

  const items = titles.map((title, i) => ({
    title,
    description: descriptions[i],
    price: prices[i],
    oldPrice: oldPrices[i],
  }))

  const rawData = {
    sectionTitle: formData.get("sectionTitle") || "",
    sectionDescription: formData.get("sectionDescription") || "",
    items,
  }

  const validated = PricesContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "prices", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "prices", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.pricesError', 'Eroare la actualizarea prețurilor.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { message: t('action.content.pricesSuccess', 'Prețuri actualizate cu succes!'), success: true }
}

export async function updateBlogContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const titles = formData.getAll("titles")
  const descriptions = formData.getAll("descriptions") as string[]
  const tags = formData.getAll("tags") as string[]
  const isFavorites = formData.getAll("isFavorites") as string[]
  const types = formData.getAll("types") as string[]
  const warrantyTitles = formData.getAll("warrantyTitles") as string[]
  const warrantyPoints = formData.getAll("warrantyPoints") as string[]
  const existingImagesBefore = formData.getAll("existingImagesBefore")
  const existingImagesAfter = formData.getAll("existingImagesAfter")
  const existingImages = formData.getAll("existingImages")
  const videoUrls = formData.getAll("videoUrls") as string[]
  const imageBeforeFiles = formData.getAll("imageBeforeFiles") as File[]
  const imageAfterFiles = formData.getAll("imageAfterFiles") as File[]
  const imageFiles = formData.getAll("imageFiles") as File[]

  const items = await Promise.all(titles.map(async (title, i) => {
    let imageBefore = existingImagesBefore[i] as string
    if (imageBeforeFiles[i] && imageBeforeFiles[i].size > 0) {
      const saved = await saveFile(imageBeforeFiles[i])
      if (saved) imageBefore = saved
    }

    let imageAfter = existingImagesAfter[i] as string
    if (imageAfterFiles[i] && imageAfterFiles[i].size > 0) {
      const saved = await saveFile(imageAfterFiles[i])
      if (saved) imageAfter = saved
    }

    let image = existingImages[i] as string
    if (imageFiles[i] && imageFiles[i].size > 0) {
      const saved = await saveFile(imageFiles[i])
      if (saved) image = saved
    }

    return {
      title,
      description: descriptions[i],
      imageBefore: imageBefore || "",
      imageAfter: imageAfter || "",
      image: image || "",
      videoUrl: videoUrls[i] || "",
      tags: tags[i],
      isFavorite: isFavorites[i] === "true",
      type: types[i] || "COMPARISON",
      warrantyTitle: warrantyTitles[i] || "",
      warrantyPoints: warrantyPoints[i] || "",
    }
  }))

  const rawData = {
    sectionTitle: formData.get("sectionTitle") || "",
    sectionDescription: formData.get("sectionDescription") || "",
    items,
  }

  const validated = BlogContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  const locale = (formData.get("locale") as string) || "ro"

  try {
    await prisma.content.upsert({
      where: { key_locale: { key: "blog", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "blog", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.blogError', 'Eroare la actualizarea blogului.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/admin/blog')
  revalidatePath('/')
  revalidatePath('/blog')
  return { message: t('action.content.blogSuccess', 'Blog actualizat cu succes!'), success: true }
}

export async function updateContactContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const rawData = {
    sectionTitle: formData.get("sectionTitle") || "",
    sectionDescription: formData.get("sectionDescription") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    address: formData.get("address") || "",
    supportTitle: formData.get("supportTitle") || "",
    supportDescription: formData.get("supportDescription") || "",
    feedbackTitle: formData.get("feedbackTitle") || "",
    feedbackDescription: formData.get("feedbackDescription") || "",
    pressTitle: formData.get("pressTitle") || "",
    pressDescription: formData.get("pressDescription") || "",
    formTitle: formData.get("formTitle") || "",
    formButtonText: formData.get("formButtonText") || "",
    formFooterText: formData.get("formFooterText") || "",
    formNameLabel: formData.get("formNameLabel") || "",
    formEmailLabel: formData.get("formEmailLabel") || "",
    formPhoneLabel: formData.get("formPhoneLabel") || "",
    formCountryLabel: formData.get("formCountryLabel") || "",
    formDescriptionLabel: formData.get("formDescriptionLabel") || "",
    formBudgetLabel: formData.get("formBudgetLabel") || "",
    formRadiographyLabel: formData.get("formRadiographyLabel") || "",
  }

  const validated = ContactContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "contact", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "contact", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.contactError', 'Eroare la actualizarea contactului.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { message: t('action.content.contactSuccess', 'Contact actualizat cu succes!'), success: true }
}

export async function updateProcessContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const titles = formData.getAll("titles")
  const descriptions = formData.getAll("descriptions")

  const items = titles.map((title, i) => ({
    title,
    description: descriptions[i],
  }))

  const rawData = {
    sectionTitle: formData.get("sectionTitle") || "",
    sectionDescription: formData.get("sectionDescription") || "",
    subtitle: formData.get("subtitle") || "",
    items,
  }

  const validated = ProcessContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "process", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "process", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.processError', 'Eroare la actualizarea procesului.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { message: t('action.content.processSuccess', 'Proces actualizat cu succes!'), success: true }
}


export async function updateFaqContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const questions = formData.getAll("questions")
  const answers = formData.getAll("answers")

  const items = questions.map((question, i) => ({
    question,
    answer: answers[i],
  }))

  const rawData = {
    sectionTitle: formData.get("sectionTitle") || "",
    sectionDescription: formData.get("sectionDescription") || "",
    items,
  }

  const validated = FaqContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "faq", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "faq", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.faqError', 'Eroare la actualizarea întrebărilor.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { message: t('action.content.faqSuccess', 'Întrebări actualizate cu succes!'), success: true }
}

export async function updateMenuContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const items = []
  let i = 0
  while (formData.has(`items.${i}.label`)) {
    items.push({
      label: formData.get(`items.${i}.label`),
      href: formData.get(`items.${i}.href`),
    })
    i++
  }

  const rawData = {
    items,
  }

  const validated = MenuContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "menu", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "menu", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.menuError', 'Eroare la actualizarea meniului.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { message: t('action.content.menuSuccess', 'Meniu actualizat cu succes!'), success: true }
}

export async function updateTermsContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const rawData = {
    sectionTitle: formData.get("sectionTitle") || "",
    sectionDescription: formData.get("sectionDescription") || "",
  }

  const validated = TermsContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "terms", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "terms", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.termsError', 'Eroare la actualizarea termenilor.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/admin/translations')
  revalidatePath('/termeni-si-conditii')
  revalidatePath('/terms')
  return { message: t('action.content.termsSuccess', 'Termeni actualizați cu succes!'), success: true }
}

export async function updateFooterContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const quickLinks = []
  let i = 0
  while (formData.has(`quickLinks.${i}.label`)) {
    const label = formData.get(`quickLinks.${i}.label`) as string
    const href = formData.get(`quickLinks.${i}.href`) as string

    // Only add valid links
    if (label && href) {
      quickLinks.push({ label, href })
    }
    i++
  }

  const legalLinks = []
  let legalIndex = 0
  while (formData.has(`legalLinks.${legalIndex}.label`)) {
    const label = formData.get(`legalLinks.${legalIndex}.label`) as string
    const url = formData.get(`legalLinks.${legalIndex}.url`) as string

    if (label && url) {
      legalLinks.push({ label, url })
    }
    legalIndex++
  }

  const rawData = {
    brandDescription: formData.get("brandDescription") || "",
    newsletterTitle: formData.get("newsletterTitle") || "",
    newsletterDescription: formData.get("newsletterDescription") || "",
    copyrightText: formData.get("copyrightText") || "",
    quickLinksTitle: formData.get("quickLinksTitle") || "",
    contactTitle: formData.get("contactTitle") || "",
    newsletterButtonText: formData.get("newsletterButtonText") || "",
    newsletterPlaceholder: formData.get("newsletterPlaceholder") || "",
    facebook: formData.get("facebook") || "",
    instagram: formData.get("instagram") || "",
    linkedin: formData.get("linkedin") || "",
    twitter: formData.get("twitter") || "",
    quickLinks,
    legalLinks,
  }

  const validated = FooterContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "footer", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "footer", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.footerError', 'Eroare la actualizarea footer-ului.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { message: t('action.content.footerSuccess', 'Footer actualizat cu succes!'), success: true }
}

export async function updateChartContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  const labels = formData.getAll("labels") as string[]
  const v1s = formData.getAll("v1s") as string[]
  const v2s = formData.getAll("v2s") as string[]
  const v3s = formData.getAll("v3s") as string[]

  const items = labels.map((label, i) => ({
    label,
    v1: parseFloat(v1s[i] || "0"),
    v2: parseFloat(v2s[i] || "0"),
    v3: parseFloat(v3s[i] || "0"),
  }))

  const rawData = {
    legend1: formData.get("legend1") || "",
    legend2: formData.get("legend2") || "",
    legend3: formData.get("legend3") || "",
    items,
  }

  const validated = ChartContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "chart", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "chart", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.chartError', 'Eroare la actualizarea graficului de statistici.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { message: t('action.content.chartSuccess', 'Grafic actualizat cu succes!'), success: true }
}

export async function updateConsultationContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  }

  // Handle Video Call Image
  const videoCallImageFile = formData.get("videoCallImageFile") as File
  const existingVideoCallImage = formData.get("existingVideoCallImage") as string
  let videoCallImage = existingVideoCallImage
  if (videoCallImageFile && videoCallImageFile.size > 0) {
    const saved = await saveFile(videoCallImageFile)
    if (saved) videoCallImage = saved
  }

  // Handle Doctor Image
  const doctorImageFile = formData.get("doctorImageFile") as File
  const existingDoctorImage = formData.get("existingDoctorImage") as string
  let doctorImage = existingDoctorImage
  if (doctorImageFile && doctorImageFile.size > 0) {
    const saved = await saveFile(doctorImageFile)
    if (saved) doctorImage = saved
  }

  const rawData = {
    title: formData.get("title") || "",
    description: formData.get("description") || "",
    buttonText: formData.get("buttonText") || "",
    consultationTime: formData.get("consultationTime") || "",
    consultationLiveText: formData.get("consultationLiveText") || "",
    consultationFreeText: formData.get("consultationFreeText") || "",
    feature1: formData.get("feature1") || "",
    feature2: formData.get("feature2") || "",
    feature3: formData.get("feature3") || "",
    videoCallImage,
    doctorImage,
  }

  const validated = ConsultationContentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "consultation", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "consultation", locale, value: JSON.stringify(validated.data) },
    })
  } catch {
    return { message: t('action.content.consultationError', 'Eroare la actualizarea consultației.') }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { message: t('action.content.consultationSuccess', 'Consultație actualizată cu succes!'), success: true }
}


export async function updatePrivacyContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    sectionTitle: formData.get("sectionTitle") || "",
    sectionDescription: formData.get("sectionDescription") || "",
  }

  const validated = TermsContentSchema.safeParse(rawData)
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors, message: t('action.form.invalidData', 'Date invalide.') }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "privacy", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "privacy", locale, value: JSON.stringify(validated.data) },
    })
    revalidatePath("/admin/terms")
    revalidatePath("/admin/translations")
    revalidatePath("/privacy")
    return { success: true, message: t('action.content.saveSuccess', 'Datele au fost salvate cu succes!') }
  } catch (error) {
    log.error('privacy_save_error', 'Error saving privacy config', error)
    return { success: false, message: t('action.content.saveError', 'A apărut o eroare la salvare.') }
  }
}

export async function updateCookiesContent(prevState: ContentState, formData: FormData): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    sectionTitle: formData.get("sectionTitle") || "",
    sectionDescription: formData.get("sectionDescription") || "",
  }

  const validated = TermsContentSchema.safeParse(rawData)
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors, message: t('action.form.invalidData', 'Date invalide.') }

  try {
    const locale = (formData.get("locale") as string) || "ro"
    await prisma.content.upsert({
      where: { key_locale: { key: "cookies", locale } },
      update: { value: JSON.stringify(validated.data) },
      create: { key: "cookies", locale, value: JSON.stringify(validated.data) },
    })
    revalidatePath("/admin/terms")
    revalidatePath("/admin/translations")
    revalidatePath("/cookies")
    return { success: true, message: t('action.content.saveSuccess', 'Datele au fost salvate cu succes!') }
  } catch (error) {
    log.error('cookies_save_error', 'Error saving cookies config', error)
    return { success: false, message: t('action.content.saveError', 'A apărut o eroare la salvare.') }
  }
}

const VALID_CONTENT_KEYS = new Set([
  "menu", "hero", "prices", "chart", "process", "blog",
  "consultation", "faq", "contact", "footer", "terms", "privacy", "cookies",
])

export async function bulkUpsertContent(
  entries: Array<{ key: string; locale: string; value: string }>
): Promise<ContentState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return { message: t('action.content.notAuthenticated', 'Nu sunteți autentificat.') }
  if (currentAdmin.role !== "ADMIN" && currentAdmin.role !== "MANAGER") {
    return { message: t('action.content.noPermission', 'Nu aveți permisiune.') }
  }

  try {
    let count = 0
    for (const entry of entries) {
      if (!entry.key?.trim() || !entry.locale?.trim()) continue
      if (!VALID_CONTENT_KEYS.has(entry.key.trim())) continue
      await prisma.content.upsert({
        where: { key_locale: { key: entry.key.trim(), locale: entry.locale.trim() } },
        update: { value: entry.value },
        create: { key: entry.key.trim(), locale: entry.locale.trim(), value: entry.value },
      })
      count++
    }
    revalidatePath("/admin/translations")
    revalidatePath("/admin/content")
    revalidatePath("/")
    return { success: true, message: t('action.content.bulkSuccess', '{count} secțiuni importate.').replace('{count}', String(count)) }
  } catch (error) {
    log.error('content_bulk_upsert_error', 'Error bulk upserting content', error)
    return { success: false, message: t('action.content.saveError', 'A apărut o eroare la salvare.') }
  }
}
