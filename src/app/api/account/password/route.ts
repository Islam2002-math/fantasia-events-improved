import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(req: Request) {
  const s = await getUserFromRequest()
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { currentPassword, newPassword } = (await req.json().catch(()=>({}))) as { currentPassword?: string, newPassword?: string }
  if (!currentPassword || !newPassword || newPassword.length < 8) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id: s.userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const ok = await bcrypt.compare(currentPassword, user.password)
  if (!ok) return NextResponse.json({ error: 'Bad credentials' }, { status: 401 })
  const hash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: s.userId }, data: { password: hash } })
  return NextResponse.json({ ok: true })
}