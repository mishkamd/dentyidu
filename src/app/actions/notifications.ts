'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { revalidatePath } from "next/cache"
import { log } from "@/lib/logger"

export async function getNotifications() {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return []

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentAdmin.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    return notifications
  } catch (error) {
    log.error("notification_fetch_error", "Error fetching notifications", error)
    return []
  }
}

export async function markAsRead(id: string) {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return { success: false }

  try {
    await prisma.notification.update({
      where: {
        id,
        userId: currentAdmin.id
      },
      data: {
        read: true
      }
    })
    
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    log.error("notification_read_error", "Error marking notification as read", error)
    return { success: false }
  }
}

export async function markAllAsRead() {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return { success: false }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: currentAdmin.id,
        read: false
      },
      data: {
        read: true
      }
    })
    
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    log.error("notification_read_all_error", "Error marking all notifications as read", error)
    return { success: false }
  }
}

export async function deleteAllNotifications() {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return { success: false }

  try {
    await prisma.notification.deleteMany({
      where: {
        userId: currentAdmin.id
      }
    })
    
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    log.error("notification_delete_error", "Error deleting all notifications", error)
    return { success: false }
  }
}

export async function createNotification(data: {
  userId: string
  title: string
  message: string
  type?: string
  link?: string
}) {
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false }

  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        link: data.link
      }
    })
    return { success: true }
  } catch (error) {
    log.error("notification_create_error", "Error creating notification", error)
    return { success: false }
  }
}
