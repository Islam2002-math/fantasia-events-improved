import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const cookie = cookies().get('fantasia_session')?.value
  const s = cookie ? await getSession<{ userId?: string }>(cookie).catch(()=>null) : null
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: s.userId } })
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(()=>({}))
  const updated = await prisma.event.update({ where: { id: params.id }, data: body as any })
  return NextResponse.json({ event: updated })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const cookie = cookies().get('fantasia_session')?.value
  const s = cookie ? await getSession<{ userId?: string }>(cookie).catch(()=>null) : null
  if (!s?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: s.userId } })
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.event.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}