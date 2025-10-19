"use client"
import { useState, useEffect } from 'react'

export default function FavoriteButton({ eventId }: { eventId: string }) {
  const [fav, setFav] = useState<boolean | null>(null)
  async function toggle() {
    const { buildAuthHeaders } = await import('./authClient')
    const csrf = (await import('./useCsrf')).getCsrfToken()
    const headers = buildAuthHeaders({ 'x-csrf-token': csrf })
    const res = await fetch(`/api/favorites/${eventId}`, { method: 'POST', headers, credentials: 'include' })
    if (res.ok) {
      const j = await res.json()
      setFav(j.favorite)
      const { showToast } = await import('./toast')
      showToast(j.favorite ? 'Ajouté aux favoris' : 'Retiré des favoris')
    } else if (res.status === 401) {
      const { showToast } = await import('./toast')
      showToast('Session requise. Connectez-vous.', 'error')
    }
  }
  return (
    <button onClick={toggle} className={`px-3 py-2 rounded border ${fav ? 'bg-brand text-white' : ''}`}>{fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}</button>
  )
}