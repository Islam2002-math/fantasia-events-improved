import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET() {
  const s = await getUserFromRequest()
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [likesCount, commentsCount, tickets] = await Promise.all([
    prisma.like.count({ where: { userId: s.userId } }),
    prisma.comment.count({ where: { userId: s.userId } }),
    prisma.ticket.findMany({ where: { userId: s.userId }, include: { event: true }, orderBy: { createdAt: 'desc' } }),
  ])
  return NextResponse.json({ likesCount, commentsCount, tickets })
}
