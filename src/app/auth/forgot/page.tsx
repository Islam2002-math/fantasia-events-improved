"use client"
import { useState } from 'react'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const csrf = (await import('@/components/useCsrf')).getCsrfToken()
    const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify({ email }) })
    setMsg(res.ok ? 'Si un compte existe, un email a été envoyé.' : 'Erreur')
  }
  return (
    <section className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Votre email" required />
        <button className="px-3 py-2 bg-brand text-white rounded">Envoyer le lien</button>
      </form>
      {msg && <div className="text-sm">{msg}</div>}
    </section>
  )
}