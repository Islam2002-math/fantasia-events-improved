"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function AIAssistant() {
  const router = useRouter()
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<{
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
    context?: {
      type: 'recommendation' | 'search' | 'action';
      data?: any
    }
  }[]>([
    {
      role: 'assistant',
      text: 'Bonjour ! 👋 Je suis votre assistant Fantasia intelligent. Je peux vous aider à trouver des événements, acheter des billets, ou répondre à vos questions. Que puis-je faire pour vous ?',
      timestamp: new Date()
    }
  ])

  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([
    'Recommande-moi un concert ce week-end',
    'Comment acheter un billet ?',
    'Quels sont les événements populaires ?'
  ])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  // Typing effect for assistant responses
  const [isTyping, setIsTyping] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || busy) return

    const userText = input.trim()
    setInput('')

    // Add user message
    setMessages(m => [...m, {
      role: 'user',
      text: userText,
      timestamp: new Date()
    }])

    setBusy(true)
    setIsTyping(true)

    try {
      const csrf = (await import('./useCsrf')).getCsrfToken()
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
        body: JSON.stringify({ message: userText })
      })

      if (!res.ok) throw new Error('API error')

      const j = await res.json()

      // Simulate typing delay for better UX
      setTimeout(() => {
        const assistantMessage = {
          role: 'assistant' as const,
          text: j.reply || 'Désolé, une erreur est survenue.',
          timestamp: new Date(),
          context: parseMessageContext(j.reply)
        }

        setMessages(m => [...m, assistantMessage])
        setBusy(false)
        setIsTyping(false)

        // Update suggestions based on conversation context
        updateSuggestions(userText, assistantMessage.text)
      }, 600)

    } catch (error) {
      console.error('Chat error:', error)
      setTimeout(() => {
        setMessages(m => [...m, {
          role: 'assistant',
          text: 'Désolé, j\'ai un problème technique. Veuillez réessayer dans quelques instants ou contacter le support.',
          timestamp: new Date()
        }])
        setBusy(false)
        setIsTyping(false)
      }, 1000)
    }
  }

  function parseMessageContext(reply: string): any | undefined {
    // Extract contextual information from AI responses
    if (reply.includes('événement') || reply.includes('concerts') || reply.includes('recommandations')) {
      return { type: 'recommendation' }
    }
    if (reply.includes('billet') || reply.includes('acheter') || reply.includes('prix')) {
      return { type: 'search' }
    }
    if (reply.includes('aller sur') || reply.includes('cliquez sur')) {
      return { type: 'action' }
    }
    return undefined
  }

  function updateSuggestions(userMessage: string, aiResponse: string) {
    // Smart suggestion updates based on conversation flow
    const lowerUser = userMessage.toLowerCase()
    const lowerAI = aiResponse.toLowerCase()

    if (lowerUser.includes('concert') || lowerAI.includes('concert')) {
      setSuggestions([
        'Recommande-moi d\'autres concerts similaires',
        'Prochains festivals musicaux',
        'Shows plus populaires ce mois'
      ])
    } else if (lowerUser.includes('billet') || lowerAI.includes('billet')) {
      setSuggestions([
        'Comment récupérer mon QR code ?',
        'Peut-on annuler une réservation ?',
        'Méthodes de paiement acceptées'
      ])
    } else if (lowerAI.includes('recommandation') || lowerAI.includes('personnalisée')) {
      setSuggestions([
        'Montrer plus de recommandations',
        'Pourquoi ces suggestions ?',
        'Événements dans d\'autres catégories'
      ])
    } else {
      setSuggestions([
        'Découvrir les événements populaires',
        'Aide avec l\'achat de billets',
        'Trouver des événements près de chez-moi'
      ])
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setInput(suggestion.replace(/"/g, ''))
    inputRef.current?.focus()
  }

  function handleQuickAction(type: string, data?: any) {
    // Handle quick actions embedded in AI responses
    switch (type) {
      case 'recommendation':
        router.push('/events?q=recommandations')
        break
      case 'search':
        router.push(`/events?category=${encodeURIComponent('Concerts')}`)
        break
      case 'action':
        // Navigate to account page for profile/tickets
        router.push('/account')
        break
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          🤖 Assistant IA Fantasia
          <span className={`text-xs px-2 py-1 rounded-full ${
            busy ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {busy ? 'Réfléchit...' : 'Disponible'}
          </span>
        </h2>
        <button
          onClick={() => setMessages([{ role: 'assistant', text: 'Conversation réinitialisée. Comment puis-je vous aider ?', timestamp: new Date() }])}
          className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          title="Réinitialiser la conversation"
        >
          🔄
        </button>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesRef}
        className="space-y-3 max-h-80 overflow-y-auto p-2 border rounded bg-gray-50 dark:bg-gray-800"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-lg shadow-sm ${
              m.role === 'user'
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm border'
            }`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
              {m.context && (
                <button
                  onClick={() => handleQuickAction(m.context!.type, m.context!.data)}
                  className="mt-2 text-xs px-2 py-1 bg-brand/20 hover:bg-brand/30 text-brand rounded border-0"
                >
                  {m.context.type === 'recommendation' ? 'Voir plus de recommandations 🎯' :
                   m.context.type === 'search' ? 'Rechercher maintenant 🔍' :
                   'Aller à la page →'}
                </button>
              )}
              <p className="text-xs opacity-60 mt-1">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg rounded-bl-sm border shadow-sm">
              <div className="flex items-center gap-1">
                <span className="text-sm">Fantasia réfléchit</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {!busy && suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Suggestions rapides :</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                disabled={busy}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={send} className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          placeholder="Posez votre question à Fantasia…"
          disabled={busy}
          maxLength={500}
        />
        <button
          disabled={busy || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {busy ? '...' : '✨ Envoi'}
        </button>
      </form>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        💡 Posez-moi des questions sur les événements, billets, ou fonctionnalités de la plateforme
      </p>
    </div>
  )
}
