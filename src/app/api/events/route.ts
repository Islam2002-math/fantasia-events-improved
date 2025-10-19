import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  date: z.string().transform((s) => new Date(s)),
  priceCents: z.number().int().nonnegative(),
  category: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || undefined
  const category = url.searchParams.get('category') || undefined
  const sort = url.searchParams.get('sort') || 'date' // date | title | price
  const order = (url.searchParams.get('order') || 'asc') as 'asc' | 'desc'
  const near = url.searchParams.get('near') // "lat,lng"
  const radiusKm = Number(url.searchParams.get('radiusKm') || '50')
  const priceMin = url.searchParams.get('priceMin')
  const priceMax = url.searchParams.get('priceMax')
  const dateFrom = url.searchParams.get('dateFrom')
  const dateTo = url.searchParams.get('dateTo')
  const where: any = {}
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (category) where.category = { contains: category, mode: 'insensitive' }
  if (near) {
    const [latStr, lngStr] = near.split(',')
    const lat = Number(latStr), lng = Number(lngStr)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      const dLat = radiusKm / 111 // ~111 km par degré
      const dLng = radiusKm / (111 * Math.cos(lat * Math.PI/180) || 1)
      where.latitude = { gte: lat - dLat, lte: lat + dLat }
      where.longitude = { gte: lng - dLng, lte: lng + dLng }
    }
  }
  if (priceMin) where.priceCents = { ...(where.priceCents||{}), gte: Number(priceMin) }
  if (priceMax) where.priceCents = { ...(where.priceCents||{}), lte: Number(priceMax) }
  if (dateFrom) where.date = { ...(where.date||{}), gte: new Date(dateFrom) }
  if (dateTo) where.date = { ...(where.date||{}), lte: new Date(dateTo) }
  const orderBy: any = {}
  if (sort === 'title') orderBy.title = order
  else if (sort === 'price') orderBy.priceCents = order
  else orderBy.date = order
  const events = await prisma.event.findMany({ where, orderBy })
  return NextResponse.json({ events })
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = CreateEventSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const e = await prisma.event.create({ data: parsed.data as any })
  return NextResponse.json({ event: e }, { status: 201 })
}
