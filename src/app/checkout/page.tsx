"use client"
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Event, User } from '@prisma/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Ticket from '@/components/Ticket'
import { validateCreditCard, TEST_CARDS, CardValidationResult } from '@/lib/cardValidation'

interface PaymentForm {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  email: string
  phone: string
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get('eventId')
  
  const [event, setEvent] = useState<Event | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [cardValidation, setCardValidation] = useState<CardValidationResult | null>(null)
  const [showTestCards, setShowTestCards] = useState(false)
  const [form, setForm] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    if (!eventId) {
      router.push('/events')
      return
    }
    
    Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.json()),
      fetch('/api/account/profile').then(r => r.ok ? r.json() : null)
    ]).then(([eventData, userData]) => {
      setEvent(eventData.event || eventData)
      setUser(userData?.user)
      if (userData?.user) {
        setForm(prev => ({
          ...prev,
          email: userData.user.email,
          cardholderName: userData.user.name || ''
        }))
      }
      setLoading(false)
    })
  }, [eventId, router])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      value = formatExpiry(value)
    } else if (field === 'cvv') {
      value = value.replace(/[^0-9]/gi, '').substring(0, 4)
    }
    
    const newForm = { ...form, [field]: value }
    setForm(newForm)
    
    // Validation en temps réel des cartes
    if (newForm.cardNumber && newForm.expiryDate && newForm.cvv && newForm.cardholderName) {
      const validation = validateCreditCard(
        newForm.cardNumber,
        newForm.expiryDate, 
        newForm.cvv,
        newForm.cardholderName
      )
      setCardValidation(validation)
    } else {
      setCardValidation(null)
    }
  }

  const isFormValid = () => {
    if (!form.email.includes('@')) return false
    
    // Vérifier la validation de la carte
    if (!cardValidation || !cardValidation.isValid) return false
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid() || !eventId) return
    
    setProcessing(true)
    
    try {
      // Simulation du traitement de paiement
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': document.cookie.split('; ').find(row => row.startsWith('csrf-token='))?.split('=')[1] || ''
        },
        body: JSON.stringify({
          eventId,
          paymentInfo: {
            cardNumber: form.cardNumber.replace(/\s/g, ''),
            cardholderName: form.cardholderName,
            email: form.email,
            phone: form.phone
          }
        }),
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        router.push(`/checkout/success?ticketId=${result.ticketId}&eventId=${eventId}` as any)
      } else {
        alert('Erreur lors du paiement')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Erreur lors du paiement')
    } finally {
      setProcessing(false)
    }
  }

  const useTestCard = (cardType: 'visa' | 'mastercard' | 'amex') => {
    const testCard = TEST_CARDS[cardType]
    setForm(prev => ({
      ...prev,
      cardNumber: testCard.number,
      expiryDate: testCard.expiry,
      cvv: testCard.cvv,
      cardholderName: testCard.name
    }))
    setShowTestCards(false)
    
    // Forcer la validation
    setTimeout(() => {
      const validation = validateCreditCard(
        testCard.number,
        testCard.expiry,
        testCard.cvv,
        testCard.name
      )
      setCardValidation(validation)
    }, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div>Chargement...</div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          Événement introuvable
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finaliser votre achat
          </h1>
          <p className="text-gray-600">
            Complétez vos informations de paiement pour obtenir votre billet
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire de paiement */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Informations de paiement</h2>
              <button
                type="button"
                onClick={() => setShowTestCards(!showTestCards)}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                🇺🇸 Cartes de test
              </button>
            </div>
            
            {/* Cartes de test */}
            {showTestCards && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-3">Cartes de test valides :</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => useTestCard('visa')}
                    className="text-left p-2 bg-white rounded border hover:bg-gray-50"
                  >
                    💳 <strong>Visa:</strong> 4242 4242 4242 4242 - 12/25 - 123
                  </button>
                  <button
                    type="button"
                    onClick={() => useTestCard('mastercard')}
                    className="text-left p-2 bg-white rounded border hover:bg-gray-50"
                  >
                    💳 <strong>Mastercard:</strong> 5555 5555 5555 4444 - 12/25 - 123
                  </button>
                  <button
                    type="button"
                    onClick={() => useTestCard('amex')}
                    className="text-left p-2 bg-white rounded border hover:bg-gray-50"
                  >
                    💳 <strong>American Express:</strong> 3782 8224 6310 005 - 12/25 - 1234
                  </button>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Numéro de carte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  value={form.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={19}
                  required
                />
              </div>

              {/* Expiry et CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    value={form.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/AA"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={form.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              {/* Nom du porteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom sur la carte
                </label>
                <input
                  type="text"
                  value={form.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Validation feedback */}
              {cardValidation && (
                <div className={`p-3 rounded-lg border ${cardValidation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center mb-2">
                    <span className="mr-2">{cardValidation.isValid ? '✅' : '❌'}</span>
                    <span className={`font-medium ${cardValidation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                      {cardValidation.isValid ? `Carte ${cardValidation.cardType} valide` : 'Carte invalide'}
                    </span>
                  </div>
                  {!cardValidation.isValid && cardValidation.errors.length > 0 && (
                    <ul className="text-red-700 text-sm space-y-1">
                      {cardValidation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Email et téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="jean@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Aperçu du billet */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showPreview ? '🙈 Masquer' : '👀 Aperçu du billet'}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFormValid() || processing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Traitement en cours...
                  </div>
                ) : (
                  `💳 Payer ${(event.priceCents / 100).toFixed(2)} €`
                )}
              </button>
            </form>
          </div>

          {/* Résumé de commande et aperçu */}
          <div className="space-y-6">
            {/* Résumé événement */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Résumé de votre commande</h3>
              
              {event.imageUrl && (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">{event.title}</h4>
                <p className="text-gray-600">{event.location}</p>
                <p className="text-gray-600">
                  📅 {format(new Date(event.date), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                </p>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">{(event.priceCents / 100).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aperçu du billet */}
            {showPreview && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Aperçu de votre billet</h3>
                <Ticket
                  event={event}
                  user={user || undefined}
                  ticketId="preview-ticket"
                  qrPayload={`preview:${eventId}:${Date.now()}`}
                  className="transform scale-90"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}