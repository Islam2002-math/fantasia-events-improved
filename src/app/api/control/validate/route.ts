import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { code } = (await req.json().catch(()=>({}))) as { code?: string }
  if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 })
  const ticket = await prisma.ticket.findFirst({ where: { qrCode: code }, include: { event: true, user: true } })
  if (!ticket) return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })
  if (ticket.usedAt) return NextResponse.json({ error: 'Déjà utilisé' }, { status: 409 })
  const updated = await prisma.ticket.update({ where: { id: ticket.id }, data: { usedAt: new Date() } })
  return NextResponse.json({ status: 'validé', ticketId: updated.id })
}