"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BuyTicketButton({ eventId, priceCents }: { eventId: string, priceCents: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const handleBuyClick = async () => {
    setLoading(true)
    
    try {
      // Vérifier d'abord si l'utilisateur est connecté
      const profileRes = await fetch('/api/account/profile')
      
      if (!profileRes.ok) {
        // Pas connecté, rediriger vers login avec retour vers checkout
        const { showToast } = await import('./toast')
        showToast('Connectez-vous pour acheter un billet')
        router.push(`/auth/login?redirect=/checkout?eventId=${eventId}`)
        return
      }
      
      // Connecté, rediriger vers la page de checkout
      router.push(`/checkout?eventId=${eventId}` as any)
      
    } catch (error) {
      console.error('Error checking auth:', error)
      const { showToast } = await import('./toast')
      showToast('Erreur lors de la vérification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      disabled={loading} 
      onClick={handleBuyClick} 
      className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Chargement...
        </div>
      ) : (
        `Acheter ${(priceCents/100).toFixed(2)} €`
      )}
    </button>
  )
}
