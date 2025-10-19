import Link from 'next/link'

export type EventCardProps = {
  id: string
  title: string
  date: string
  location: string
  priceCents: number
  category?: string
  imageUrl?: string
  latitude?: number
  longitude?: number
  mapMode?: boolean
}

export default function EventCard({ id, title, date, location, priceCents, category, imageUrl, latitude, longitude, mapMode }: EventCardProps) {
  const price = (priceCents / 100).toFixed(2)
  return (
    <li className="group rounded-lg border shadow-card overflow-hidden bg-white/70 dark:bg-gray-900/50 backdrop-blur">
      <div className="relative h-40 overflow-hidden">
        {mapMode && (latitude !== undefined && longitude !== undefined) ? (
          <iframe title="map" className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${latitude},${longitude}&output=embed`} />
        ) : (
          <img src={imageUrl || 'https://picsum.photos/seed/fantasia-card/800/400'} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        )}
        {category && <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/60 text-white">{category}</span>}
        <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-brand text-white">{price} €</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate">{title}</h3>
        <p className="text-xs text-gray-500 truncate">{new Date(date).toLocaleString()} — {location}</p>
        <div className="pt-3">
          <Link className="text-brand underline" href={`/events/${id}`}>Voir</Link>
        </div>
      </div>
    </li>
  )
}