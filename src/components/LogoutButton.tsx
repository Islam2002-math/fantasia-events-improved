"use client"
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await fetch('/api/auth/logout', { method: 'DELETE' })
    router.push('/')
  }
  return (
    <button onClick={logout} className="text-sm text-gray-700 hover:text-brand">Se déconnecter</button>
  )
}