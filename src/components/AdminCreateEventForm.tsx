"use client"
import { useState } from 'react'

export default function AdminCreateEventForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [priceCents, setPriceCents] = useState('')
  const [category, setCategory] = useState('')
  const [capacity, setCapacity] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const payload = {
      title,
      description,
      location,
      date,
      priceCents: Number(priceCents || 0),
      category: category || undefined,
      capacity: capacity ? Number(capacity) : undefined,
      imageUrl: imageUrl || undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    }
    const csrf = (await import('./useCsrf')).getCsrfToken()
    const { buildAuthHeaders } = await import('./authClient')
    const headers = buildAuthHeaders({ 'Content-Type': 'application/json', 'x-csrf-token': csrf })
    const res = await fetch('/api/events', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      credentials: 'include',
    })
    if (res.ok) {
      setMsg('Événement créé.')
      setTitle(''); setDescription(''); setLocation(''); setDate(''); setPriceCents('')
    } else {
      const j = await res.json().catch(()=>({}))
      setMsg(j.error || 'Erreur lors de la création')
    }
  }

  return (
    <form onSubmit={submit} className="p-4 border rounded grid grid-cols-1 md:grid-cols-5 gap-3">
      <input className="border rounded px-3 py-2" placeholder="Titre" value={title} onChange={(e)=>setTitle(e.target.value)} required />
      <input className="border rounded px-3 py-2" placeholder="Lieu" value={location} onChange={(e)=>setLocation(e.target.value)} required />
      <input className="border rounded px-3 py-2" type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} required />
      <input className="border rounded px-3 py-2" placeholder="Prix (centimes)" value={priceCents} onChange={(e)=>setPriceCents(e.target.value)} required />
      <input className="border rounded px-3 py-2" placeholder="Catégorie (ex: Concert)" value={category} onChange={(e)=>setCategory(e.target.value)} />
      <input className="border rounded px-3 py-2" placeholder="Capacité (ex: 200)" value={capacity} onChange={(e)=>setCapacity(e.target.value)} />
      <input className="border rounded px-3 py-2" placeholder="Image URL (https://...)" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} />
      <input className="border rounded px-3 py-2" placeholder="Latitude (ex: 36.75)" value={latitude} onChange={(e)=>setLatitude(e.target.value)} />
      <input className="border rounded px-3 py-2" placeholder="Longitude (ex: 3.06)" value={longitude} onChange={(e)=>setLongitude(e.target.value)} />
      <button className="px-3 py-2 bg-brand text-white rounded">Créer</button>
      <div className="md:col-span-5 text-sm text-gray-600">Description</div>
      <textarea className="md:col-span-5 border rounded px-3 py-2" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />
      {msg && <div className="md:col-span-5 text-sm">{msg}</div>}
    </form>
  )
}