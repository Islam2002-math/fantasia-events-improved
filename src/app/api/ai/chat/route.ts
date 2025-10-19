import { NextResponse } from 'next/server'
import { chatAI } from '@/lib/ai'

export async function POST(req: Request) {
  const { message } = (await req.json().catch(()=>({}))) as { message?: string }
  if (!message) return NextResponse.json({ reply: 'Message vide.' })
  const reply = await chatAI(message)
  return NextResponse.json({ reply })
}
