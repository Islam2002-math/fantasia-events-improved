"use client"
import { useEffect, useState } from 'react'

export default function CommentsSection({ eventId }: { eventId: string }) {
  const [comments, setComments] = useState<{ id: string, body: string, user: { email: string } }[]>([])
  const [body, setBody] = useState('')
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  async function refresh() {
    const { buildAuthHeaders } = await import('./authClient')
    const headers = buildAuthHeaders()
    const res = await fetch(`/api/events/${eventId}/comments`, { headers, credentials: 'include' })
    if (res.ok) {
      const j = await res.json()
      setComments(j.comments)
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    const csrf = (await import('./useCsrf')).getCsrfToken()
    const { buildAuthHeaders } = await import('./authClient')
    const headers = buildAuthHeaders({ 'Content-Type': 'application/json', 'x-csrf-token': csrf })
    const res = await fetch(`/api/events/${eventId}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body }),
      credentials: 'include',
    })
    if (res.ok) {
      setBody('')
      const { showToast } = await import('./toast')
      showToast('Commentaire publié')
      refresh()
    }
  }
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Commentaires</h2>
      <form onSubmit={submit} className="flex gap-2">
        <input value={body} onChange={(e)=>setBody(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Votre commentaire…" />
        <button className="px-3 py-2 border rounded">Publier</button>
      </form>
      <ul className="space-y-2">
        {comments.map(c => (
          <li key={c.id} className="text-sm"><span className="text-gray-500">{c.user.email}:</span> {c.body}</li>
        ))}
      </ul>
    </div>
  )
}