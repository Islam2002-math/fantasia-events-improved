import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sealed = cookies().get('fantasia_session')?.value
  const s = sealed ? await getSession<{ userId?: string }>(sealed).catch(()=>null) : null
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await prisma.ticket.findMany({ where: { userId: s.userId }, include: { event: true }, orderBy: { createdAt: 'desc' } })
  const csv = ['ticketId,eventId,eventTitle,createdAt'].concat(
    rows.map(r => `${r.id},${r.eventId},"${r.event.title}",${r.createdAt.toISOString()}`)
  ).join('\n')

  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="my-tickets.csv"' } })
}