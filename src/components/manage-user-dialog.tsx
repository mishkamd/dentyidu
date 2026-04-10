"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Check, X, Eye, EyeOff, Save, Shield } from "lucide-react"
import { toggleUserStatus, resetUserPassword, updateUserName, updateUserRole, updateUserClinic } from "@/app/actions/users"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

interface ManageUserDialogProps {
  user: {
    id: string
    name: string | null
    email: string
    active: boolean
    role: string
    clinicId: string | null
  }
  clinics: {
    id: string
    name: string
  }[]
}

export function ManageUserDialog({ user, clinics }: ManageUserDialogProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(user.name || "")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState(user.role)

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setMessageType(null)
    const result = await updateUserName(user.id, name)
    setMessage(result.message || "")
    setMessageType(result.success ? "success" : "error")
    if (result.success) {
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true)
    setMessage("")
    setMessageType(null)
    setRole(newRole)
    const result = await updateUserRole(user.id, newRole)
    setMessage(result.message || "")
    setMessageType(result.success ? "success" : "error")
    if (result.success) {
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (value: string) => {
    setIsLoading(true)
    setMessage("")
    setMessageType(null)
    const active = value === "active"
    const result = await toggleUserStatus(user.id, active)
    setMessage(result.message || "")
    setMessageType(result.success ? "success" : "error")
    if (result.success) {
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleClinicChange = async (value: string) => {
    setIsLoading(true)
    setMessage("")
    setMessageType(null)
    const clinicId = value === "none" ? null : value
    const result = await updateUserClinic(user.id, clinicId)
    setMessage(result.message || "")
    setMessageType(result.success ? "success" : "error")
    if (result.success) {
      router.refresh()
    }
    setIsLoading(false)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword) return

    setIsLoading(true)
    setMessage("")
    setMessageType(null)
    const result = await resetUserPassword(user.id, newPassword)
    setMessage(result.message || "")
    setMessageType(result.success ? "success" : "error")
    if (result.success) {
      setNewPassword("")
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:text-zinc-400 dark:hover:text-emerald-400 transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">{t("user.manage", "Gestionează")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/5 shadow-2xl shadow-emerald-900/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
            <div className="flex flex-col">
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">{t("user.manageDialog.title", "Gestionează utilizator")}</DialogTitle>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{user.email}</div>
            </div>
          </div>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 pt-2 pl-4">
            {t("user.manageDialog.description", "Modifică permisiunile, numele sau resetează parola utilizatorului.")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {message && (
            <div className={`text-sm p-2 rounded ${messageType === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
              {message}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-zinc-500 dark:text-zinc-400 font-medium">{t("form.name", "Nume")}</Label>
            <form onSubmit={handleNameUpdate} className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("user.manageDialog.namePlaceholder", "Nume utilizator...")}
                className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
              <Button type="submit" disabled={isLoading} size="icon" variant="admin_secondary">
                <Save className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-500 dark:text-zinc-400 font-medium">{t("user.manageDialog.role", "Rol Utilizator")}</Label>
              <Select
                defaultValue={user.role}
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:ring-emerald-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/5">
                  <SelectItem value="ADMIN" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-400" />
                      <span>ADMIN</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="MANAGER" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <span>MANAGER</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="DENTIST" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span>DENTIST</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-500 dark:text-zinc-400 font-medium">{t("user.manageDialog.accountStatus", "Status Cont")}</Label>
              <Select
                defaultValue={user.active ? "active" : "inactive"}
                onValueChange={handleStatusChange}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:ring-emerald-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/5">
                  <SelectItem value="active" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>{t("status.active", "Activ")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span>{t("status.inactive", "Inactiv")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {role === "DENTIST" && (
            <div className="space-y-2 transition-all duration-300">
              <Label className="text-zinc-500 dark:text-zinc-400 font-medium">{t("user.manageDialog.assignedClinic", "Clinică Asignată")}</Label>
              <Select
                defaultValue={user.clinicId || "none"}
                onValueChange={handleClinicChange}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:ring-emerald-500/20">
                  <SelectValue placeholder={t("user.manageDialog.selectClinic", "Selectează clinica")} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/5">
                  <SelectItem value="none" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">{t("ui.noClinicAssigned", "Fără clinică")}</span>
                    </div>
                  </SelectItem>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id} className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>{clinic.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-white/10">
            <Label className="text-zinc-500 dark:text-zinc-400 font-medium">{t("user.manageDialog.passwordReset", "Resetare Parolă")}</Label>
            <form onSubmit={handlePasswordReset} className="flex flex-col gap-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("user.manageDialog.newPasswordPlaceholder", "Noua parolă...")}
                  minLength={6}
                  className="pr-10 bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="admin_primary" size="admin_pill"
                type="submit"
                disabled={!newPassword || isLoading}
                className="w-full h-10"
              >
                {isLoading ? t("user.manageDialog.resettingPassword", "Se resetează...") : t("user.manageDialog.resetPassword", "Resetează Parola")}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
