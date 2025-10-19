import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const s = await getUserFromRequest()
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: s.userId }, select: { email: true, name: true, role: true } })
  return NextResponse.json({ user })
}

export async function PUT(req: Request) {
  const s = await getUserFromRequest()
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = (await req.json().catch(()=>({}))) as { name?: string }
  const user = await prisma.user.update({ where: { id: s.userId }, data: { name } })
  return NextResponse.json({ ok: true, name: user.name })
}