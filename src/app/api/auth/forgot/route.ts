import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTicketEmail } from '@/lib/mailer'
import bcrypt from 'bcryptjs'

function genToken() {
  return (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string
}

export async function POST(req: Request) {
  const { email } = (await req.json().catch(()=>({}))) as { email?: string }
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ ok: true }) // ne pas révéler
  const token = genToken()
  const tokenHash = await bcrypt.hash(token, 10)
  const expires = new Date(Date.now() + 1000*60*30) // 30 min
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: expires } })
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const link = `${base}/auth/reset?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(user.id)}`
  await sendTicketEmail(email, 'Réinitialiser votre mot de passe', `<p>Cliquez ce lien pour réinitialiser: <a href="${link}">${link}</a></p>`).catch(()=>null)
  return NextResponse.json({ ok: true })
}