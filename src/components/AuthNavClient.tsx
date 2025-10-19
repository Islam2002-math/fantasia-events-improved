'use client'
import Link from 'next/link'
import LogoutToken from '@/components/LogoutToken'
import { useEffect, useState } from 'react'

export default function AuthNavClient() {
  const [hasToken, setHasToken] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  useEffect(() => {
    // Détecte un éventuel token local (compat), puis tente de lire le profil (cookie ou token)
    try { setHasToken(!!localStorage.getItem('fantasia_token')) } catch { setHasToken(false) }
    ;(async () => {
      try {
        const { buildAuthHeaders } = await import('@/components/authClient')
        const res = await fetch('/api/account/profile', { headers: buildAuthHeaders(), credentials: 'include' })
        if (res.ok) {
          const j = await res.json()
          if (j.user?.role === 'ADMIN') setIsAdmin(true)
        }
      } catch {}
    })()
  }, [])
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link className="text-white/90 hover:text-white" href="/">Accueil</Link>
      <Link className="text-white/90 hover:text-white" href="/events">Événements</Link>
      <Link className="text-white/90 hover:text-white" href="/contact">Contact</Link>
      {isAdmin && <Link className="text-white/90 hover:text-white" href="/admin/events">Admin</Link>}
      {hasToken ? (
        <>
          <Link className="text-white/90 hover:text-white" href="/account">Mon compte</Link>
          <LogoutToken />
        </>
      ) : (
        <>
          <Link className="text-white/90 hover:text-white" href="/auth/login">Connexion</Link>
          <Link className="text-white/90 hover:text-white" href="/auth/register">Créer un compte</Link>
        </>
      )}
    </div>
  )
}
