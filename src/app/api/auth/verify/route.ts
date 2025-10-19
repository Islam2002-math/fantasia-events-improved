import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const uid = url.searchParams.get('uid') || ''
  if (!token || !uid) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const records = await prisma.emailVerificationToken.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 5 })
  for (const r of records) {
    if (r.expiresAt < new Date()) continue
    const ok = await bcrypt.compare(token, r.tokenHash)
    if (ok) {
      await prisma.user.update({ where: { id: uid }, data: { emailVerified: new Date() } })
      await prisma.emailVerificationToken.deleteMany({ where: { userId: uid } })
      return NextResponse.json({ ok: true })
    }
  }
  return NextResponse.json({ error: 'Invalid' }, { status: 400 })
}