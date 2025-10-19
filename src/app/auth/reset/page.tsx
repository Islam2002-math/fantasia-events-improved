"use client"
import { useState, useEffect } from 'react'

export default function ResetPage() {
  const [token, setToken] = useState('')
  const [uid, setUid] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get('token') || '')
    setUid(params.get('uid') || '')
  }, [])
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const csrf = (await import('@/components/useCsrf')).getCsrfToken()
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify({ token, uid, password }) })
    setMsg(res.ok ? 'Mot de passe mis à jour' : 'Erreur de lien')
  }
  return (
    <section className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Réinitialiser le mot de passe</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Nouveau mot de passe (min 8)" required />
        <button className="px-3 py-2 bg-brand text-white rounded">Valider</button>
      </form>
      {msg && <div className="text-sm">{msg}</div>}
    </section>
  )
}