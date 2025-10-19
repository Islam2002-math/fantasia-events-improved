'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, body }),
    })
    setMsg(res.ok ? 'Message envoyé' : 'Erreur')
    if (res.ok) {
      const { showToast } = await import('@/components/toast')
      showToast('Message envoyé')
      setName(''); setEmail(''); setSubject(''); setBody('')
    }
  }

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Contact</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Nom (optionnel)" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Sujet (optionnel)" value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea className="w-full border rounded px-3 py-2" placeholder="Votre message" value={body} onChange={e=>setBody(e.target.value)} required />
        <button className="px-4 py-2 bg-brand text-white rounded">Envoyer</button>
      </form>
      {msg && <div className="text-sm">{msg}</div>}
    </section>
  )
}
