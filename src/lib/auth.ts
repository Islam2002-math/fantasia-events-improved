import { headers, cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export type AuthUser = { userId?: string; email?: string; role?: string }

export async function getUserFromRequest(): Promise<AuthUser | null> {
  // Try Authorization: Bearer <sealed>
  try {
    const h = headers()
    const auth = h.get('authorization') || ''
    if (auth.toLowerCase().startsWith('bearer ')) {
      const sealed = auth.slice(7).trim()
      if (sealed) {
        const s = await getSession<AuthUser>(sealed).catch(() => null)
        if (s?.userId) return s
      }
    }
  } catch {}
  // Fallback to cookie session
  try {
    const sealed = cookies().get('fantasia_session')?.value
    if (sealed) {
      const s = await getSession<AuthUser>(sealed).catch(() => null)
      if (s?.userId) return s
    }
  } catch {}
  return null
}