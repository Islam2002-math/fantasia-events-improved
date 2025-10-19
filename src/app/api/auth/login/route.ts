import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies, headers } from 'next/headers'
import { setSession } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  const ip = headers().get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 })
  }
  const json = await req.json().catch(() => null)
  const parsed = LoginSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log('User not found:', email)
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
  }

  // Debug: Log user found
  console.log('User found:', { id: user.id, email: user.email, role: user.role })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    console.log('Password mismatch for user:', email)
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
  }

  const sealed = await setSession({ userId: user.id, email: user.email })
  const h = headers()
  const host = h.get('host') || ''
  const proto = h.get('x-forwarded-proto') || 'http'
  const isLocalHttp = host.startsWith('localhost') && proto !== 'https'
  const secureFlag = process.env.NODE_ENV === 'production' && !isLocalHttp
  // Keep cookie for compatibility if cookies are allowed
  cookies().set('fantasia_session', sealed, {
    httpOnly: true,
    secure: secureFlag,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Also return a token so the client can operate without cookies (Bearer flow)
  console.log('Login successful, returning token for:', user.email)
  return NextResponse.json({
    ok: true,
    token: sealed,
    user: { id: user.id, email: user.email, role: user.role },
    redirect: user.role === 'ADMIN' ? '/admin/events' : '/account'
  })
}
