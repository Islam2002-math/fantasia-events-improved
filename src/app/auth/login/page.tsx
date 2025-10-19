"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const csrf = (await import('@/components/useCsrf')).getCsrfToken()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      const j = await res.json().catch(() => ({}))
      if (j.token) {
        const { setAuthToken } = await import('@/components/authClient')
        setAuthToken(j.token)
      }
      router.push('/account')
    } else {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Échec de connexion')
    }
    setLoading(false)
  }

  return (
    <section className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Se connecter</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="px-4 py-2 rounded bg-brand text-white disabled:opacity-60">{loading ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </section>
  )
}