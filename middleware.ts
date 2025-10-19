import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CSRF_COOKIE = 'csrf-token'

function ensureCsrfCookie(req: NextRequest, res: NextResponse) {
  const hasCookie = req.cookies.has(CSRF_COOKIE)
  if (!hasCookie) {
    const url = req.nextUrl
    const host = url.host
    const proto = url.protocol // 'http:' | 'https:'
    const isLocalHttp = host.startsWith('localhost') && proto !== 'https:'
    const secureFlag = process.env.NODE_ENV === 'production' && !isLocalHttp
    const token = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string
    res.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'strict',
      secure: secureFlag,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  ensureCsrfCookie(req, res)

  const method = req.method
  const url = req.nextUrl
  const host = url.host
  const proto = url.protocol
  const selfOrigin = `${proto}//${host}`
  const pathname = url.pathname

  // Always allow Stripe webhook
  if (pathname.startsWith('/api/webhooks/stripe')) return res

  // Enforce same-origin for state-changing requests (both dev/prod)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    if (origin && origin !== selfOrigin) return new NextResponse('Bad Origin', { status: 400 })
    if (referer && !referer.startsWith(selfOrigin)) return new NextResponse('Bad Referer', { status: 400 })

    // If Authorization Bearer is present, consider it an API token flow (no CSRF cookie involved)
    const auth = req.headers.get('authorization') || ''
    const isBearer = auth.toLowerCase().startsWith('bearer ')

    // Enforce CSRF only in production and only when not using Bearer tokens
    if (process.env.NODE_ENV === 'production' && !isBearer) {
      const headerToken = req.headers.get('x-csrf-token')
      const cookieToken = req.cookies.get(CSRF_COOKIE)?.value
      if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        return new NextResponse('Bad CSRF', { status: 400 })
      }
    }
  }

  return res
}

export const config = {
  // Temporarily disable middleware to resolve 500 on static assets; we'll re-enable after validation
  matcher: ['/__middleware_disabled__'],
}
