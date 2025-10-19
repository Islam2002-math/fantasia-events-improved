"use client"
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/account/profile').then(r=>r.json()).then(d=>{ setEmail(d.user?.email ?? ''); setName(d.user?.name ?? '') })
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const csrf = (await import('@/components/useCsrf')).getCsrfToken()
    const { buildAuthHeaders } = await import('@/components/authClient')
    const headers = buildAuthHeaders({ 'Content-Type': 'application/json', 'x-csrf-token': csrf })
    const res = await fetch('/api/account/profile', { method: 'PUT', headers, body: JSON.stringify({ name }) })
    setMsg(res.ok ? 'Profil mis à jour' : 'Erreur profil')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const csrf = (await import('@/components/useCsrf')).getCsrfToken()
    const { buildAuthHeaders } = await import('@/components/authClient')
    const headers = buildAuthHeaders({ 'Content-Type': 'application/json', 'x-csrf-token': csrf })
    const res = await fetch('/api/account/password', { method: 'PUT', headers, body: JSON.stringify({ currentPassword, newPassword }) })
    setMsg(res.ok ? 'Mot de passe modifié' : 'Erreur mot de passe')
    if (res.ok) { setCurrentPassword(''); setNewPassword('') }
  }

  return (
    <section className="space-y-8 max-w-xl">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <form onSubmit={saveProfile} className="space-y-3 p-4 border rounded">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} disabled className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <button className="px-3 py-2 bg-brand text-white rounded">Enregistrer</button>
      </form>

      <form onSubmit={changePassword} className="space-y-3 p-4 border rounded">
        <h2 className="font-semibold">Changer le mot de passe</h2>
        <div>
          <label className="block text-sm mb-1">Mot de passe actuel</label>
          <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nouveau mot de passe</label>
          <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <button className="px-3 py-2 bg-brand text-white rounded">Mettre à jour</button>
      </form>

      {msg && <div className="text-sm">{msg}</div>}
    </section>
  )
}