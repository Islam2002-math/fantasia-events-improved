"use client"
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Event, User, Ticket } from '@prisma/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface VerificationResult {
  valid: boolean
  ticket?: Ticket & {
    event: Event
    user: User
  }
  generatedName?: string
  validationCode?: string
  welcome?: string
  message: string
  alreadyUsed?: boolean
  error?: string
}

export default function VerifyTicketPage() {
  const searchParams = useSearchParams()
  const qrFromUrl = searchParams.get('qr')
  
  const [qrCode, setQrCode] = useState(qrFromUrl || '')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (qrFromUrl) {
      handleCheck()
    }
  }, [qrFromUrl])

  const handleCheck = async () => {
    if (!qrCode.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/tickets/validate?qr=${encodeURIComponent(qrCode)}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        valid: false,
        message: 'Erreur de connexion'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!qrCode.trim() || !result?.valid || result.alreadyUsed) return

    setIsValidating(true)

    try {
      const response = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode }),
      })

      const data = await response.json()
      setResult(data)

      if (data.valid) {
        // Jouer un son de succès (optionnel)
        // new Audio('/sounds/success.mp3').play().catch(() => {})
      }
    } catch (error) {
      setResult({
        valid: false,
        message: 'Erreur lors de la validation'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const getStatusColor = () => {
    if (!result) return 'border-gray-300'
    if (result.valid && !result.alreadyUsed && !result.generatedName) return 'border-green-500'
    if (result.valid && result.generatedName) return 'border-purple-500'
    if (result.alreadyUsed) return 'border-yellow-500'
    return 'border-red-500'
  }

  const getStatusIcon = () => {
    if (!result) return '🔍'
    if (result.valid && result.generatedName) return '🎉'
    if (result.valid && !result.alreadyUsed) return '✅'
    if (result.alreadyUsed) return '⚠️'
    return '❌'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎫 Vérification des Billets
          </h1>
          <p className="text-gray-600">
            Scannez ou saisissez le QR code pour vérifier un billet
          </p>
        </div>

        {/* Input QR Code */}
        <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 border-2 ${getStatusColor()}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code QR du billet
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="ticket:event123:user456:1234567890"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading || isValidating}
            />
            <button
              onClick={handleCheck}
              disabled={loading || !qrCode.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Vérification...
                </div>
              ) : (
                '🔍 Vérifier'
              )}
            </button>
          </div>
        </div>

        {/* Résultat */}
        {result && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
              result.valid && result.generatedName
                ? 'border-purple-500 bg-purple-50'
                : result.valid && !result.alreadyUsed
                ? 'border-green-500 bg-green-50'
                : result.alreadyUsed
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-red-500 bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{getStatusIcon()}</span>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {result.valid && result.generatedName
                        ? 'Billet Validé !'
                        : result.valid && !result.alreadyUsed
                        ? 'Billet Valide'
                        : result.alreadyUsed
                        ? 'Déjà Utilisé'
                        : 'Billet Invalide'
                      }
                    </h2>
                    <p className="text-gray-600">{result.message}</p>
                  </div>
                </div>

                {/* Bouton de validation */}
                {result.valid && !result.alreadyUsed && !result.generatedName && (
                  <button
                    onClick={handleValidate}
                    disabled={isValidating}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {isValidating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Validation...
                      </div>
                    ) : (
                      '✅ Valider l\'entrée'
                    )}
                  </button>
                )}
              </div>

              {/* Nom généré */}
              {result.generatedName && (
                <div className="bg-purple-100 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    🌟 Nom de visite généré
                  </h3>
                  <p className="text-2xl font-bold text-purple-700">
                    {result.generatedName}
                  </p>
                  {result.validationCode && (
                    <p className="text-sm text-purple-600 mt-2">
                      Code de validation : <span className="font-mono font-bold">{result.validationCode}</span>
                    </p>
                  )}
                  <p className="text-purple-600 mt-2">
                    {result.welcome}
                  </p>
                </div>
              )}
            </div>

            {/* Détails du billet */}
            {result.ticket && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Détails du billet</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                      Événement
                    </label>
                    <p className="text-lg font-medium">{result.ticket.event.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                      Date & Heure
                    </label>
                    <p className="text-lg font-medium">
                      {format(new Date(result.ticket.event.date), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                      Lieu
                    </label>
                    <p className="text-lg font-medium">{result.ticket.event.location}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                      Prix payé
                    </label>
                    <p className="text-lg font-medium text-green-600">
                      {(result.ticket.event.priceCents / 100).toFixed(2)} €
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                      Porteur
                    </label>
                    <p className="text-lg font-medium">
                      {result.ticket.user.name || result.ticket.user.email}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                      Billet ID
                    </label>
                    <p className="text-sm font-mono text-gray-600">
                      {result.ticket.id.slice(-12).toUpperCase()}
                    </p>
                  </div>
                </div>

                {result.ticket.usedAt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      <strong>Utilisé le :</strong> {format(new Date(result.ticket.usedAt), "dd/MM/yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setQrCode('')
                  setResult(null)
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                🔄 Nouveau scan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}