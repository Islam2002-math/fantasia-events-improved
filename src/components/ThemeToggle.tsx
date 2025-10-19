"use client"
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [ready, setReady] = useState(false)
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    setReady(true)
    let dark = false
    try {
      const stored = localStorage.getItem('theme')
      dark = stored ? stored === 'dark' : false
    } catch {
      // localStorage indisponible (bloqué par le navigateur) → on ne persiste pas mais on ne casse pas l’UI
      dark = false
    }
    setIsDark(dark)
    try { document.documentElement.classList.toggle('dark', dark) } catch {}
  }, [])
  function toggle() {
    const next = !isDark
    setIsDark(next)
    try { document.documentElement.classList.toggle('dark', next) } catch {}
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }
  if (!ready) return null
  return (
    <button onClick={toggle} className="text-sm px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
      {isDark ? 'Clair' : 'Sombre'}
    </button>
  )
}
