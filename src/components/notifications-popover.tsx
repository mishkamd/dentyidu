'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getNotifications, markAsRead, markAllAsRead, deleteAllNotifications } from '@/app/actions/notifications'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/language-provider'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  type: string
  link?: string | null
}


export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { t } = useLanguage()

  function timeAgo(date: Date | string) {
    const d = new Date(date)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (seconds < 60) return t('notifications.justNow', 'chiar acum')
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} ${t('notifications.minutesAgo', 'min în urmă')}`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ${t('notifications.hoursAgo', 'ore în urmă')}`
    const days = Math.floor(hours / 24)
    return `${days} ${t('notifications.daysAgo', 'zile în urmă')}`
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications()
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleMarkAsRead = async (notification: Notification) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    await markAsRead(notification.id)

    if (notification.link) {
      setIsOpen(false)
      router.push(notification.link)
    }
  }

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    await markAllAsRead()
  }

  const handleDeleteAll = async () => {
    setNotifications([])
    setUnreadCount(0)
    await deleteAllNotifications()
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-[42px] md:h-[42px] rounded-[14px] flex items-center justify-center text-[#64748b] hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-[#f8fafc] hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all border border-transparent shadow-sm relative"
      >
        <Bell className="w-5 h-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.8} />
        <span className="sr-only">{t('notifications.title', 'Notificări')}</span>
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 h-[9px] w-[9px] rounded-full bg-red-500 border-[1.5px] border-white dark:border-zinc-900 shadow-sm" />
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-x-0 top-16 mx-auto w-80 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mx-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">{t('notifications.title', 'Notificări')}</h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  
                  className="h-auto px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                  onClick={handleMarkAllAsRead}
                >
                  {t('notifications.markAll', 'Marchează tot')}
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  
                  className="h-auto px-2 py-0.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={handleDeleteAll}
                >
                  {t('notifications.deleteAll', 'Șterge tot')}
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                {t('notifications.empty', 'Nu ai notificări noi')}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative group",
                      !notification.read && "bg-emerald-50/30 dark:bg-emerald-500/5"
                    )}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    )}
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          !notification.read ? "bg-emerald-500" : "bg-gray-300 dark:bg-zinc-700"
                        )} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={cn(
                          "text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium pt-1">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
            <Button variant="ghost" className="w-full text-xs h-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              {t('notifications.viewAll', 'Vezi toate notificările')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
