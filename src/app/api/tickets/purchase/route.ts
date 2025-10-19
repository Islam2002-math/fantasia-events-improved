import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import QRCode from 'qrcode'
import { sendTicketEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  const session = await getUserFromRequest()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId, provider } = (await req.json().catch(() => ({}))) as { eventId?: string, provider?: string }
  if (!eventId) return NextResponse.json({ error: 'eventId requis' }, { status: 400 })
  // NOTE: Paiement effectif à intégrer (Visa / Algérie Poste Dahabia)
  // Ici nous simulons l’autorisation et créons un ticket.
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: 'Event introuvable' }, { status: 404 })

  // Vérifier stock (capacity)
  const count = await prisma.ticket.count({ where: { eventId } })
  if (count >= (event.capacity ?? 0)) {
    return NextResponse.json({ error: 'Épuisé' }, { status: 409 })
  }

  const payload = `ticket:${eventId}:${session.userId}:${Date.now()}`
  const ticket = await prisma.ticket.create({ data: { eventId, userId: session.userId, qrCode: payload } })
  const qrPng = await QRCode.toDataURL(payload)
  // Email du billet si SMTP
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (user?.email) {
    await sendTicketEmail(user.email, 'Votre billet Fantasia', `<p>Merci pour votre achat de ${event.title}.</p><img src="${qrPng}" />`).catch(()=>null)
  }
  return NextResponse.json({ ticketId: ticket.id, qrDataUrl: qrPng })
}
