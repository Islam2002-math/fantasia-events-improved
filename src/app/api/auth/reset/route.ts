import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { token, uid, password } = (await req.json().catch(()=>({}))) as { token?: string, uid?: string, password?: string }
  if (!token || !uid || !password || password.length < 8) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const records = await prisma.passwordResetToken.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 5 })
  const match = await (async () => {
    for (const r of records) {
      if (r.expiresAt < new Date()) continue
      const ok = await bcrypt.compare(token, r.tokenHash)
      if (ok) return r
    }
    return null
  })()
  if (!match) return NextResponse.json({ error: 'Token invalide' }, { status: 400 })
  const hash = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { id: uid }, data: { password: hash } })
  // supprimer les anciens tokens
  await prisma.passwordResetToken.deleteMany({ where: { userId: uid } })
  return NextResponse.json({ ok: true })
}