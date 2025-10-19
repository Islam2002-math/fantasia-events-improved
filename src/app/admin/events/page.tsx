import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'
import AdminCreateEventForm from '@/components/AdminCreateEventForm'

export default async function AdminEventsPage() {
  const sealed = cookies().get('fantasia_session')?.value
  const s = sealed ? await getSession<{ userId?: string }>(sealed).catch(()=>null) : null
  if (!s?.userId) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-bold">Admin · Événements</h1>
        <p className="text-gray-600">Accès restreint. Merci de vous <a className="text-brand underline" href="/auth/login">connecter</a>.</p>
      </section>
    )
  }
  const user = await prisma.user.findUnique({ where: { id: s.userId! } })
  if (user?.role !== 'ADMIN') {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-bold">Admin · Événements</h1>
        <p className="text-gray-600">Accès refusé (admin requis).</p>
      </section>
    )
  }
  const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })
  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin · Événements</h1>
        <div className="flex gap-3">
          <a 
            href="/scanner" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            📱 Scanner QR
          </a>
          <a 
            href="/verify" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            🎫 Vérifier billets
          </a>
        </div>
      </div>
      <AdminCreateEventForm />
      <ul className="space-y-3">
        {events.map(e => (
          <li key={e.id} className="p-4 border rounded">
            <div className="font-semibold">{e.title}</div>
            <div className="text-xs text-gray-500">{new Date(e.date).toLocaleString()} — {e.location} — {(e.priceCents/100).toFixed(2)} €</div>
            <p className="text-sm text-gray-700 mt-1">{e.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}