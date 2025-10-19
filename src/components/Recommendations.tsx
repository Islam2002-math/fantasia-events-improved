import { headers } from 'next/headers'

async function getBaseUrl() {
  try {
    const h = headers()
    const host = h.get('host') || 'localhost:3000'
    const proto = h.get('x-forwarded-proto') || 'http'
    return `${proto}://${host}`
  } catch {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }
}

export default async function Recommendations() {
  const base = await getBaseUrl()
  const res = await fetch(`${base}/api/ai/recommend`, { cache: 'no-store' })
  if (!res.ok) {
    return null
  }
  const j = await res.json()
  const events = j.events as { id: string; title: string; date: string; location: string; priceCents: number; category?: string; imageUrl?: string }[]
  const summary = j.summary as string
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="font-semibold mb-2">Recommandations pour vous</h2>
      <p className="text-sm text-gray-600 mb-3">{summary}</p>
      {events.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {events.slice(0,4).map(e => (
            <li key={e.id} className="flex items-center gap-3">
              <img src={e.imageUrl || 'https://picsum.photos/seed/fantasia-reco/200/120'} alt={e.title} className="w-20 h-14 object-cover rounded" />
              <div>
                <div className="font-medium">{e.title}</div>
                <div className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString()} — {e.location}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
