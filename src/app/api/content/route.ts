import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isValidLocale } from "@/lib/i18n"

/**
 * GET /api/content
 *
 * Query params:
 *   - locale (required): language code (ro, en, fr, etc.)
 *   - key (optional): specific content key (e.g. "hero", "prices")
 *
 * Returns:
 *   - If key provided: single content object { key, locale, value, updatedAt }
 *   - If no key: all content for locale as { [key]: parsedValue }
 *
 * Fallback: if content not found for requested locale, falls back to "ro".
 */
export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale")
  const key = request.nextUrl.searchParams.get("key")

  if (!locale || !isValidLocale(locale)) {
    return NextResponse.json(
      { error: "Missing or invalid locale parameter" },
      { status: 400 }
    )
  }

  // Single key fetch with fallback
  if (key) {
    const sanitizedKey = key.replace(/[^a-zA-Z0-9._-]/g, "")
    if (!sanitizedKey) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 })
    }

    let content = await prisma.content.findUnique({
      where: { key_locale: { key: sanitizedKey, locale } },
    })

    // Fallback to Romanian
    if (!content && locale !== "ro") {
      content = await prisma.content.findUnique({
        where: { key_locale: { key: sanitizedKey, locale: "ro" } },
      })
    }

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    let parsed
    try {
      parsed = JSON.parse(content.value)
    } catch {
      parsed = content.value
    }

    return NextResponse.json(
      {
        key: sanitizedKey,
        locale: content.locale,
        value: parsed,
        updatedAt: content.updatedAt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  }

  // Fetch all content for locale
  const rows = await prisma.content.findMany({
    where: { locale },
  })

  // Also load RO for fallback
  const roRows = locale !== "ro"
    ? await prisma.content.findMany({ where: { locale: "ro" } })
    : []

  const roMap = new Map<string, string>()
  for (const row of roRows) {
    roMap.set(row.key, row.value)
  }

  const result: Record<string, unknown> = {}

  // First, populate with RO fallback
  for (const [k, v] of roMap) {
    try {
      result[k] = JSON.parse(v)
    } catch {
      result[k] = v
    }
  }

  // Override with requested locale
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value)
    } catch {
      result[row.key] = row.value
    }
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  })
}
