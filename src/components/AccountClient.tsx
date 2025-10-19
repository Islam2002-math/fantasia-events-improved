"use client"
import { useEffect, useState } from 'react'
import { buildAuthHeaders } from '@/components/authClient'

export default function AccountClient() {
  const [state, setState] = useState<{ ready: boolean; error?: string; likes?: number; comments?: number; tickets?: any[] }>({ ready: false })
  useEffect(() => {
    async function run() {
      try {
        const res = await fetch('/api/account/summary', { headers: buildAuthHeaders(), credentials: 'include' })
        if (!res.ok) { setState({ ready: true, error: 'Non connecté' }); return }
        const j = await res.json()
        setState({ ready: true, likes: j.likesCount, comments: j.commentsCount, tickets: j.tickets })
      } catch {
        setState({ ready: true, error: 'Erreur réseau' })
      }
    }
    run()
  }, [])
  if (!state.ready) return null
  if (state.error) return <div className="text-sm text-red-600">{state.error}</div>
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 border rounded"><div className="text-xs text-gray-500">Likes</div><div className="text-2xl font-semibold">{state.likes}</div></div>
        <div className="p-3 border rounded"><div className="text-xs text-gray-500">Commentaires</div><div className="text-2xl font-semibold">{state.comments}</div></div>
        <div className="p-3 border rounded"><div className="text-xs text-gray-500">Billets</div><div className="text-2xl font-semibold">{state.tickets?.length ?? 0}</div></div>
      </div>
      <h2 className="text-xl font-semibold">Mes billets</h2>
      {(!state.tickets || state.tickets.length===0) ? (
        <p className="text-gray-600">Aucun billet pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {state.tickets.map((t: any) => (
            <li key={t.id} className="p-4 border rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.event.title}</div>
                <div className="text-xs text-gray-500">Acheté le {new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <a className="text-brand underline" href={`/api/tickets/${t.id}/qrcode`}>QR code</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
