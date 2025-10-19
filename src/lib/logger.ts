// Utilitaire de logging pour Fantasia Events
// Usage: import { logger } from '@/lib/logger'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  error?: Error
  userId?: string
  ip?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output avec couleurs
    const colors = {
      error: '\x1b[31m', // Rouge
      warn: '\x1b[33m',  // Jaune
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[37m'  // Blanc
    }
    const reset = '\x1b[0m'
    const color = colors[entry.level] || reset

    console.log(`${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} ${entry.message}`)
    if (entry.error) {
      console.log(`${color}Stack:${reset}`, entry.error.stack)
    }
    if (entry.context) {
      console.log(`${color}Context:${reset} ${entry.context}`)
    }
  }

  error(message: string, error?: Error, context?: string, userId?: string) {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: 'error',
      message,
      context,
      error,
      userId
    })
  }

  warn(message: string, context?: string, userId?: string) {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: 'warn',
      message,
      context,
      userId
    })
  }

  info(message: string, context?: string, userId?: string) {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: 'info',
      message,
      context,
      userId
    })
  }

  debug(message: string, context?: string, userId?: string) {
    if (process.env.NODE_ENV === 'development') {
      this.addLog({
        timestamp: this.formatTimestamp(),
        level: 'debug',
        message,
        context,
        userId
      })
    }
  }

  // Obtenir les logs récents pour le debugging
  getRecentLogs(limit = 50, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level)
    }
    return filteredLogs.slice(-limit)
  }

  // Obtenir des statistiques d'erreurs
  getErrorStats() {
    const now = Date.now()
    const oneHourAgo = now - 3600000
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > oneHourAgo
    )

    return {
      totalLogs: this.logs.length,
      recentLogs: recentLogs.length,
      errorCount: recentLogs.filter(log => log.level === 'error').length,
      warnCount: recentLogs.filter(log => log.level === 'warn').length,
      infoCount: recentLogs.filter(log => log.level === 'info').length
    }
  }

  // Exporter les logs vers un fichier
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Instance globale du logger
export const logger = new Logger()

// Helper pour logger les erreurs API
export function logApiError(
  endpoint: string, 
  error: Error, 
  req?: { url?: string; method?: string }
) {
  logger.error(
    `API Error on ${endpoint}`,
    error,
    req ? `${req.method} ${req.url}` : undefined
  )
}

// Helper pour logger les actions utilisateur
export function logUserAction(
  action: string,
  userId: string,
  details?: string
) {
  logger.info(
    `User Action: ${action}`,
    details,
    userId
  )
}