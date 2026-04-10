'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, AlertCircle, Info, ShieldAlert, Trash2, RefreshCw, ExternalLink, Eye, EyeOff, ChevronDown, ChevronUp, Radar, Key } from "lucide-react"
import { toast } from "sonner"
import { getSecurityLogs, getSecurityLogStats, cleanupOldLogs, deleteAllSecurityLogs } from "@/app/actions/security-logs"
import { updateSentrySettings } from "@/app/actions/sentry-settings"

type Log = {
  id: string
  level: string
  event: string
  message: string
  details?: string | null
  ipAddress?: string | null
  userId?: string | null
  createdAt: string
}

type Stats = { total: number; errors: number; warnings: number; critical: number }

type SentryConfig = {
  dsn: string
  authToken: string
  isEnabled: boolean
}

const levelConfig: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  critical: { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-600/10" },
}

export function SecurityLogsClient({ initialLogs, initialStats, initialSentry }: { initialLogs: Log[]; initialStats: Stats; initialSentry: SentryConfig }) {
  const [logs, setLogs] = useState(initialLogs)
  const [stats, setStats] = useState(initialStats)
  const [levelFilter, setLevelFilter] = useState("all")
  const [isPending, startTransition] = useTransition()

  // Sentry settings state
  const [sentryOpen, setSentryOpen] = useState(false)
  const [dsn, setDsn] = useState(initialSentry.dsn)
  const [authToken, setAuthToken] = useState(initialSentry.authToken)
  const [isEnabled, setIsEnabled] = useState(initialSentry.isEnabled)
  const [showToken, setShowToken] = useState(false)

  function refresh() {
    startTransition(async () => {
      const filter = levelFilter === "all" ? undefined : levelFilter
      const [newLogs, newStats] = await Promise.all([
        getSecurityLogs({ level: filter, limit: 100 }),
        getSecurityLogStats(),
      ])
      setLogs(JSON.parse(JSON.stringify(newLogs)))
      if (newStats) setStats(newStats)
    })
  }

  function handleCleanup() {
    startTransition(async () => {
      const result = await cleanupOldLogs(30)
      if (result.success) {
        toast.success(result.message)
        refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleDeleteAll() {
    if (!confirm("Sigur vrei să ștergi toate logurile?")) return
    startTransition(async () => {
      const result = await deleteAllSecurityLogs()
      if (result.success) {
        toast.success(result.message)
        setLogs([])
        setStats({ total: 0, errors: 0, warnings: 0, critical: 0 })
      } else {
        toast.error(result.message)
      }
    })
  }

  const filteredLogs = levelFilter === "all" ? logs : logs.filter(l => l.level === levelFilter)

  function handleSaveSentry() {
    const fd = new FormData()
    fd.set("dsn", dsn)
    fd.set("authToken", authToken)
    fd.set("isEnabled", String(isEnabled))
    startTransition(async () => {
      const result = await updateSentrySettings(fd)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <div className="space-y-6">
      {/* Sentry Settings */}
      <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-xl">
        <button
          type="button"
          onClick={() => setSentryOpen(!sentryOpen)}
          className="w-full flex items-center gap-3 p-4 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Radar className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-zinc-900 dark:text-white">Configurare Sentry</p>
            <p className="text-xs text-zinc-500">Monitorizare erori și performanță</p>
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${isEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
            {isEnabled ? 'Activ' : 'Inactiv'}
          </span>
          {sentryOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>
        {sentryOpen && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Activează Sentry</Label>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sentryDsn" className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-zinc-400" /> DSN
              </Label>
              <Input
                id="sentryDsn"
                value={dsn}
                onChange={(e) => setDsn(e.target.value)}
                placeholder="https://xxx@xxx.ingest.sentry.io/xxx"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sentryToken" className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-zinc-400" /> Auth Token
                <span className="text-[10px] text-zinc-400 font-normal">(opțional, pentru source maps)</span>
              </Label>
              <div className="relative">
                <Input
                  id="sentryToken"
                  type={showToken ? "text" : "password"}
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="sntrys_xxx"
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 rounded-lg p-3 text-xs text-purple-700 dark:text-purple-300">
              <p className="font-medium mb-1">Informații:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>DSN-ul se găsește în Sentry → Settings → Client Keys</li>
                <li>Auth Token este necesar doar pentru upload source maps la build</li>
                <li>După salvare, restart server pentru a activa pe server-side</li>
              </ul>
            </div>
            <Button onClick={handleSaveSentry} disabled={isPending} className="w-full">
              {isPending ? "Se salvează..." : "Salvează Setări Sentry"}
            </Button>
          </div>
        )}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Erori", value: stats.errors, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Avertismente", value: stats.warnings, icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Critice", value: stats.critical, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-600/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-xs text-zinc-500 font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Nivel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isPending}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {isEnabled && dsn && (
            <Button variant="outline" size="sm" asChild>
              <a href="https://sentry.io" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Sentry
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCleanup} disabled={isPending}>
            Curăță {'>'} 30 zile
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteAll} disabled={isPending}>
            <Trash2 className="w-4 h-4 mr-2" /> Șterge Tot
          </Button>
        </div>
      </div>

      {/* Logs */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Info className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Niciun log găsit.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const cfg = levelConfig[log.level] || levelConfig.info
            const Icon = cfg.icon
            return (
              <div key={log.id} className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold uppercase ${cfg.color}`}>{log.level}</span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{log.event}</span>
                    <span className="text-[10px] text-zinc-400 ml-auto">
                      {new Date(log.createdAt).toLocaleString('ro-RO')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">{log.message}</p>
                  {log.details && (
                    <pre className="text-[11px] text-zinc-500 mt-1 font-mono bg-zinc-50 dark:bg-zinc-800/50 rounded p-2 overflow-x-auto">{log.details}</pre>
                  )}
                  {log.ipAddress && <span className="text-[10px] text-zinc-400 mt-1 inline-block">IP: {log.ipAddress}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
