import { Suspense } from "react"
import { LoginFormClient } from "./login-client"
import { getContent } from "@/lib/get-content"

export const metadata = {
  title: "Autentificare - DentyAdmin",
}

async function getBranding() {
  const content = await getContent("hero")
  
  if (!content?.value) return {}
  
  try {
    const data = JSON.parse(content.value)
    return {
      icon: data.icon as string | undefined,
      logo: data.logo as string | undefined,
      logoType: data.logoType as "image" | "text" | undefined,
    }
  } catch {
    return {}
  }
}

export default async function LoginPage() {
  const branding = await getBranding()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Suspense fallback={<div className="text-zinc-900 dark:text-white relative z-10">Se încarcă...</div>}>
        <div className="relative z-10 w-full flex justify-center px-4">
          <LoginFormClient branding={branding} />
        </div>
      </Suspense>
    </div>
  )
}
