import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isValidLocale } from "@/lib/i18n"

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale")
  if (!locale || !isValidLocale(locale)) {
    return NextResponse.json({}, { status: 400 })
  }

  const rows = await prisma.translation.findMany({
    where: { locale },
  })

  const map: Record<string, string> = {}
  for (const row of rows) {
    map[row.key] = row.value
  }

  return NextResponse.json(map, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  })
}
