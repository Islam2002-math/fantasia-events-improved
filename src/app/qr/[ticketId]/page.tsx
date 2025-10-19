"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Event, User, Ticket } from '@prisma/client'
import QRCode from 'qrcode'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function QRCodePage() {
  const params = useParams()
  const ticketId = params.ticketId as string
  
  const [ticket, setTicket] = useState<Ticket & { event: Event, user: User } | null>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [brightness, setBrightness] = useState(100)

  useEffect(() => {
    if (ticketId) {
      fetch(`/api/tickets/${ticketId}`)
        .then(res => res.json())
        .then(data => {
          if (data.ticket) {
            setTicket(data.ticket)
            // Générer un QR code extra grand pour scanning
            return QRCode.toDataURL(data.ticket.qrCode, {
              width: 600,
              margin: 6,
              errorCorrectionLevel: 'H',
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            })
          }
        })
        .then(qr => {
          if (qr) setQrCode(qr)
          setLoading(false)
        })
        .catch(error => {
          console.error('Error loading ticket:', error)
          setLoading(false)
        })
    }
  }, [ticketId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div>Chargement du QR code...</div>
        </div>
      </div>
    )
  }

  if (!ticket || !qrCode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <h1 className="text-xl font-bold mb-2">Billet introuvable</h1>
          <p>Ce QR code n'est pas valide</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header minimaliste */}
      <div className="text-center p-4 border-b">
        <h1 className="text-lg font-semibold text-gray-900">🎫 QR Code d'entrée</h1>
        <p className="text-sm text-gray-600">{ticket.event.title}</p>
      </div>

      {/* QR Code principal - optimisé pour scanning */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div 
          className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200"
          style={{ filter: `brightness(${brightness}%)` }}
        >
          <img 
            src={qrCode}
            alt="QR Code d'entrée"
            className="max-w-full h-auto"
            style={{ 
              minWidth: '280px',
              minHeight: '280px',
              maxWidth: '400px',
              imageRendering: 'pixelated' // Améliore la netteté
            }}
          />
        </div>

        {/* Contrôle de luminosité */}
        <div className="mt-6 w-full max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            🔆 Luminosité: {brightness}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Informations du billet */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-lg font-semibold text-gray-900">
            {ticket.event.title}
          </div>
          <div className="text-sm text-gray-600">
            📅 {format(new Date(ticket.event.date), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
          </div>
          <div className="text-sm text-gray-600">
            📍 {ticket.event.location}
          </div>
          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded">
            #{ticketId.slice(-8).toUpperCase()}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
          <h3 className="font-semibold text-blue-900 text-center mb-2">
            📱 Instructions de scan
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Présentez cet écran à l'entrée</li>
            <li>• Ajustez la luminosité si nécessaire</li>
            <li>• Gardez l'écran stable pendant le scan</li>
            <li>• En cas de problème, montrez le code en bas</li>
          </ul>
        </div>

        {/* Code QR en texte pour dépannage */}
        <details className="mt-4 max-w-sm w-full">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
            🔧 Code de dépannage (cliquer pour voir)
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono break-all">
            {ticket.qrCode}
          </div>
        </details>

        {/* Actions rapides */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `QR Code - ${ticket.event.title}`,
                  url: window.location.href
                })
              } else {
                navigator.clipboard.writeText(window.location.href)
                alert('Lien copié !')
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            📤 Partager
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
          >
            🖨️ Imprimer
          </button>
        </div>
      </div>

      {/* Style pour l'impression */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            text-align: center;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}