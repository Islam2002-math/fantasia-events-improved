"use client"
import { useState } from 'react'

export default function QRScannerPage() {
  const [manualCode, setManualCode] = useState('')

  const handleManualCheck = () => {
    if (manualCode.trim()) {
      window.location.href = `/verify?qr=${encodeURIComponent(manualCode)}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 Scanner QR
          </h1>
          <p className="text-gray-600">
            Interface pour vérifier les billets à l'entrée
          </p>
        </div>

        {/* Manuel Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Saisie manuelle</h2>
          <p className="text-gray-600 mb-4">
            Saisissez le code QR si vous ne pouvez pas scanner
          </p>
          
          <div className="space-y-4">
            <textarea
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="ticket:cmgy3gxmi000214oerorzwa5u:cmgy3hjw90000yq9wn30uv8u1:1729368320123"
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
            />
            
            <button
              onClick={handleManualCheck}
              disabled={!manualCode.trim()}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              🔍 Vérifier le billet
            </button>
          </div>
        </div>

        {/* Camera Scanner (Future) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Scanner caméra</h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-600 mb-4">
              Scanner caméra à venir dans une future mise à jour
            </p>
            <p className="text-sm text-gray-500">
              En attendant, utilisez la saisie manuelle ci-dessus
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Instructions
          </h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Demandez au visiteur de présenter son QR code</li>
            <li>• Copiez le texte du QR code dans le champ ci-dessus</li>
            <li>• Cliquez sur "Vérifier" pour valider le billet</li>
            <li>• Si valide, cliquez sur "Valider l'entrée" pour marquer comme utilisé</li>
            <li>• Un nom amusant sera généré pour le visiteur !</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          <a
            href="/verify"
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium block"
          >
            🎫 Page de vérification
          </a>
          
          <a
            href="/admin/events"
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center font-medium block"
          >
            🏠 Retour admin
          </a>
        </div>
      </div>
    </div>
  )
}