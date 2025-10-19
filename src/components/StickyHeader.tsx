"use client"
import { useEffect, useState } from 'react'

export default function StickyHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`sticky top-0 z-50 text-white transition-all duration-200 bg-gradient-to-r from-brand to-purple-700 ${scrolled ? 'bg-opacity-95 backdrop-blur-md shadow-md' : 'bg-opacity-90'}`}>
      {children}
    </header>
  )
}