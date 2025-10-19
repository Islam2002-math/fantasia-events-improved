"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchEventsForm({ initial }: { initial: { q: string; sort: string; order: string; category: string } }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [q, setQ] = useState(initial.q)
  const [sort, setSort] = useState(initial.sort)
  const [order, setOrder] = useState(initial.order)
  const [category, setCategory] = useState(initial.category)

  useEffect(() => {
    setQ(sp.get('q') || '')
    setSort(sp.get('sort') || 'date')
    setOrder(sp.get('order') || 'asc')
    setCategory(sp.get('category') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sort) params.set('sort', sort)
    if (order) params.set('order', order)
    if (category) params.set('category', category)
    const url = `/events${params.toString() ? `?${params.toString()}` : ''}`
    // @ts-expect-error typedRoutes doesn't like dynamic query strings; safe at runtime
    router.push(url)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 p-3 border rounded">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs text-gray-600 mb-1">Recherche</label>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Titre, lieu, description" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Catégorie</label>
        <input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="Concert, Festival…" className="border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Trier par</label>
        <select value={sort} onChange={(e)=>setSort(e.target.value)} className="border rounded px-2 py-2">
          <option value="date">Date</option>
          <option value="title">Titre</option>
          <option value="price">Prix</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Ordre</label>
        <select value={order} onChange={(e)=>setOrder(e.target.value)} className="border rounded px-2 py-2">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
      <button className="px-3 py-2 bg-brand text-white rounded">Appliquer</button>
    </form>
  )
}