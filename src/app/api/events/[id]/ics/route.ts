import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ev = await prisma.event.findUnique({ where: { id: params.id } })
  if (!ev) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const dtStart = ev.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const dtEnd = new Date(ev.date.getTime() + 2*60*60*1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fantasian Events//EN',
    'BEGIN:VEVENT',
    `UID:${ev.id}@fantasian-events`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.latitude && ev.longitude ? `${ev.latitude},${ev.longitude}` : ev.location}`,
    `DESCRIPTION:${ev.description}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  return new NextResponse(ics, { status: 200, headers: { 'Content-Type': 'text/calendar', 'Content-Disposition': `attachment; filename=event-${ev.id}.ics` } })
}