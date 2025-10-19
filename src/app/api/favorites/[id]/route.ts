import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const s = await getUserFromRequest()
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const existing = await prisma.favorite.findUnique({ where: { userId_eventId: { userId: s.userId, eventId: params.id } } })
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return NextResponse.json({ favorite: false })
  }
  await prisma.favorite.create({ data: { userId: s.userId, eventId: params.id } })
  return NextResponse.json({ favorite: true })
}