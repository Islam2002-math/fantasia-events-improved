'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function FiltersBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [range, setRange] = useState<'today'|'week'|''>('')

  useEffect(() => {
    setMin(sp.get('priceMin') || '')
    setMax(sp.get('priceMax') || '')
  }, [sp])

  function applyPrice() {
    const p = new URLSearchParams(sp.toString())
    if (min) p.set('priceMin', min); else p.delete('priceMin')
    if (max) p.set('priceMax', max); else p.delete('priceMax')
    router.push(`/events?${p.toString()}`)
  }

  function applyDate(kind: 'today'|'week') {
    const now = new Date()
    const p = new URLSearchParams(sp.toString())
    if (kind === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const end = new Date(start.getTime() + 24*60*60*1000 - 1)
      p.set('dateFrom', start.toISOString())
      p.set('dateTo', end.toISOString())
      setRange('today')
    } else {
      const day = now.getDay() || 7 // lundi=1… dimanche=7
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - (day - 1))
      startOfWeek.setHours(0,0,0,0)
      const end = new Date(startOfWeek.getTime() + 7*24*60*60*1000 - 1)
      p.set('dateFrom', startOfWeek.toISOString())
      p.set('dateTo', end.toISOString())
      setRange('week')
    }
    router.push(`/events?${p.toString()}`)
  }

  function clearDates() {
    const p = new URLSearchParams(sp.toString())
    p.delete('dateFrom'); p.delete('dateTo')
    setRange('')
    router.push(`/events?${p.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-3 border rounded">
      <div>
        <label className="block text-xs text-gray-600 mb-1">Prix min (centimes)</label>
        <input value={min} onChange={(e)=>setMin(e.target.value)} className="border rounded px-2 py-1 w-36" placeholder="0" />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Prix max (centimes)</label>
        <input value={max} onChange={(e)=>setMax(e.target.value)} className="border rounded px-2 py-1 w-36" placeholder="5000" />
      </div>
      <button onClick={applyPrice} className="px-3 py-2 border rounded">Filtrer</button>
      <div className="ml-4 flex items-center gap-2">
        <span className="text-xs text-gray-600">Date rapide:</span>
        <button onClick={()=>applyDate('today')} className={`px-3 py-1.5 border rounded ${range==='today'?'bg-gray-100':''}`}>Aujourd’hui</button>
        <button onClick={()=>applyDate('week')} className={`px-3 py-1.5 border rounded ${range==='week'?'bg-gray-100':''}`}>Cette semaine</button>
        <button onClick={clearDates} className="px-3 py-1.5 border rounded">Effacer</button>
      </div>
    </div>
  )
}