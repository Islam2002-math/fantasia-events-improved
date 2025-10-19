import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const images = await prisma.eventImage.findMany({ where: { eventId: params.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ images })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const cookie = cookies().get('fantasia_session')?.value
  const s = cookie ? await getSession<{ userId?: string }>(cookie).catch(()=>null) : null
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: s.userId } })
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { url } = (await req.json().catch(()=>({}))) as { url?: string }
  if (!url) return NextResponse.json({ error: 'url requis' }, { status: 400 })
  const img = await prisma.eventImage.create({ data: { eventId: params.id, url } })
  return NextResponse.json({ image: img }, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const cookie = cookies().get('fantasia_session')?.value
  const s = cookie ? await getSession<{ userId?: string }>(cookie).catch(()=>null) : null
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: s.userId } })
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const imgId = url.searchParams.get('imageId') || ''
  if (!imgId) return NextResponse.json({ error: 'imageId requis' }, { status: 400 })
  await prisma.eventImage.delete({ where: { id: imgId } })
  return NextResponse.json({ ok: true })
}