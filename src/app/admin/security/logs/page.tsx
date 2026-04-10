import { getCurrentAdmin } from "@/lib/get-current-admin"
import { redirect } from "next/navigation"
import { SecurityLogsClient } from "./logs-client"
import { getSecurityLogs, getSecurityLogStats } from "@/app/actions/security-logs"
import { getSentrySettings } from "@/app/actions/sentry-settings"
import { SecurityNav } from "../security-nav"

export const dynamic = 'force-dynamic'

export default async function SecurityLogsPage() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') redirect('/admin')

  const [logs, stats, sentry] = await Promise.all([
    getSecurityLogs({ limit: 100 }),
    getSecurityLogStats(),
    getSentrySettings(),
  ])

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">Securitate</p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Loguri Securitate
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Vizualizează evenimente, erori și activitate.</p>
      </header>
      <SecurityNav />
      <SecurityLogsClient
        initialLogs={JSON.parse(JSON.stringify(logs))}
        initialStats={stats || { total: 0, errors: 0, warnings: 0, critical: 0 }}
        initialSentry={sentry ? {
          dsn: sentry.dsn,
          authToken: sentry.authToken,
          isEnabled: sentry.isEnabled,
        } : { dsn: "", authToken: "", isEnabled: false }}
      />
    </div>
  )
}
