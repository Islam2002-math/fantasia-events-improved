"use client"
import { Event, User } from '@prisma/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

interface TicketProps {
  event: Event
  user?: User
  ticketId: string
  qrPayload: string
  className?: string
  usedAt?: Date | null
  generatedName?: string
}

export default function Ticket({ event, user, ticketId, qrPayload, className = "", usedAt, generatedName }: TicketProps) {
  const [qrCode, setQrCode] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 4,
      errorCorrectionLevel: 'H', // Haute correction d'erreur pour meilleure lecture
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }).then(setQrCode)
  }, [qrPayload])

  // Couleur basée sur la catégorie
  const getCategoryColor = (category?: string | null) => {
    const colors = {
      'Concert': 'from-purple-500 to-pink-500',
      'Festival': 'from-orange-500 to-red-500',
      'Théâtre': 'from-blue-500 to-indigo-500',
      'Sport': 'from-green-500 to-teal-500',
      'Conférence': 'from-gray-500 to-slate-500',
    }
    return colors[(category || '') as keyof typeof colors] || 'from-indigo-500 to-purple-500'
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE d MMMM yyyy", { locale: fr })
  }

  const formatTime = (date: Date) => {
    return format(new Date(date), "HH:mm", { locale: fr })
  }

  return (
    <div className={`max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header avec gradient basé sur la catégorie */}
      <div className={`bg-gradient-to-r ${getCategoryColor(event.category)} p-6 text-white relative`}>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="currentColor" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="text-sm font-medium opacity-90 uppercase tracking-wide mb-1">
            {event.category || 'Événement'}
          </div>
          <h1 className="text-xl font-bold mb-2 leading-tight">
            {event.title}
          </h1>
          <div className="text-sm opacity-90">
            Billet #️⃣ {ticketId.slice(-8).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Corps du billet */}
      <div className="p-6 space-y-4">
        {/* Détails de l'événement */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              📅 Date
            </div>
            <div className="text-sm font-medium text-gray-900 capitalize">
              {formatDate(event.date)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              🕐 Heure
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatTime(event.date)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            📍 Lieu
          </div>
          <div className="text-sm font-medium text-gray-900">
            {event.location}
          </div>
        </div>

        {user && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              👤 Titulaire
            </div>
            <div className="text-sm font-medium text-gray-900">
              {user.name || user.email}
            </div>
          </div>
        )}

        {/* Statut de validation */}
        {usedAt && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              ✅ Statut
            </div>
            <div className="text-sm font-medium text-green-600">
              Validé le {format(new Date(usedAt), "dd/MM/yyyy à HH:mm")}
            </div>
          </div>
        )}

        {/* Nom généré lors de la validation */}
        {generatedName && (
          <div className="bg-purple-50 rounded-lg p-3 mt-2">
            <div className="text-xs text-purple-600 uppercase tracking-wide font-semibold mb-1">
              🌟 Nom de visite
            </div>
            <div className="text-lg font-bold text-purple-700">
              {generatedName}
            </div>
          </div>
        )}

        {/* Prix */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Prix payé</span>
            <span className="text-lg font-bold text-green-600">
              {(event.priceCents / 100).toFixed(2)} €
            </span>
          </div>
        </div>

        {/* QR Code */}
        {qrCode && (
          <div className="border-t pt-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Code d'entrée
              </div>
              <div className="relative inline-block">
                <img 
                  src={qrCode} 
                  alt="QR Code d'entrée"
                  className="mx-auto rounded-lg border-2 border-gray-200 max-w-full h-auto cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    // Ouvrir le QR code en grand dans une nouvelle fenêtre
                    const newWindow = window.open('', '_blank', 'width=400,height=400')
                    if (newWindow) {
                      newWindow.document.write(`
                        <html>
                          <head>
                            <title>QR Code - ${event.title}</title>
                            <style>
                              body { margin: 0; padding: 20px; text-align: center; background: #f5f5f5; }
                              img { max-width: 100%; height: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                              h3 { color: #333; font-family: Arial, sans-serif; }
                              p { color: #666; font-family: Arial, sans-serif; font-size: 14px; }
                            </style>
                          </head>
                          <body>
                            <h3>🎫 ${event.title}</h3>
                            <img src="${qrCode}" alt="QR Code" />
                            <p>Présentez ce QR code à l'entrée</p>
                            <p>Billet: ${ticketId.slice(-8).toUpperCase()}</p>
                          </body>
                        </html>
                      `)
                      newWindow.document.close()
                    }
                  }}
                  style={{ minWidth: '200px', minHeight: '200px' }}
                />
                <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                  🔍 Cliquer pour agrandir
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-3 space-y-2">
                <div>Présentez ce code à l'entrée</div>
                <a 
                  href={`/qr/${ticketId}`}
                  target="_blank"
                  className="inline-block bg-indigo-600 text-white px-3 py-2 rounded text-xs hover:bg-indigo-700 transition-colors"
                >
                  Ouvrir sur mobile
                </a>
                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    🔧 Code technique
                  </summary>
                  <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1 break-all">
                    {qrPayload}
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer décoratif */}
      <div className={`bg-gradient-to-r ${getCategoryColor(event.category)} h-2`}></div>
      
      {/* Perforations simulées */}
      <div className="relative">
        <div className="absolute -top-1 left-0 right-0 flex justify-between px-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-100 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  )
}