'use client'
import { useState, useEffect } from 'react'

interface LogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  context?: string
  userId?: string
}

interface LogStats {
  totalLogs: number
  recentLogs: number
  errorCount: number
  warnCount: number
  infoCount: number
}

export default function DebugPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('level', filter)
      
      const response = await fetch(`/api/debug/logs?${params.toString()}`)
      const data = await response.json()
      
      setLogs(data.logs || [])
      setStats(data.stats || null)
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filter])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 3000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, filter])

  const getLevelColor = (level: string) => {
    const colors = {
      error: 'text-red-600 bg-red-50',
      warn: 'text-yellow-600 bg-yellow-50',
      info: 'text-blue-600 bg-blue-50',
      debug: 'text-gray-600 bg-gray-50'
    }
    return colors[level as keyof typeof colors] || 'text-gray-600'
  }

  const exportLogs = () => {
    window.open('/api/debug/logs?format=export', '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-6">🔍 Diagnostic Fantasia Events</h1>
        <div className="text-center">Chargement des diagnostics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Diagnostic Fantasia Events</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-800">{stats.totalLogs}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.recentLogs}</div>
              <div className="text-sm text-gray-600">Récents (1h)</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
              <div className="text-sm text-gray-600">Erreurs</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.warnCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.infoCount}</div>
              <div className="text-sm text-gray-600">Info</div>
            </div>
          </div>
        )}

        {/* Contrôles */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par niveau :
              </label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="all">Tous</option>
                <option value="error">Erreurs</option>
                <option value="warn">Warnings</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Actualisation auto (3s)</span>
              </label>

              <button
                onClick={fetchLogs}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                🔄 Actualiser
              </button>

              <button
                onClick={exportLogs}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                📥 Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Logs récents ({logs.length})
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucun log trouvé
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString('fr-FR')}
                          </span>
                          {log.userId && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              User: {log.userId}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-800 font-medium mb-1">
                          {log.message}
                        </div>
                        {log.context && (
                          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded mt-2">
                            {log.context}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Guide de dépannage */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">🛠️ Guide de dépannage</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-red-600">❌ Si vous voyez des erreurs de base de données :</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Vérifiez que DATABASE_URL est configuré dans .env</li>
                <li>Testez la connexion : <code className="bg-gray-100 px-1 rounded">npx prisma db pull</code></li>
                <li>Redémarrez le serveur : <code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-yellow-600">⚠️ Si vous voyez des warnings :</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Les warnings sont normaux, mais surveillez leur fréquence</li>
                <li>Vérifiez les variables d&apos;environnement manquantes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-600">ℹ️ Commandes utiles :</h3>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div><code className="bg-gray-100 px-1 rounded">./debug.ps1</code> - Script de diagnostic complet</div>
                <div><code className="bg-gray-100 px-1 rounded">npm run build</code> - Vérifier la compilation</div>
                <div><code className="bg-gray-100 px-1 rounded">npx prisma studio</code> - Interface base de données</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}