"use client"
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|; )csrf-token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}