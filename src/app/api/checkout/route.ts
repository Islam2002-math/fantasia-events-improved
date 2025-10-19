import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { getUserFromRequest } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import QRCode from 'qrcode'

export async function POST(req: Request) {
  const session = await getUserFromRequest()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { eventId, paymentInfo } = body as { 
    eventId?: string
    paymentInfo?: {
      cardNumber: string
      cardholderName: string
      email: string
      phone?: string
    }
  }
  
  if (!eventId) return NextResponse.json({ error: 'eventId requis' }, { status: 400 })

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: 'Event introuvable' }, { status: 404 })

  const stripe = getStripe()
  if (!stripe || !paymentInfo) {
    // Mode simulation - créer le ticket directement
    const payload = `ticket:${eventId}:${session.userId}:${Date.now()}`
    const ticket = await prisma.ticket.create({ 
      data: { 
        eventId, 
        userId: session.userId, 
        qrCode: payload 
      } 
    })
    
    // Log pour débogage
    console.log('Ticket créé en mode simulation:', {
      ticketId: ticket.id,
      eventId,
      userId: session.userId,
      paymentInfo: paymentInfo ? 'Fournie' : 'Non fournie'
    })
    
    return NextResponse.json({ 
      ticketId: ticket.id,
      message: 'Billet généré avec succès'
    })
  }

  // Mode Stripe - traitement réel
  const hdrs = headers()
  const origin = hdrs.get('origin') || hdrs.get('x-forwarded-host') || 'http://localhost:3000'
  const baseUrl = origin.startsWith('http') ? origin : `http://${origin}`

  try {
    const chk = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&eventId=${eventId}`,
      cancel_url: `${baseUrl}/checkout?eventId=${eventId}&canceled=1`,
      customer_email: paymentInfo.email,
      line_items: [
        {
          price_data: {
            currency: process.env.PAYMENT_CURRENCY || 'eur',
            product_data: { 
              name: event.title, 
              description: event.description,
              images: event.imageUrl ? [event.imageUrl] : undefined
            },
            unit_amount: event.priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: { 
        eventId, 
        userId: session.userId,
        cardholderName: paymentInfo.cardholderName,
        phone: paymentInfo.phone || ''
      },
    })
    
    return NextResponse.json({ url: chk.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Erreur de paiement' }, { status: 500 })
  }
}
