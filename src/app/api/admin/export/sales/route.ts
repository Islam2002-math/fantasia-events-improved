import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export async function GET() {
  const sealed = cookies().get('fantasia_session')?.value
  const s = sealed ? await getSession<{ userId?: string }>(sealed).catch(()=>null) : null
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: s.userId } })
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rows = await prisma.ticket.findMany({ include: { user: true, event: true }, orderBy: { createdAt: 'desc' } })
  const csv = ['ticketId,eventId,eventTitle,userEmail,createdAt'].concat(
    rows.map(r => `${r.id},${r.eventId},"${r.event.title}",${r.user.email},${r.createdAt.toISOString()}`)
  ).join('\n')

  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="sales.csv"' } })
}