import Link from 'next/link'
import { headers } from 'next/headers'
import EventCard from '@/components/EventCard'

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

async function getEvents(qs?: string) {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/events${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
  if (!res.ok) return []
  const j = await res.json()
  return j.events as { id: string, title: string, date: string, location: string, priceCents: number, category?: string, imageUrl?: string, latitude?: number, longitude?: number }[]
}

import SearchEventsForm from '@/components/SearchEventsForm'
import FiltersBar from '@/components/FiltersBar'
import EventsToolbar from '@/components/EventsToolbar'

export default async function EventsPage({ searchParams }: { searchParams?: { q?: string; sort?: string; order?: string; category?: string; near?: string; radiusKm?: string; priceMin?: string; priceMax?: string; dateFrom?: string; dateTo?: string; view?: string } }) {
  const qs = new URLSearchParams()
  if (searchParams?.q) qs.set('q', searchParams.q)
  if (searchParams?.sort) qs.set('sort', searchParams.sort)
  if (searchParams?.order) qs.set('order', searchParams.order)
  if (searchParams?.category) qs.set('category', searchParams.category)
  if (searchParams?.near) qs.set('near', searchParams.near)
  if (searchParams?.radiusKm) qs.set('radiusKm', searchParams.radiusKm)
  if (searchParams?.priceMin) qs.set('priceMin', searchParams.priceMin)
  if (searchParams?.priceMax) qs.set('priceMax', searchParams.priceMax)
  if (searchParams?.dateFrom) qs.set('dateFrom', searchParams.dateFrom)
  if (searchParams?.dateTo) qs.set('dateTo', searchParams.dateTo)
  const events = await getEvents(qs.toString())
  const mapMode = searchParams?.view === 'map'
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Événements</h1>
        <EventsToolbar mapMode={mapMode} />
      </div>
      <SearchEventsForm initial={{ q: searchParams?.q ?? '', sort: searchParams?.sort ?? 'date', order: searchParams?.order ?? 'asc', category: searchParams?.category ?? '' }} />
      {/* Filtres rapides prix/date */}
      <FiltersBar />
      {events.length === 0 ? (
        <p className="text-gray-600">Aucun événement pour le moment.</p>
      ) : (
        <ul className={`grid grid-cols-1 ${mapMode ? 'sm:grid-cols-2 lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {events.map(e => (
            <EventCard
              key={e.id}
              id={e.id}
              title={e.title}
              date={e.date}
              location={e.location}
              priceCents={e.priceCents}
              category={e.category}
              imageUrl={e.imageUrl}
              latitude={e.latitude as any}
              longitude={e.longitude as any}
              mapMode={mapMode}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
