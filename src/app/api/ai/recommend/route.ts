import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'
import { recommendEventsForUser, summarizeRecommendations } from '@/lib/ai'

export async function GET() {
  const sealed = cookies().get('fantasia_session')?.value
  const s = sealed ? await getSession<{ userId?: string }>(sealed).catch(()=>null) : null
  const userId = s?.userId
  const events = await recommendEventsForUser(userId)
  const summary = await summarizeRecommendations(events.map(e => ({ title: e.title, location: e.location, date: e.date as unknown as Date, category: (e as any).category || undefined })))
  return NextResponse.json({ summary, events })
}
