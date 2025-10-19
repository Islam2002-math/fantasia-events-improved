"use client"

export function setAuthToken(token: string) {
  try { localStorage.setItem('fantasia_token', token) } catch {}
}

export function getAuthToken(): string | null {
  try { return localStorage.getItem('fantasia_token') } catch { return null }
}

export function clearAuthToken() {
  try { localStorage.removeItem('fantasia_token') } catch {}
}

export function buildAuthHeaders(extra?: Record<string,string>) {
  const token = getAuthToken()
  const headers: Record<string,string> = { ...(extra || {}) }
  if (token) headers['authorization'] = `Bearer ${token}`
  return headers
}
