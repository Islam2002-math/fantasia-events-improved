import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE() {
  const { headers } = await import('next/headers')
  const h = headers()
  const host = h.get('host') || ''
  const proto = h.get('x-forwarded-proto') || 'http'
  const isLocalHttp = host.startsWith('localhost') && proto !== 'https'
  const secureFlag = process.env.NODE_ENV === 'production' && !isLocalHttp
  cookies().set('fantasia_session', '', {
    httpOnly: true,
    secure: secureFlag,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return NextResponse.json({ ok: true })
}
