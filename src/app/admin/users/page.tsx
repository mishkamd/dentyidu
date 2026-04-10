import { getCurrentAdmin } from "@/lib/get-current-admin"
import { prisma } from "@/lib/prisma"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { redirect } from "next/navigation"
import { CreateUserForm } from "@/components/create-user-form"
import { DeleteUserButton } from "@/components/delete-user-button"
import { ManageUserDialog } from "@/components/manage-user-dialog"
import { StatusBadge } from "@/components/ui/StatusBadge"

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    redirect('/admin')
  }

  const users = await prisma.admin.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      clinicId: true,
    }
  })

  const clinics = await prisma.clinic.findMany({
    select: {
      id: true,
      name: true,
    }
  })

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">
          {t["admin.users.subtitle"] || "Administrare"}
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t["admin.users.title"] || "User Control"}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <h2 className="text-lg text-zinc-900 dark:text-white font-medium tracking-tight">{t["admin.users.existingUsers"] || "Utilizatori existenți"}</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/5">
                    <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Acțiuni</th>
                    <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Nume</th>
                    <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</th>
                    <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Rol</th>
                    <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Data creării</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className={`group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${!user.active ? "opacity-60 bg-gray-50/50" : ""}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <ManageUserDialog user={user} clinics={clinics} />
                          {user.id !== currentAdmin.id && (
                            <DeleteUserButton userId={user.id} />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-zinc-900 dark:text-white">{user.name || <span className="text-zinc-400 italic font-normal">Fără nume</span>}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                          {user.email}
                          {!user.active && (
                            <StatusBadge status="inactive" className="text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-tighter">Inactiv</StatusBadge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={user.role === 'ADMIN' ? 'error' : user.role === 'DENTIST' ? 'info' : 'active'} className="text-[10px] font-bold tracking-tighter uppercase px-2.5 py-0.5">
                          {user.role}
                        </StatusBadge>
                      </td>
                      <td className="py-4 px-6 text-zinc-500 text-xs font-medium">
                        {new Date(user.createdAt).toLocaleDateString('ro-RO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-8 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                </div>
                <h2 className="text-lg text-zinc-900 dark:text-white font-medium tracking-tight">Adaugă utilizator nou</h2>
              </div>
            </div>
            <div className="p-6">
              <CreateUserForm clinics={clinics} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
