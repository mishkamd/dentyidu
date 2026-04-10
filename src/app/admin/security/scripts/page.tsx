import { getCurrentAdmin } from "@/lib/get-current-admin"
import { redirect } from "next/navigation"
import { SecurityScriptsClient } from "./scripts-client"
import { getSecurityScripts } from "@/app/actions/security-scripts"
import { SecurityNav } from "../security-nav"

export const dynamic = 'force-dynamic'

export default async function SecurityScriptsPage() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') redirect('/admin')

  const scripts = await getSecurityScripts()

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">Securitate</p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Scripturi CSS / JS
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Adaugă cod CSS sau JavaScript personalizat pe pagina principală.</p>
      </header>
      <SecurityNav />
      <SecurityScriptsClient initialScripts={JSON.parse(JSON.stringify(scripts))} />
    </div>
  )
}
