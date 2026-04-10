import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123'
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn('⚠️  WARNING: Using default seed password. Set SEED_ADMIN_PASSWORD env var for production.')
  }
  const password = await hash(seedPassword, 12)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@dentymd.md' },
    update: {
      role: 'ADMIN'
    },
    create: {
      email: 'admin@dentymd.md',
      password,
      role: 'ADMIN',
    },
  })
  console.log({ admin })

  // Seed Content
  const heroContent = {
    title: "Zâmbetul Perfect\nLa Prețuri Corecte",
    subtitle: "Tratamente stomatologice de top în Chișinău. Economisește până la 70% față de Europa de Vest, folosind materiale premium și tehnologie de ultimă oră.",
    whatsappLink: "https://wa.me/40700000000",
    button1Text: "Solicită Ofertă",
    button2Text: "Contactează pe WhatsApp",
    responseTimeText: "Răspundem în maxim 2 ore.",
    badge1Title: "Transport & Cazare",
    badge1Description: "Inclus în pachetele \n premium",
    badge2Title: "Garanție UE",
    badge2Description: "Materiale certificate \n internațional",
    card1Text: "Pacienți",
    card1Subtext: "Mulțumiți",
    card2Title: "70%",
    card2Description: "Economie față de clinicile din Vest"
  }

  const pricesContent = {
    sectionTitle: "Soluții dentare complete la standarde europene",
    sectionDescription: "TRATAMENTE & COSTURI",
    consultationTime: "12:45 PM",
    consultationLiveText: "Consultație Live",
    consultationTitle: "Evaluare Online",
    consultationDescription: "Trimite radiografia ta și primește un plan de tratament estimativ în 24 de ore, înainte de a călători.",
    consultationButtonText: "Plan Tratament",
    consultationFreeText: "100% Gratuit",
    items: [
      { 
        title: "Implant Dentar Premium", 
        price: "350", 
        oldPrice: "1200", 
        description: "Include bont protetic și garanție."
      },
      { 
        title: "Fațete E-MAX", 
        price: "280", 
        oldPrice: "800", 
        description: "Estetică superioară, minim invaziv."
      },
      { 
        title: "Coroană Zirconiu", 
        price: "180", 
        oldPrice: "550", 
        description: "Design digital CAD/CAM."
      },
      { 
        title: "All-on-4 / All-on-6", 
        price: "3500", 
        oldPrice: "12000", 
        description: "Reabilitare totală a maxilarului."
      },
    ]
  }

  const blogContent = {
    sectionTitle: "Blog & Galerie",
    sectionDescription: "Zâmbete transformate",
    introText: "De 5.000 de ori ne-am auzit pacienții spunând că le-am schimbat viața. Iată câteva dintre poveștile lor.",
    items: [
      {
        title: "Reabilitare totală maxilar",
        description: "Implanturi All-on-6 • Coroane Zirconiu • Durată: 5 zile",
        imageBefore: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&h=400&fit=crop",
        imageAfter: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=500&h=400&fit=crop",
        tags: "Implanturi, Zirconiu",
        isFavorite: true,
        type: "COMPARISON"
      },
      {
        title: "Fațete Dentare E-max",
        description: "20 Fațete • Smile Design • Durată: 3 vizite",
        imageBefore: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=500&h=400&fit=crop",
        imageAfter: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=500&h=400&fit=crop",
        tags: "Fațete, Estetică",
        isFavorite: true,
        type: "COMPARISON"
      }
    ]
  }

  const contactContent = {
    sectionTitle: "Contactează-ne",
    sectionDescription: "Email, sună sau completează formularul pentru a afla cum te putem ajuta să obții zâmbetul perfect.",
    phone: "+373 60 000 000",
    email: "info@clinica.md",
    address: "Chișinău, Moldova",
    emailLabel: "Email",
    phoneLabel: "Telefon",
    addressLabel: "Adresă",
    supportTitle: "Suport Pacienți",
    supportDescription: "Echipa noastră este disponibilă non-stop.",
    feedbackTitle: "Feedback",
    feedbackDescription: "Părerea ta contează pentru noi.",
    pressTitle: "Presă",
    pressDescription: "Pentru întrebări media sau presă."
  }

  const processContent = {
    sectionTitle: "4 Pași Simpli către Noul Tău Zâmbet",
    subtitle: "CUM FUNCȚIONEAZĂ",
    sectionDescription: "Procesul nostru este optimizat pentru pacienții internaționali. Ne ocupăm de tot, de la aeroport la cazare și tratament.",
    items: [
      { title: "Trimite Radiografia", description: "Contactează-ne și trimite o radiografie panoramică recentă." },
      { title: "Plan & Ofertă", description: "Medicii noștri analizează cazul și îți trimit planul complet în 24h." },
      { title: "Călătoria", description: "Noi te ajutăm cu cazarea și transferul gratuit de la aeroport." },
      { title: "Tratament & Plimbare", description: "Rezolvăm tratamentul rapid și eficient, iar tu te bucuri de oraș." },
    ]
  }

  const commitmentContent = {
    title: "Angajamentul nostru pentru sănătatea ta orală",
    description: "Suntem dedicați nu doar tratării dinților, ci și îmbunătățirii calității vieții pacienților noștri. Folosim cele mai noi tehnologii stomatologice (CBCT, Scanner Intraoral, Microscop) pentru rezultate precise și durabile.",
    subtitle: "De ce noi?",
    statsTitle: "Rata succes 99%",
    statsDescription: "Implanturi inserate cu succes în ultimii 10 ani.",
    badgeTitle: "5 Zile",
    badgeDescription: "Pentru reabilitare totală",
    featuresTitle: "Servicii incluse gratuit:",
    features: "Transfer Aeroport - Hotel - Clinică, Tomografie Computerizată 3D, Asistență Turistică Dedicată"
  }

  const faqContent = {
    sectionTitle: "Întrebări Frecvente",
    items: [
      {
        question: "Cât durează tratamentul complet?",
        answer: "Majoritatea tratamentelor complexe (implanturi, fațete) necesită o vizită de 3-5 zile. Pentru implanturi, este necesară o a doua vizită după 4-6 luni pentru montarea coroanei definitive."
      },
      {
        question: "Cum se organizează transportul?",
        answer: "Echipa noastră te ajută să găsești cele mai bune zboruri spre Chișinău. Odată ajuns, șoferul clinicii te va aștepta la aeroport și te va duce gratuit la hotel și la clinică."
      },
      {
        question: "Există garanție pentru lucrări?",
        answer: "Absolut. Oferim garanție scrisă conform normelor UE: 10 ani pentru implanturi și 5 ani pentru lucrări protetice, cu condiția respectării igienei și a controalelor periodice."
      }
    ]
  }

  // Upsert all content
  await prisma.content.upsert({ where: { key_locale: { key: "hero", locale: "ro" } }, update: { value: JSON.stringify(heroContent) }, create: { key: "hero", locale: "ro", value: JSON.stringify(heroContent) } })
  await prisma.content.upsert({ where: { key_locale: { key: "prices", locale: "ro" } }, update: { value: JSON.stringify(pricesContent) }, create: { key: "prices", locale: "ro", value: JSON.stringify(pricesContent) } })
  await prisma.content.upsert({ where: { key_locale: { key: "blog", locale: "ro" } }, update: { value: JSON.stringify(blogContent) }, create: { key: "blog", locale: "ro", value: JSON.stringify(blogContent) } })
  await prisma.content.upsert({ where: { key_locale: { key: "contact", locale: "ro" } }, update: { value: JSON.stringify(contactContent) }, create: { key: "contact", locale: "ro", value: JSON.stringify(contactContent) } })
  await prisma.content.upsert({ where: { key_locale: { key: "process", locale: "ro" } }, update: { value: JSON.stringify(processContent) }, create: { key: "process", locale: "ro", value: JSON.stringify(processContent) } })
  await prisma.content.upsert({ where: { key_locale: { key: "commitment", locale: "ro" } }, update: { value: JSON.stringify(commitmentContent) }, create: { key: "commitment", locale: "ro", value: JSON.stringify(commitmentContent) } })
  await prisma.content.upsert({ where: { key_locale: { key: "faq", locale: "ro" } }, update: { value: JSON.stringify(faqContent) }, create: { key: "faq", locale: "ro", value: JSON.stringify(faqContent) } })

  console.log("Content seeded successfully")

  // Seed admin.settings.* translations (Telegram Settings page)
  const adminSettingsTranslations: Record<string, Record<string, string>> = {
    "admin.settings.title": { ro: "Setări Telegram Bot", en: "Telegram Bot Settings", fr: "Paramètres du Bot Telegram", it: "Impostazioni Bot Telegram" },
    "admin.settings.subtitle": { ro: "Configurare", en: "Configuration", fr: "Configuration", it: "Configurazione" },
    "admin.settings.botConfig": { ro: "Configurare Bot", en: "Bot Configuration", fr: "Configuration du Bot", it: "Configurazione Bot" },
    "admin.settings.botConfigDesc": { ro: "Token-ul și starea Telegram Bot-ului", en: "Telegram Bot token and status", fr: "Token et état du Bot Telegram", it: "Token e stato del Bot Telegram" },
    "admin.settings.botToken": { ro: "Bot Token", en: "Bot Token", fr: "Token du Bot", it: "Token Bot" },
    "admin.settings.webhookUrl": { ro: "URL Website (pentru Webhook)", en: "Website URL (for Webhook)", fr: "URL du site web (pour Webhook)", it: "URL del sito web (per Webhook)" },
    "admin.settings.webhookHint": { ro: "URL-ul public al site-ului. Webhook-ul va fi setat pe", en: "The public URL of the website. The webhook will be set on", fr: "L'URL public du site. Le webhook sera configuré sur", it: "L'URL pubblico del sito. Il webhook verrà impostato su" },
    "admin.settings.botActive": { ro: "Bot activ", en: "Bot active", fr: "Bot actif", it: "Bot attivo" },
    "admin.settings.saving": { ro: "Se salvează...", en: "Saving...", fr: "Enregistrement...", it: "Salvataggio..." },
    "admin.settings.saveBtn": { ro: "Salvează Setări", en: "Save Settings", fr: "Enregistrer les paramètres", it: "Salva Impostazioni" },
    "admin.settings.webhookSection": { ro: "Webhook & Conexiune", en: "Webhook & Connection", fr: "Webhook & Connexion", it: "Webhook & Connessione" },
    "admin.settings.webhookSectionDesc": { ro: "Setează webhook-ul și testează conexiunea cu Telegram", en: "Set the webhook and test the Telegram connection", fr: "Configurez le webhook et testez la connexion Telegram", it: "Imposta il webhook e testa la connessione con Telegram" },
    "admin.settings.testing": { ro: "Se testează...", en: "Testing...", fr: "Test en cours...", it: "Test in corso..." },
    "admin.settings.testBtn": { ro: "Testează Conexiunea", en: "Test Connection", fr: "Tester la connexion", it: "Testa Connessione" },
    "admin.settings.settingWebhook": { ro: "Se setează...", en: "Setting...", fr: "Configuration...", it: "Impostazione..." },
    "admin.settings.setWebhookBtn": { ro: "Setează Webhook", en: "Set Webhook", fr: "Configurer le Webhook", it: "Imposta Webhook" },
    "admin.settings.removeWebhookBtn": { ro: "Elimină Webhook", en: "Remove Webhook", fr: "Supprimer le Webhook", it: "Rimuovi Webhook" },
    "admin.settings.whitelistTitle": { ro: "Utilizatori Whitelist", en: "Whitelist Users", fr: "Utilisateurs autorisés", it: "Utenti Whitelist" },
    "admin.settings.whitelistDesc": { ro: "ID-urile Telegram care primesc alerte și pot controla bot-ul", en: "Telegram IDs that receive alerts and can control the bot", fr: "Les ID Telegram qui reçoivent les alertes et peuvent contrôler le bot", it: "Gli ID Telegram che ricevono avvisi e possono controllare il bot" },
    "admin.settings.telegramIdPlaceholder": { ro: "ID Telegram (ex: 123456789)", en: "Telegram ID (e.g.: 123456789)", fr: "ID Telegram (ex : 123456789)", it: "ID Telegram (es.: 123456789)" },
    "admin.settings.labelPlaceholder": { ro: "Etichetă (ex: Admin Principal)", en: "Label (e.g.: Main Admin)", fr: "Étiquette (ex : Admin Principal)", it: "Etichetta (es.: Admin Principale)" },
    "admin.settings.adding": { ro: "Se adaugă...", en: "Adding...", fr: "Ajout en cours...", it: "Aggiunta in corso..." },
    "admin.settings.addBtn": { ro: "Adaugă", en: "Add", fr: "Ajouter", it: "Aggiungi" },
    "admin.settings.deactivate": { ro: "Dezactivează", en: "Deactivate", fr: "Désactiver", it: "Disattiva" },
    "admin.settings.activate": { ro: "Activează", en: "Activate", fr: "Activer", it: "Attiva" },
    "admin.settings.delete": { ro: "Șterge", en: "Delete", fr: "Supprimer", it: "Elimina" },
    "admin.settings.noUsers": { ro: "Niciun utilizator adăugat.", en: "No users added.", fr: "Aucun utilisateur ajouté.", it: "Nessun utente aggiunto." },
    "admin.settings.howToGetId": { ro: "Cum obțineți ID-ul Telegram?", en: "How to get your Telegram ID?", fr: "Comment obtenir votre ID Telegram ?", it: "Come ottenere il tuo ID Telegram?" },
    "admin.settings.step1": { ro: "Deschideți Telegram și căutați @userinfobot", en: "Open Telegram and search for @userinfobot", fr: "Ouvrez Telegram et recherchez @userinfobot", it: "Apri Telegram e cerca @userinfobot" },
    "admin.settings.step2": { ro: "Trimiteți comanda /start", en: "Send the /start command", fr: "Envoyez la commande /start", it: "Invia il comando /start" },
    "admin.settings.step3": { ro: "Bot-ul vă va răspunde cu ID-ul dvs. numeric", en: "The bot will reply with your numeric ID", fr: "Le bot vous répondra avec votre ID numérique", it: "Il bot risponderà con il tuo ID numerico" },
  }

  for (const [key, locales] of Object.entries(adminSettingsTranslations)) {
    for (const [locale, value] of Object.entries(locales)) {
      await prisma.translation.upsert({
        where: { key_locale: { key, locale } },
        update: { value },
        create: { key, locale, value },
      })
    }
  }

  console.log("Admin settings translations seeded successfully")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
