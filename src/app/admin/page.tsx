import { prisma } from "@/lib/prisma"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  UserPlus,
  DollarSign,
  Users,
  Plane,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { startOfDay, endOfDay, format, startOfMonth } from "date-fns"

async function getDashboardData(currentAdmin: any) {
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())
  const currentMonthStart = startOfMonth(new Date())

  // ROLE-BASED DATA ACCESS LOGIC
  // 1. ADMIN / MANAGER -> Global Data (No filters)
  // 2. DENTIST -> Clinic Data (Filtered by clinicId)

  const isDentist = currentAdmin?.role === 'DENTIST';
  const clinicId = currentAdmin?.clinicId;

  let clinicFilter: any = {};
  let leadFilter: any = {};

  if (isDentist) {
    if (clinicId) {
      // Dentist sees only data related to their assigned clinic
      clinicFilter = { clinicId: clinicId };
      // Leads are visible to Dentist only if they are converted to patients in their clinic
      leadFilter = { patient: { clinicId: clinicId } };
    } else {
      // Safety: Dentist without clinic sees nothing instead of everything
      clinicFilter = { id: 'RESTRICTED_VIEW' };
      leadFilter = { id: 'RESTRICTED_VIEW' };
    }
  }
  // For ADMIN/MANAGER, filters remain empty {} (Global Access)

  try {
    const [
      totalLeads,
      newLeadsCount,
      wonLeadsCount,
      finalizedPatientsData,
      recentLeads,
      todayNewLeads,
      todayArrivals,
      recentPatients,
      totalPatients,
      finalizedPatientsMonth,
      invoiceData
    ] = await Promise.all([
      // Total Leads (For Dentist: only those with patients in their clinic)
      prisma.lead.count({ where: leadFilter }),

      // New Leads (For Dentist: created recently and assigned to their clinic)
      prisma.lead.count({ where: { ...leadFilter, status: "NOU" } }),

      // Won Leads (Finalized)
      prisma.lead.count({ where: { ...leadFilter, status: "FINALIZAT" } }),

      // Fetch finalized/arrived patients for revenue calculation
      prisma.patient.findMany({
        where: {
          ...clinicFilter,
          OR: [
            { arrivalDate: { gte: currentMonthStart } },
            { status: "FINALIZAT", updatedAt: { gte: currentMonthStart } }
          ]
        },
        include: { lead: true }
      }),

      // Recent Leads
      prisma.lead.findMany({
        where: leadFilter,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Leads created today
      prisma.lead.findMany({
        where: {
          ...leadFilter,
          createdAt: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Patients arriving today
      prisma.patient.findMany({
        where: {
          ...clinicFilter,
          arrivalDate: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        include: {
          hotel: true
        }
      }),

      // Recent Patients (Arrivals/Updates)
      prisma.patient.findMany({
        where: {
          ...clinicFilter,
          arrivalDate: { not: null }
        },
        orderBy: { arrivalDate: 'desc' },
        take: 5,
        include: {
          hotel: true,
          lead: true
        }
      }),

      // Total Patients
      prisma.patient.count({
        where: clinicFilter
      }),

      // Finalized Patients This Month
      prisma.patient.count({
        where: {
          ...clinicFilter,
          status: "FINALIZAT",
          updatedAt: {
            gte: currentMonthStart
          }
        }
      }),

      // Global Revenue from Invoices (for Admin/Manager)
      !isDentist ? prisma.invoice.aggregate({
        where: {
          date: { gte: currentMonthStart },
          status: { in: ['ISSUED', 'PAID', 'PARTIAL', 'OVERDUE', 'DRAFT'] }
        },
        _sum: { total: true }
      }) : Promise.resolve({ _sum: { total: 0 } })
    ])

    // Calculate revenue based on role
    let revenue = 0;

    if (isDentist) {
      // For Dentist: Calculate from finalized/arrived patients budgets
      revenue = finalizedPatientsData.reduce((acc, patient) => {
        if (!patient.lead?.budget) return acc
        const value = parseInt(patient.lead.budget.replace(/[^0-9]/g, '')) || 0
        return acc + value
      }, 0)
    } else {
      // For Admin/Manager: Use Global Invoice Revenue
      revenue = Number(invoiceData?._sum?.total) || 0;
    }

    const activeTreatments = totalLeads - wonLeadsCount // Rough calculation
    const arrivalsCount = todayArrivals.length

    // Enhance recent leads with real budget value if available
    const enhancedLeads = recentLeads.map(lead => ({
      ...lead,
      value: lead.budget ? parseInt(lead.budget.replace(/[^0-9]/g, '')) || 0 : 0
    }))

    return {
      totalLeads,
      newLeads: newLeadsCount,
      wonLeads: wonLeadsCount,
      recentLeads: enhancedLeads,
      revenue,
      activeTreatments,
      arrivals: arrivalsCount,
      todayNewLeads,
      todayArrivals,
      recentPatients,
      totalPatients,
      finalizedPatientsMonth
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      totalLeads: 0,
      newLeads: 0,
      wonLeads: 0,
      recentLeads: [],
      revenue: 0,
      activeTreatments: 0,
      arrivals: 0,
      todayNewLeads: [],
      todayArrivals: [],
      recentPatients: [],
      totalPatients: 0,
      finalizedPatientsMonth: 0
    }
  }
}

export default async function AdminDashboardPage() {
  const currentAdmin = await getCurrentAdmin()
  const {
    newLeads,
    recentLeads,
    revenue,
    arrivals,
    todayNewLeads,
    todayArrivals,
    recentPatients,
    totalPatients,
    finalizedPatientsMonth
  } = await getDashboardData(currentAdmin)

  // Format name from email if name is missing
  const displayName = currentAdmin?.name || (currentAdmin?.email ? currentAdmin.email.split('@')[0].split('.').map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ') : 'Doctore')

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  // Merge table items (Leads + Arrivals)
  // For Dentist, recentLeads might be empty if they don't see raw leads, 
  // so recentPatients is the main source of truth.
  const tableItems = [
    ...recentLeads.map(lead => ({
      id: lead.id,
      type: 'LEAD',
      name: lead.name,
      subtext: lead.email,
      description: lead.description || "Tratament General",
      status: lead.status,
      value: lead.value,
      date: lead.createdAt,
      data: lead
    })),
    ...recentPatients.map(patient => ({
      id: patient.id,
      type: 'ARRIVAL',
      name: patient.name,
      subtext: patient.hotel ? patient.hotel.name : 'Fără Cazare',
      description: patient.treatment,
      status: patient.status,
      value: patient.lead?.budget ? parseInt(patient.lead.budget.replace(/[^0-9]/g, '')) || 0 : 0,
      date: patient.arrivalDate!,
      data: patient
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7)

  // Merge and sort timeline items
  const timelineItems = [
    ...todayNewLeads.map(lead => ({
      id: lead.id,
      type: 'NEW_LEAD',
      time: format(lead.createdAt, 'HH:mm'),
      title: lead.name,
      subtitle: 'Pacient Nou',
      doctor: 'Sales', // Or 'Recepție'
      timestamp: new Date(lead.createdAt).getTime()
    })),
    ...todayArrivals.map(patient => ({
      id: patient.id,
      type: 'ARRIVAL',
      time: '14:00', // Default arrival time if not specified
      title: patient.name,
      subtitle: patient.hotel ? `Cazare: ${patient.hotel.name}` : 'Sosire Aeroport',
      doctor: 'Logistică',
      timestamp: new Date().setHours(14, 0, 0, 0)
    }))
  ].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <div className="space-y-8 pb-8">
      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Revenue Card */}
        <Link href="/admin/invoices" className="block h-full">
          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer h-full flex flex-col justify-between">
            <div className="flex items-center justify-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{t["admin.dashboard.revenueTitle"] || "Venituri Luna Asta"}</span>
            </div>
            <div>
              <div className="text-3xl font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">€{revenue.toLocaleString()}</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
                </span>
                <span className="text-xs text-zinc-400">{t["admin.dashboard.vsLastMonth"] || "vs luna trecută"}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* New Patients Card */}
        <Link href="/admin/patients" className="block h-full">
          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group h-full flex flex-col justify-between">
            <div className="flex items-center justify-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{t["admin.dashboard.newLeadsTitle"] || "Cereri Noi"}</span>
            </div>
            <div>
              <div className="text-3xl font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">{newLeads}</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> +8%
                </span>
                <span className="text-xs text-zinc-400">{t["admin.dashboard.fromCampaigns"] || "din campanii"}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Arrivals Card */}
        <Link href="/admin/calendar" className="block h-full">
          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer h-full flex flex-col justify-between">
            <div className="flex items-center justify-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Plane className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{t["admin.dashboard.arrivalsToday"] || "Sosiri Astăzi"}</span>
            </div>
            <div>
              <div className="text-3xl font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">{arrivals}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">{t["admin.dashboard.patientsExpected"] || "pacienți așteptați"}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Active Treatments Card */}
        <Link href="/admin/patients?tab=patients" className="block h-full">
          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer h-full flex flex-col justify-between">
            <div className="flex items-center justify-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{t["admin.dashboard.activePatients"] || "Pacienți Activi"}</span>
            </div>
            <div>
              <div className="text-3xl font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">{totalPatients}</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> {finalizedPatientsMonth}
                </span>
                <span className="text-xs text-zinc-400">{t["admin.dashboard.completedThisMonth"] || "finalizați luna asta"}</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Patients */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">{t["admin.dashboard.recentActivity"] || "Activitate Recentă"}</h2>
            <Button asChild variant="admin_secondary" size="admin_pill">
              <Link href="/admin/patients?tab=patients">{t["admin.dashboard.viewAll"] || "Vezi tot"}</Link>
            </Button>
          </div>

          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-400">{t["admin.dashboard.patient"] || "Pacient"}</th>
                    <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-400">{t["admin.dashboard.status"] || "Status"}</th>
                    <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-400">{t["admin.dashboard.treatment"] || "Tratament"}</th>
                    <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-400 text-right">{t["admin.dashboard.value"] || "Valoare"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                  {tableItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="w-[300px] max-w-[300px] px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border",
                            item.type === 'ARRIVAL'
                              ? "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                              : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                          )}>
                            {item.type === 'ARRIVAL' ? <Plane className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{item.name}</div>
                            {item.subtext && <div className="text-[11px] text-zinc-500 truncate mt-0.5">{item.subtext}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                          item.status === 'FINALIZAT'
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : item.status === 'IN_ASTEPTARE' || item.status === 'NOU'
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-zinc-500/10 text-zinc-600 border-zinc-500/20"
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">
                        {item.value > 0 ? `€${item.value}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Timeline / Today */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">{t["admin.dashboard.todaySchedule"] || "Program Azi"}</h2>
            <Button asChild variant="admin_secondary" size="icon">
              <Link href="/admin/calendar">
                <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </Button>
          </div>

          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="space-y-6">
              {timelineItems.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>{t["admin.dashboard.noEvents"] || "Niciun eveniment azi"}</p>
                </div>
              ) : (
                timelineItems.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== timelineItems.length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-100 dark:bg-white/5" />
                    )}
                    <div className={cn(
                      "relative z-10 w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center shrink-0",
                      item.type === 'ARRIVAL' ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {item.type === 'ARRIVAL' ? <Plane className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-zinc-900 dark:text-white">{item.title}</span>
                        <span className="text-xs text-zinc-500 font-mono">{item.time}</span>
                      </div>
                      <p className="text-sm text-zinc-500 mb-1">{item.subtitle}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                          {item.doctor}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
