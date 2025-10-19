'use client'
import { useRouter, useSearchParams } from 'next/navigation'

interface EventsToolbarProps {
  mapMode: boolean
}

export default function EventsToolbar({ mapMode }: EventsToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleAroundMe() {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const p = new URLSearchParams(searchParams.toString())
        p.set('near', `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`)
        p.set('radiusKm', p.get('radiusKm') || '50')
        router.push(`/events?${p.toString()}`)
      })
    } else {
      alert('Géolocalisation non disponible')
    }
  }

  function toggleView() {
    const p = new URLSearchParams(searchParams.toString())
    p.set('view', mapMode ? 'list' : 'map')
    router.push(`/events?${p.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button 
        className="px-3 py-1.5 border rounded" 
        onClick={handleAroundMe}
      >
        Autour de moi
      </button>
      <button 
        className="px-3 py-1.5 border rounded" 
        onClick={toggleView}
      >
        {mapMode ? 'Vue liste' : 'Vue carte'}
      </button>
    </div>
  )
}