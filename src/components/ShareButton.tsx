"use client"
import { useState } from 'react'

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(()=>setCopied(false), 1500)
      } catch {}
    }
  }
  return (
    <button onClick={share} className="px-3 py-2 border rounded">
      {copied ? 'Lien copié' : 'Partager'}
    </button>
  )
}