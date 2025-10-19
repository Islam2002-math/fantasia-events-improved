import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { headers } from 'next/headers'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

const CommentSchema = z.object({
  body: z.string().min(1)
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { eventId: params.id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, email: true, name: true } } },
  })
  return NextResponse.json({ comments })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ip = headers().get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!rateLimit(`comment:${params.id}:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 })
  }
  const user = await getUserFromRequest()
  if (!user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = CommentSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const created = await prisma.comment.create({
    data: { body: parsed.data.body, eventId: params.id, userId: user.userId }
  })
  return NextResponse.json({ comment: created }, { status: 201 })
}
