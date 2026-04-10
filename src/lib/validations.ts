import { z } from "zod"

export const LeadSchema = z.object({
  name: z.string().min(2, { message: "Numele trebuie să aibă minim 2 caractere." }),
  email: z.string().email({ message: "Email invalid." }),
  phone: z.string().min(10, { message: "Număr de telefon invalid." }),
  description: z.string().min(10, { message: "Descrierea trebuie să fie mai detaliată." }),
  radiographyLink: z.string().optional().or(z.literal("")),
  country: z.string().min(2),
  budget: z.string().optional(),
})

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const LeadStatusSchema = z.enum([
  "NOU",
  "CONTACTAT",
  "OFERTA_TRIMISA",
  "PROGRAMAT",
  "FINALIZAT",
  "PIERDUT",
  "ANULAT"
])

export type LeadFormValues = z.infer<typeof LeadSchema>
export type AdminLoginFormValues = z.infer<typeof AdminLoginSchema>

export const CreateUserSchema = z.object({
  name: z.string().min(2, { message: "Numele trebuie să aibă minim 2 caractere." }).optional().or(z.literal("")),
  email: z.string().email({ message: "Email invalid." }),
  password: z.string().min(6, { message: "Parola trebuie să aibă minim 6 caractere." }),
  role: z.enum(["ADMIN", "MANAGER", "DENTIST"]),
  clinicId: z.string().optional().or(z.literal("none")),
})

export const HeroContentSchema = z.object({
  title: z.string().min(1, "Titlul este obligatoriu"),
  subtitle: z.string().min(1, "Subtitlul este obligatoriu"),
  seoTitle: z.string().optional().or(z.literal("")),
  icon: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  logoType: z.enum(["image", "text"]).default("image").optional(),
  whatsappLink: z.string().optional().or(z.literal("")),
  badge1Title: z.string().optional().or(z.literal("")),
  badge1Description: z.string().optional().or(z.literal("")),
  badge2Title: z.string().optional().or(z.literal("")),
  badge2Description: z.string().optional().or(z.literal("")),
  button1Text: z.string().optional().or(z.literal("")),
  button2Text: z.string().optional().or(z.literal("")),
  card2Title: z.string().optional().or(z.literal("")),
  card2Description: z.string().optional().or(z.literal("")),
  ratingValue: z.string().optional().or(z.literal("")),
  ratingText: z.string().optional().or(z.literal("")),
  mainImage: z.string().optional().or(z.literal("")),
  card1Avatar1: z.string().optional().or(z.literal("")),
  card1Avatar2: z.string().optional().or(z.literal("")),
})

export const PriceItemSchema = z.object({
  title: z.string().min(1, "Titlul este obligatoriu"),
  description: z.string().min(1, "Descrierea este obligatorie"),
  price: z.string().min(1, "Prețul este obligatoriu"),
  oldPrice: z.string().optional().or(z.literal("")),
})

export const PricesContentSchema = z.object({
  sectionTitle: z.string().optional().or(z.literal("")),
  sectionDescription: z.string().optional().or(z.literal("")),
  items: z.array(PriceItemSchema)
})

export const MenuItemSchema = z.object({
  label: z.string().min(1, "Eticheta este obligatorie"),
  href: z.string().min(1, "Link-ul este obligatoriu"),
})

export const MenuContentSchema = z.object({
  items: z.array(MenuItemSchema)
})

export const BlogItemSchema = z.object({
  title: z.string().min(1, "Titlul este obligatoriu"),
  description: z.string().min(1, "Descrierea este obligatorie"),
  imageBefore: z.string().optional().or(z.literal("")),
  imageAfter: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  videoUrl: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  isFavorite: z.boolean().optional(),
  type: z.enum(["COMPARISON", "SINGLE", "STANDARD"]).default("COMPARISON").optional(),
  warrantyTitle: z.string().optional().or(z.literal("")),
  warrantyPoints: z.string().optional().or(z.literal("")),
})

export const BlogContentSchema = z.object({
  sectionTitle: z.string().optional().or(z.literal("")),
  sectionDescription: z.string().optional().or(z.literal("")),
  items: z.array(BlogItemSchema)
})

export const ContactContentSchema = z.object({
  sectionTitle: z.string().optional().or(z.literal("")),
  sectionDescription: z.string().optional().or(z.literal("")),
  phone: z.string().min(1, "Telefonul este obligatoriu"),
  email: z.string().email("Email invalid"),
  address: z.string().min(1, "Adresa este obligatorie"),
  supportTitle: z.string().optional().or(z.literal("")),
  supportDescription: z.string().optional().or(z.literal("")),
  feedbackTitle: z.string().optional().or(z.literal("")),
  feedbackDescription: z.string().optional().or(z.literal("")),
  pressTitle: z.string().optional().or(z.literal("")),
  pressDescription: z.string().optional().or(z.literal("")),
  formTitle: z.string().optional().or(z.literal("")),
  formButtonText: z.string().optional().or(z.literal("")),
  formFooterText: z.string().optional().or(z.literal("")),
  formNameLabel: z.string().optional().or(z.literal("")),
  formEmailLabel: z.string().optional().or(z.literal("")),
  formPhoneLabel: z.string().optional().or(z.literal("")),
  formCountryLabel: z.string().optional().or(z.literal("")),
  formDescriptionLabel: z.string().optional().or(z.literal("")),
  formBudgetLabel: z.string().optional().or(z.literal("")),
  formRadiographyLabel: z.string().optional().or(z.literal("")),
})

export const ProcessItemSchema = z.object({
  title: z.string().min(1, "Titlul este obligatoriu"),
  description: z.string().min(1, "Descrierea este obligatorie"),
})

export const ProcessContentSchema = z.object({
  sectionTitle: z.string().optional().or(z.literal("")),
  sectionDescription: z.string().optional().or(z.literal("")),
  subtitle: z.string().optional().or(z.literal("")),
  items: z.array(ProcessItemSchema).max(4, "Nu poți adăuga mai mult de 4 pași.")
})

export const FaqItemSchema = z.object({
  question: z.string().min(1, "Întrebarea este obligatorie"),
  answer: z.string().min(1, "Răspunsul este obligatoriu"),
})

export const FaqContentSchema = z.object({
  sectionTitle: z.string().optional().or(z.literal("")),
  sectionDescription: z.string().optional().or(z.literal("")),
  items: z.array(FaqItemSchema)
})

export const TermsContentSchema = z.object({
  sectionTitle: z.string().min(1, "Titlul secțiunii este obligatoriu"),
  sectionDescription: z.string().min(1, "Descrierea secțiunii este obligatorie"),
})

export const FooterContentSchema = z.object({
  brandDescription: z.string().optional().or(z.literal("")),
  newsletterTitle: z.string().optional().or(z.literal("")),
  newsletterDescription: z.string().optional().or(z.literal("")),
  copyrightText: z.string().optional().or(z.literal("")),
  quickLinksTitle: z.string().optional().or(z.literal("")),
  contactTitle: z.string().optional().or(z.literal("")),
  newsletterButtonText: z.string().optional().or(z.literal("")),
  newsletterPlaceholder: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  quickLinks: z.array(MenuItemSchema).optional(),
  legalLinks: z.array(z.object({
    label: z.string().min(1, "Eticheta este obligatorie"),
    url: z.string().min(1, "URL-ul este obligatoriu"),
  })).optional(),
})

export const ChartItemSchema = z.object({
  label: z.string().min(1, "Numele este obligatoriu"),
  v1: z.coerce.number().min(0),
  v2: z.coerce.number().min(0),
  v3: z.coerce.number().min(0),
})

export const ChartContentSchema = z.object({
  legend1: z.string().optional().or(z.literal("")),
  legend2: z.string().optional().or(z.literal("")),
  legend3: z.string().optional().or(z.literal("")),
  items: z.array(ChartItemSchema)
})

export const ConsultationContentSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  buttonText: z.string().optional().or(z.literal("")),
  consultationTime: z.string().optional().or(z.literal("")),
  consultationLiveText: z.string().optional().or(z.literal("")),
  consultationFreeText: z.string().optional().or(z.literal("")),
  feature1: z.string().optional().or(z.literal("")),
  feature2: z.string().optional().or(z.literal("")),
  feature3: z.string().optional().or(z.literal("")),
  videoCallImage: z.string().optional().or(z.literal("")),
  doctorImage: z.string().optional().or(z.literal("")),
})

export const TelegramSettingsSchema = z.object({
  botToken: z.string().min(10, "Token-ul bot-ului este obligatoriu"),
  webhookUrl: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(false),
})

export const TelegramUserSchema = z.object({
  telegramUserId: z.string().min(1, "ID-ul Telegram este obligatoriu"),
  label: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
})
