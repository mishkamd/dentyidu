import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['ro', 'en', 'fr'] as const
const LOCALE_COOKIE = 'locale'

function detectLocaleFromHeader(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'en'
  const parts = acceptLanguage.split(',').map((p) => {
    const [lang, q] = p.trim().split(';q=')
    return { lang: lang.toLowerCase().trim(), q: q ? parseFloat(q) : 1 }
  }).sort((a, b) => b.q - a.q)

  for (const { lang } of parts) {
    if (lang.startsWith('fr')) return 'fr'
    if (lang.startsWith('ro') || lang.startsWith('mo')) return 'ro'
  }
  return 'en'
}

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      // Server actions should get a proper error, not an HTML redirect
      if (request.headers.get('next-action')) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect /login to /admin if already logged in
  if (pathname === '/login') {
    if (session && !request.nextUrl.searchParams.has('error')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Set locale cookie if not present
  const response = NextResponse.next()
  const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value

  if (!existingLocale || !(SUPPORTED_LOCALES as readonly string[]).includes(existingLocale)) {
    const detected = detectLocaleFromHeader(request.headers.get('accept-language'))
    response.cookies.set(LOCALE_COOKIE, detected, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|image|uploads|api).*)'],
}
