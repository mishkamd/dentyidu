import * as Sentry from "@sentry/nextjs"
import { prisma } from "@/lib/prisma"

type LogMeta = {
  details?: string
  ipAddress?: string
  userAgent?: string
  userId?: string
}

function writeToDb(level: string, event: string, message: string, meta?: LogMeta) {
  prisma.securityLog
    .create({
      data: { level, event, message, ...meta },
    })
    .catch(() => {})
}

export const log = {
  info(event: string, message: string, meta?: LogMeta) {
    writeToDb("info", event, message, meta)
    Sentry.addBreadcrumb({ category: event, message, level: "info" })
  },

  warn(event: string, message: string, meta?: LogMeta) {
    writeToDb("warning", event, message, meta)
    Sentry.addBreadcrumb({ category: event, message, level: "warning" })
  },

  error(event: string, message: string, error?: unknown, meta?: LogMeta) {
    writeToDb("error", event, message, {
      ...meta,
      details: meta?.details ?? (error instanceof Error ? error.stack : String(error ?? "")),
    })
    if (error instanceof Error) {
      Sentry.captureException(error, { tags: { event } })
    } else {
      Sentry.captureMessage(message, { level: "error", tags: { event } })
    }
  },

  critical(event: string, message: string, error?: unknown, meta?: LogMeta) {
    writeToDb("critical", event, message, {
      ...meta,
      details: meta?.details ?? (error instanceof Error ? error.stack : String(error ?? "")),
    })
    if (error instanceof Error) {
      Sentry.captureException(error, { level: "fatal", tags: { event } })
    } else {
      Sentry.captureMessage(message, { level: "fatal", tags: { event } })
    }
  },
}
