import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyHCaptcha } from '@/lib/captcha'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rateLimit'
import { sendTicketEmail } from '@/lib/mailer'
import { setSession } from '@/lib/session'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  captchaToken: z.string().optional(),
  name: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const ip = headers().get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!rateLimit(`register:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 })
    }
    const json = await req.json().catch(() => null)
    const parsed = RegisterSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { email, password, captchaToken, name } = parsed.data

    // En prod, si un secret HCAPTCHA est présent, on exige un token; sinon on bypass (dev)
    const requireCaptcha = process.env.NODE_ENV === 'production' && !!process.env.HCAPTCHA_SECRET
    if (requireCaptcha) {
      if (!captchaToken) {
        return NextResponse.json({ error: 'CAPTCHA manquant' }, { status: 400 })
      }
      const cap = await verifyHCaptcha(captchaToken)
      if (!cap.success) {
        return NextResponse.json({ error: 'CAPTCHA failed' }, { status: 400 })
      }
    } else if (captchaToken) {
      // Si un token est envoyé en dev, on peut le vérifier mais on ignore le résultat si besoin
      await verifyHCaptcha(captchaToken).catch(() => null)
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hash, name, role: 'USER' } })
    // Email de bienvenue (si SMTP configuré)
    await sendTicketEmail(email, 'Bienvenue sur Fantasia Events', `<p>Bienvenue ${name ?? ''} ! Votre compte a été créé.</p>`).catch(()=>null)
    // Issue a token for cookie-less auth convenience
    const sealed = await setSession({ userId: user.id, email: user.email })
    return NextResponse.json({ id: user.id, email: user.email, token: sealed }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal', message: e?.message || 'unknown' }, { status: 500 })
  }
}
