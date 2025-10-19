"use client"
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Event, User, Ticket as TicketType } from '@prisma/client'
import Ticket from '@/components/Ticket'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ticketId = searchParams.get('ticketId')
  const eventId = searchParams.get('eventId')
  
  const [ticket, setTicket] = useState<TicketType | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    if (!ticketId || !eventId) {
      router.push('/events')
      return
    }
    
    Promise.all([
      fetch(`/api/tickets/${ticketId}`).then(r => r.json()),
      fetch(`/api/events/${eventId}`).then(r => r.json()),
      fetch('/api/account/profile').then(r => r.ok ? r.json() : null)
    ]).then(([ticketData, eventData, userData]) => {
      setTicket(ticketData.ticket || ticketData)
      setEvent(eventData.event || eventData)
      setUser(userData?.user)
      setLoading(false)
    }).catch(error => {
      console.error('Error loading ticket data:', error)
      setLoading(false)
    })
  }, [ticketId, eventId, router])

  const handleDownloadTicket = () => {
    // Créer un canvas pour l'image du billet
    const ticketElement = document.getElementById('ticket-component')
    if (!ticketElement) return

    // Utiliser html2canvas ou une solution similaire pour convertir en image
    // Pour l'instant, on simule le téléchargement
    const link = document.createElement('a')
    link.href = `/api/tickets/${ticketId}/download`
    link.download = `billet-${event?.title?.replace(/\s+/g, '-')}-${ticketId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setDownloaded(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const shareTicket = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: `Billet pour ${event.title}`,
          text: `J'ai mon billet pour ${event.title} !`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Partage annulé')
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier !')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div>Génération de votre billet...</div>
        </div>
      </div>
    )
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Billet introuvable</h1>
          <Link href="/events" className="text-indigo-600 hover:underline">
            Retour aux événements
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Animation de succès */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 Paiement réussi !
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Votre billet a été généré avec succès
          </p>
          <p className="text-sm text-gray-500">
            Un email de confirmation a été envoyé à {user?.email}
          </p>
        </div>

        {/* Le beau billet */}
        <div id="ticket-component" className="mb-8">
          <Ticket
            event={event}
            user={user || undefined}
            ticketId={ticket.id}
            qrPayload={ticket.qrCode}
          />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Actions disponibles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadTicket}
              className="bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center font-medium"
            >
              {downloaded ? '✅ Téléchargé' : '💾 Télécharger'}
            </button>
            
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center justify-center font-medium"
            >
              🖨️ Imprimer
            </button>
            
            <button
              onClick={shareTicket}
              className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center font-medium"
            >
              📱 Partager
            </button>
          </div>
        </div>

        {/* Informations importantes */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Informations importantes
          </h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Conservez ce billet dans un endroit sûr</li>
            <li>• Présentez le QR code à l'entrée de l'événement</li>
            <li>• Vérifiez la date et l'heure de l'événement</li>
            <li>• En cas de problème, contactez notre support</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account"
            className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-200 text-center font-medium"
          >
            📱 Mon compte
          </Link>
          
          <Link
            href="/events"
            className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-200 text-center font-medium"
          >
            🎪 Autres événements
          </Link>
        </div>

        {/* Style pour l'impression */}
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #ticket-component, #ticket-component * {
              visibility: visible;
            }
            #ticket-component {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  )
}