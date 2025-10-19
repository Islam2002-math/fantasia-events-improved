import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getUserFromRequest()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.like.findUnique({ where: { userId_eventId: { userId: session.userId, eventId: params.id } } })
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    return NextResponse.json({ liked: false })
  }
  await prisma.like.create({ data: { eventId: params.id, userId: session.userId } })
  return NextResponse.json({ liked: true })
}
