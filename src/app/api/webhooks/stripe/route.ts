import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function POST(req: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return NextResponse.json({ ok: true })
  const sig = (req.headers as any).get('stripe-signature') || ''
  const body = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const eventId = session.metadata?.eventId
    const userId = session.metadata?.userId
    if (eventId && userId) {
      const payload = `ticket:${eventId}:${userId}:${Date.now()}`
      const ticket = await prisma.ticket.create({ data: { eventId, userId, qrCode: payload } })
      // Optionnel: envoyer un email avec le QR
      // const qrPng = await QRCode.toDataURL(payload)
      // await sendTicketEmail(session.customer_email, 'Votre billet', `<p>Merci pour votre achat.</p><img src="${qrPng}" />`)
    }
  }
  return NextResponse.json({ received: true })
}

export const dynamic = 'force-dynamic'