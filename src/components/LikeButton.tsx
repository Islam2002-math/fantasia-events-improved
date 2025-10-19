"use client"
import { useState } from 'react'

export default function LikeButton({ eventId }: { eventId: string }) {
  const [liked, setLiked] = useState<boolean | null>(null)
  async function toggle() {
    const { buildAuthHeaders } = await import('./authClient')
    const csrf = (await import('./useCsrf')).getCsrfToken()
    const headers = buildAuthHeaders({ 'x-csrf-token': csrf })
    const res = await fetch(`/api/events/${eventId}/like`, { method: 'POST', headers, credentials: 'include' })
    if (res.ok) {
      const j = await res.json()
      setLiked(j.liked)
      const { showToast } = await import('./toast')
      showToast(j.liked ? "Ajouté à vos j’aime" : "J’aime retiré")
    } else if (res.status === 401) {
      const { showToast } = await import('./toast')
      showToast("Session requise. Connectez-vous.", 'error')
    }
  }
  return <button onClick={toggle} className="px-3 py-2 border rounded">{liked ? 'Je n’aime plus' : 'J’aime'}</button>
}