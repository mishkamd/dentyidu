import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/languages
 *
 * Returns all active languages in order.
 * Used by the language selector and provider to load available languages dynamically.
 */
export async function GET() {
  const languages = await prisma.language.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      code: true,
      name: true,
      flag: true,
      isDefault: true,
    },
  })

  return NextResponse.json(languages, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
