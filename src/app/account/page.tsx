import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import AccountClient from '@/components/AccountClient'

export default async function AccountPage() {
  const sealed = cookies().get('fantasia_session')?.value
  let userId: string | null = null
  if (sealed) {
    const s = await getSession<{ userId?: string }>(sealed).catch(()=>null)
    userId = s?.userId ?? null
  }
  // Do not early-return: if no cookie-session, the client token-based view will still render below.
  const [likesCount, commentsCount] = userId ? await Promise.all([
    prisma.like.count({ where: { userId } }),
    prisma.comment.count({ where: { userId } }),
  ]) : [0, 0]
  const tickets = userId ? await prisma.ticket.findMany({ where: { userId }, include: { event: true }, orderBy: { createdAt: 'desc' } }) : []
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <div className="flex items-center gap-3 text-sm">
          <a className="text-brand underline" href="/account/profile">Profil</a>
          <a className="text-brand underline" href="/api/account/export/tickets">Exporter mes billets (CSV)</a>
        </div>
      </div>

      {/* Server-side block (cookies) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 border rounded">
          <div className="text-xs text-gray-500">Billets</div>
          <div className="text-2xl font-semibold">{tickets.length}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-xs text-gray-500">Likes</div>
          <div className="text-2xl font-semibold">{likesCount}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-xs text-gray-500">Commentaires</div>
          <div className="text-2xl font-semibold">{commentsCount}</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold">Mes billets</h2>
      {tickets.length === 0 ? (
        <p className="text-gray-600">Aucun billet pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {tickets.map(t => (
            <li key={t.id} className="p-4 border rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.event.title}</div>
                <div className="text-xs text-gray-500">Acheté le {new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <a className="text-brand underline" href={`/api/tickets/${t.id}/qrcode`}>QR code</a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Client-side block (token mode) */}
      <AccountClient />
    </section>
  )
}
