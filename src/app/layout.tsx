import '@/styles/globals.css'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'
import LogoutButton from '@/components/LogoutButton'
import ThemeToggle from '@/components/ThemeToggle'
import StickyHeader from '@/components/StickyHeader'
import AuthNavClient from '@/components/AuthNavClient'

export const metadata: Metadata = {
  title: 'Fantasia Events',
  description: 'Billetterie moderne avec IA pour concerts et annonces',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sealed = cookies().get('fantasia_session')?.value
  let userId: string | null = null
  if (sealed) {
    const s = await getSession<{ userId?: string }>(sealed).catch(()=>null)
    userId = s?.userId ?? null
  }
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-gray-900" suppressHydrationWarning>
        {/* Global overlay to reduce background intensity (adjust opacity as you like) */}
        <div className="fixed inset-0 -z-10 bg-white/70 dark:bg-black/60" aria-hidden="true" />
        <StickyHeader>
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-semibold text-lg tracking-wide">
              <img src="/logo-fantasia.png" alt="Fantasian Events" className="h-8 w-8 rounded shadow-sm" />
              <span>Fantasian Events</span>
            </a>
            <nav className="flex items-center gap-4 text-sm">
              {/* Navigation client qui s’adapte au jeton (sans cookies) */}
              <AuthNavClient />
              <ThemeToggle />
            </nav>
          </div>
        </StickyHeader>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Fantasia Events</footer>
      </body>
    </html>
  )
}
