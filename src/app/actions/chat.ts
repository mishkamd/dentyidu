'use server'

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join, basename } from "path"
import { log } from "@/lib/logger"
import { getServerT } from "@/lib/locale-server"

// Constants for validation
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
]

export interface ChatAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number | null
}

export interface ChatReaction {
  id: string
  emoji: string
  userId: string
  user: {
    name: string | null
    email: string
  }
}

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  receiverId: string | null
  createdAt: Date
  sender: {
    name: string | null
    email: string
  }
  receiver?: {
    name: string | null
    email: string
  } | null
  attachments: ChatAttachment[]
  reactions: ChatReaction[]
}

export interface ChatUser {
  id: string
  name: string | null
  email: string
  role: string
  lastSeen: Date | null
}

export async function getUsers(): Promise<ChatUser[]> {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return []

  const users = await prisma.admin.findMany({
    where: {
      id: { not: currentAdmin.id },
      active: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      lastSeen: true
    }
  })

  return users
}

export async function heartbeat() {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return

  await prisma.admin.update({
    where: { id: currentAdmin.id },
    data: { lastSeen: new Date() }
  })
}

export async function getMessages(receiverId?: string): Promise<ChatMessage[]> {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) return []
  
  let whereClause: Prisma.MessageWhereInput = {}

  if (receiverId) {
    // Private chat: (Me -> You) OR (You -> Me)
    whereClause = {
      OR: [
        { senderId: currentAdmin.id, receiverId: receiverId },
        { senderId: receiverId, receiverId: currentAdmin.id }
      ]
    }
  } else {
    // Group chat: receiverId is null
    whereClause = {
      receiverId: null
    }
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: {
          name: true,
          email: true
        }
      },
      receiver: {
        select: {
          name: true,
          email: true
        }
      },
      attachments: true,
      reactions: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    },
    take: 100
  })

  return messages
}

export async function sendMessage(content: string, receiverId?: string, attachments: { fileName: string, fileUrl: string, fileType: string, fileSize?: number }[] = []) {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    const t = await getServerT()
    throw new Error(t('action.common.unauthorized', 'Unauthorized'))
  }

  if (!content.trim() && attachments.length === 0) return

  const t = await getServerT()

  await prisma.message.create({
    data: {
      content,
      senderId: currentAdmin.id,
      receiverId: receiverId || null,
      attachments: {
        create: attachments.map(att => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize
        }))
      }
    }
  })

  // Create notifications
  const notificationTitle = receiverId ? t('action.chat.newPrivateMessage', 'Mesaj nou') : t('action.chat.newGroupMessage', 'Mesaj nou în grup')
  const notificationMessage = `${currentAdmin.name || currentAdmin.email}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
  
  if (receiverId) {
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: notificationTitle,
        message: notificationMessage,
        type: "MESSAGE",
        link: "/admin/leads"
      }
    })
  } else {
    // Notify all other active admins
    const users = await prisma.admin.findMany({
      where: {
        id: { not: currentAdmin.id },
        active: true
      },
      select: { id: true }
    })

    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map(u => ({
          userId: u.id,
          title: notificationTitle,
          message: notificationMessage,
          type: "MESSAGE",
          link: "/admin/leads"
        }))
      })
    }
  }

  revalidatePath('/admin/leads')
}

export async function deleteAttachment(attachmentId: string) {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    const t = await getServerT()
    throw new Error(t('action.common.unauthorized', 'Unauthorized'))
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { message: true }
  })

  if (!attachment) return

  // Verify ownership: either the sender of the message or the admin (if we allow admins to delete any file)
  // For now, let's allow if the user is the sender.
  if (attachment.message.senderId !== currentAdmin.id) {
    // Optionally check if user is super admin etc.
    // throw new Error("Unauthorized to delete this attachment")
  }

  // Delete from database
  await prisma.attachment.delete({
    where: { id: attachmentId }
  })

  // Delete file from disk
  try {
    const fileName = attachment.fileUrl.split('/').pop()
    if (fileName) {
        // Sanitize filename to prevent directory traversal
        const safeFileName = basename(fileName)
        const filePath = join(process.cwd(), 'public', 'uploads', safeFileName)
        await unlink(filePath)
    }
  } catch (error) {
    log.error('chat_file_delete_error', `Failed to delete file for attachment ${attachmentId}`, error)
    // Don't throw error here as DB deletion was successful
  }

  revalidatePath('/admin/leads')
}

export async function uploadFile(formData: FormData) {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    const t = await getServerT()
    throw new Error(t('action.common.unauthorized', 'Unauthorized'))
  }

  const file = formData.get('file') as File
  if (!file) {
    const t = await getServerT()
    throw new Error(t('action.chat.noFile', 'No file uploaded'))
  }

  // Validation
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error("File type not allowed")
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Ensure uploads directory exists
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch {
    // Ignore error if directory exists
  }

  // Generate unique filename with better sanitization
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${uniqueSuffix}-${safeName}`
  
  // Verify path is within uploads directory (prevent traversal)
  const filepath = join(uploadDir, filename)
  if (!filepath.startsWith(uploadDir)) {
      throw new Error("Invalid filename")
  }

  await writeFile(filepath, buffer)

  return {
    url: `/uploads/${filename}`,
    name: file.name,
    type: file.type,
    size: file.size
  }
}

export async function toggleReaction(messageId: string, emoji: string) {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    const t = await getServerT()
    throw new Error(t('action.common.unauthorized', 'Unauthorized'))
  }

  const existingReaction = await prisma.reaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId: currentAdmin.id,
        emoji
      }
    }
  })

  if (existingReaction) {
    await prisma.reaction.delete({
      where: {
        id: existingReaction.id
      }
    })
  } else {
    await prisma.reaction.create({
      data: {
        messageId,
        userId: currentAdmin.id,
        emoji
      }
    })
  }

  revalidatePath('/admin/leads')
}
