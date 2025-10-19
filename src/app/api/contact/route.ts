import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTransport } from '@/lib/mailer'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  subject: z.string().optional(),
  body: z.string().min(1),
})

export async function POST(req: Request) {
  const json = await req.json().catch(()=>null)
  const p = ContactSchema.safeParse(json)
  if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  // 1) Enregistrer en BDD (si le modèle Message existe)
  let savedId: string | null = null
  try {
    // @ts-ignore - on ignore si le modèle Message n'existe pas dans le schéma
    const created = await (prisma as any).message?.create?.({ data: p.data })
    savedId = created?.id ?? null
  } catch {}

  // 2) Envoyer par email si SMTP configuré
  const transport = getTransport()
  if (transport) {
    const to = process.env.FROM_EMAIL || 'admin@example.com'
    const html = `<p>Nouveau message:</p>
      <p><b>De</b>: ${p.data.name ?? ''} &lt;${p.data.email}&gt;</p>
      <p><b>Sujet</b>: ${p.data.subject ?? ''}</p>
      <pre>${p.data.body}</pre>`
    await transport.sendMail({ from: to, to, subject: 'Nouveau message du site', html }).catch(()=>null)
  }

  return NextResponse.json({ ok: true, id: savedId })
}
