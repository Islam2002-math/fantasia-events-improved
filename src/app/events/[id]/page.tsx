import Link from 'next/link'
import LikeButton from '@/components/LikeButton'
import CommentsSection from '@/components/CommentsSection'
import BuyTicketButton from '@/components/BuyTicketButton'
import ShareButton from '@/components/ShareButton'
import FavoriteButton from '@/components/FavoriteButton'
import { headers } from 'next/headers'

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

async function getEvent(id: string) {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/events/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  const j = await res.json()
  return j.event as { id: string, title: string, description: string, location: string, date: string, priceCents: number, imageUrl?: string, latitude?: number, longitude?: number }
}

async function getImages(id: string) {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/events/${id}/images`, { cache: 'no-store' })
  if (!res.ok) return [] as { id: string, url: string }[]
  const j = await res.json()
  return j.images as { id: string, url: string }[]
}

export default async function EventDetail({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id)
  const images = await getImages(params.id)
  if (!event) {
    return (
      <section className="space-y-6">
        <p className="text-red-600">Événement introuvable.</p>
        <Link className="text-brand underline" href="/events">Retour</Link>
      </section>
    )
  }
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <img src={event.imageUrl || 'https://picsum.photos/seed/fantasia1/1200/400'} alt={event.title} className="w-full h-64 object-cover rounded" />
      <p className="text-gray-700">{event.description}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()} — {event.location}</p>
        <div className="text-xl font-semibold">{(event.priceCents/100).toFixed(2)} €</div>
      </div>
      <div className="flex gap-2">
        <LikeButton eventId={event.id} />
        <FavoriteButton eventId={event.id} />
        <BuyTicketButton eventId={event.id} priceCents={event.priceCents} />
        <a className="px-3 py-2 border rounded" href={`/api/events/${event.id}/ics`}>Ajouter au calendrier</a>
        <ShareButton title={event.title} />
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.map(img => (
            <img key={img.id} src={img.url} alt="photo" className="w-full h-32 object-cover rounded" />
          ))}
        </div>
      )}
      <div className="aspect-video w-full overflow-hidden rounded border">
        <iframe
          title="Carte"
          src={event.latitude && event.longitude
            ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}&output=embed`
            : `https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <CommentsSection eventId={event.id} />
    </section>
  )
}
