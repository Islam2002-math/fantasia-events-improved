import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } })
  if (!ticket) return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })
  const png = await QRCode.toBuffer(ticket.qrCode, { type: 'png', margin: 1, scale: 6 })
  const blob = new Blob([new Uint8Array(png)], { type: 'image/png' })
  return new NextResponse(blob, { status: 200, headers: { 'Content-Type': 'image/png' } })
}
