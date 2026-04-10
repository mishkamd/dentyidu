import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck, Check, Calendar, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"

export const revalidate = 60 // Revalidate every 60 seconds

import type { Metadata } from "next"
import { getBlogContentWithDefaults, getBlogContentForLocaleWithFallback } from "@/lib/content"
import { getServerLocale } from "@/lib/locale-server"
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Cazuri Clinice & Transformări Reale",
  description: "Vezi rezultatele pacienților noștri — implanturi dentare, fațete, coroane zirconiu. Fotografii înainte și după tratament la DentyMD Chișinău.",
  openGraph: {
    title: "Cazuri Clinice | DentyMD",
    description: "Transformări reale ale pacienților — fotografii înainte și după tratament dentar în Chișinău.",
    url: `${SITE_URL}/blog`,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "DentyMD - Cazuri Clinice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cazuri Clinice | DentyMD",
    description: "Transformări reale ale pacienților — fotografii înainte și după tratament dentar în Chișinău.",
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
}

export default async function BlogPage() {
  const locale = await getServerLocale()
  const blogContent = await getBlogContentForLocaleWithFallback(locale)

  const blogPosts = blogContent.items.map(item => ({
      ...item,
      tags: item.tags || "",
      warrantyTitle: item.warrantyTitle || "Garanție DentyMD",
      warrantyPoints: item.warrantyPoints || "Certificat de garanție internațional,Pașaport implantologic inclus,Control periodic gratuit"
  }))

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">{blogContent?.sectionTitle || "Transformări Reale"}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {blogContent?.sectionDescription || "Vezi rezultatele pacienților noștri și convinge-te de calitatea serviciilor."}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => {
            const isComparison = post.type === 'COMPARISON' || (!post.type && post.imageAfter);
            
            return (
            <Dialog key={i}>
              <DialogTrigger asChild>
                <div className="group relative rounded-3xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer">
                  <div className="h-64 w-full relative">
                    {isComparison ? (
                      <div className="grid grid-cols-2 h-full w-full">
                        <div className="relative h-full border-r border-border">
                          <Image 
                            src={post.imageBefore} 
                            alt={`${post.title} - înainte de tratament`} 
                            fill 
                            className="object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded">BEFORE</div>
                        </div>
                        <div className="relative h-full">
                          <Image 
                            src={post.imageAfter} 
                            alt={`${post.title} - după tratament`} 
                            fill 
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded">AFTER</div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full w-full">
                        <Image 
                          src={post.image || post.imageBefore} 
                          alt={post.title} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {post.videoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-lg">
                              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">{post.tags}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">{post.description}</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border">
                <div className="flex flex-col md:grid md:grid-cols-2 h-[85vh] md:h-[600px] overflow-y-auto md:overflow-hidden">
                  {/* Left side: Images */}
                  <div className="relative min-h-[350px] sm:min-h-[450px] md:min-h-0 md:h-full bg-black/5 border-b md:border-b-0 md:border-r border-border shrink-0">
                    {isComparison ? (
                      <div className="absolute inset-0 flex flex-col">
                        <div className="relative flex-1 border-b border-border/50 group overflow-hidden">
                          <Image src={post.imageBefore} alt="Before" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                            SITUAȚIA INIȚIALĂ
                          </div>
                        </div>
                        <div className="relative flex-1 group overflow-hidden">
                          <Image src={post.imageAfter} alt="After" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-6 left-6 bg-primary/90 backdrop-blur-md text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">
                            REZULTAT FINAL
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-black">
                        {post.videoUrl ? (
                           <iframe 
                             src={post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') 
                               ? post.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                               : post.videoUrl} 
                             className="w-full h-full object-cover" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                           />
                        ) : (
                           <Image src={post.image || post.imageBefore} alt={post.title} fill className="object-cover" />
                        )}
                      </div>
                    )}
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
                    
                    <DialogTitle className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-foreground">{post.title}</DialogTitle>
                    
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
                      <Link href="/#contact" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:translate-y-[-2px]">
                        Vreau o consultație
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            )
          })}
        </div>
      </div>
      <Footer />
    </main>
  )
}


