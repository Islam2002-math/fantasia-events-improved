import Link from 'next/link'
import { headers } from 'next/headers'
import Recommendations from '@/components/Recommendations'

function getBaseUrl() {
  try {
    const h = headers()
    const host = h.get('host') || 'localhost:3000'
    const proto = h.get('x-forwarded-proto') || 'http'
    return `${proto}://${host}`
  } catch {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }
}

async function getAnnouncements() {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/announcements`, { cache: 'no-store' })
  if (!res.ok) return []
  const j = await res.json()
  return j.announcements as { id: string, title: string, body: string }[]
}

async function getFeaturedEvents() {
  const base = getBaseUrl()
  const params = new URLSearchParams({ sort: 'date', order: 'asc' })
  const res = await fetch(`${base}/api/events?${params.toString()}`, { cache: 'no-store' })
  if (!res.ok) return []
  const j = await res.json()
  return (j.events as { id: string, title: string, date: string, location: string, priceCents: number, category?: string, imageUrl?: string }[]).slice(0, 6)
}

export default function HomePage() {
  return (
    <section className="relative space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white">
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" aria-hidden />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" aria-hidden />
        <div className="relative text-center space-y-5 p-12 md:p-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Fantasian Events</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Découvrez, aimez et vivez les meilleurs événements. Billetterie simple, QR immédiat, recommandations IA.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/events" className="px-5 py-2.5 rounded-md bg-black/30 hover:bg-black/40">Voir les événements</Link>
            <Link href="/account" className="px-5 py-2.5 rounded-md bg-white text-purple-700 hover:bg-white/90">Mon compte</Link>
          </div>
        </div>
      </div>

      {/* Quick categories */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Catégories populaires:</span>
        {['Concert','Festival','Conférence','Sport','Théâtre','Famille'].map(c => (
          <Link key={c} href={`/events?category=${encodeURIComponent(c)}`} className="text-sm px-3 py-1 rounded-full border hover:bg-gray-50">
            {c}
          </Link>
        ))}
      </div>

      {/* Highlights */}
      <FeaturedGrid />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LatestAnnouncements />
        {/* AI Recommendations panel */}
        <Recommendations />
      </div>
    </section>
  )
}

async function LatestAnnouncements() {
  const items = await getAnnouncements()
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="font-semibold mb-2">Actualités & Annonces</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-600">Aucune annonce pour le moment.</p>
      ) : (
        <ul className="text-sm list-disc pl-5 space-y-1">
          {items.map(a => (<li key={a.id}><span className="font-medium">{a.title}:</span> {a.body}</li>))}
        </ul>
      )}
    </div>
  )
}

async function FeaturedGrid() {
  const events = await getFeaturedEvents()
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold">Événements à venir</h2>
        <Link href="/events" className="text-sm text-brand underline">Tout voir</Link>
      </div>
      {events.length === 0 ? (
        <p className="text-gray-600">Aucun événement pour le moment.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(e => (
            <li key={e.id} className="group rounded-xl border overflow-hidden bg-white/70 dark:bg-gray-900/50 backdrop-blur shadow-card">
              <div className="relative h-44">
                <img src={e.imageUrl || 'https://picsum.photos/seed/fantasia-featured/800/500'} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                {e.category && <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/60 text-white">{e.category}</span>}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-xs flex items-center justify-between">
                  <span>{new Date(e.date).toLocaleDateString()} — {e.location}</span>
                  <span className="px-2 py-1 rounded bg-brand">{(e.priceCents/100).toFixed(2)} €</span>
                </div>
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate" title={e.title}>{e.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{e.location}</p>
                </div>
                <Link href={`/events/${e.id}`} className="text-sm shrink-0 px-3 py-1.5 rounded border hover:bg-gray-50">Voir</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
