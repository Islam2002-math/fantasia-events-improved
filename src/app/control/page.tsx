"use client"
import { useState } from 'react'

export default function ControlPage() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  async function validate(e: React.FormEvent) {
    e.preventDefault()
    const csrf = (await import('@/components/useCsrf')).getCsrfToken()
    const res = await fetch('/api/control/validate', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify({ code }) })
    const j = await res.json().catch(()=>({}))
    setMsg(res.ok ? `OK: ${j.status}` : j.error || 'Erreur')
  }
  return (
    <section className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Contrôle billets</h1>
      <form onSubmit={validate} className="flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Scannez ou collez le code" />
        <button className="px-3 py-2 bg-brand text-white rounded">Valider</button>
      </form>
      {msg && <div className="text-sm">{msg}</div>}
    </section>
  )
}