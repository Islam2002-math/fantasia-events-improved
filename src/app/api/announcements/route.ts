import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
  return NextResponse.json({ announcements })
}

export const dynamic = 'force-dynamic'
