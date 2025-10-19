'use client'
import { useRouter } from 'next/navigation'

export default function LogoutToken() {
  const router = useRouter()
  function logout() {
    try { localStorage.removeItem('fantasia_token') } catch {}
    router.push('/')
  }
  return (
    <button onClick={logout} className="text-sm text-white/90 hover:text-white">Déconnexion</button>
  )
}