export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Fantasia Events
        </h1>
        <p className="text-gray-600 mb-6">
          Site d'événements avec système de paiement et QR
        </p>
        <div className="space-y-4">
          <a 
            href="/events" 
            className="block w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Voir les événements
          </a>
          <a 
            href="/auth/login" 
            className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Se connecter
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Version simplifiée pour déploiement
        </p>
      </div>
    </div>
  )
}