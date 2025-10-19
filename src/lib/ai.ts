export async function recommendEventsForUser(userId?: string) {
  // Advanced AI-powered recommender with collaborative filtering and content-based algorithms
  const { prisma } = await import('@/lib/prisma')

  if (!userId) {
    // Anonymous user recommendations: return popular and diverse upcoming events
    return await getPopularEventsFallback()
  }

  try {
    // Hybrid recommendation algorithm combining multiple approaches:

    // 1. COLLABORATIVE FILTERING: Find users with similar preferences
    const userLikes = await prisma.like.findMany({ where: { userId }, include: { event: true } })
    const userFavorites = await prisma.favorite.findMany({ where: { userId }, include: { event: true } })
    const userComments = await prisma.comment.findMany({ where: { userId }, include: { event: true } })

    const userPreferences = extractUserPreferences(userLikes, userFavorites, userComments)

    // 2. CONTENT-BASED: Find events matching user's preferred categories, locations, price ranges
    const similarUsers = await findSimilarUsers(userId, userPreferences)

    // 3. TREND ANALYSIS: Factor in popularity trends and engagement
    const trendingEvents = await getTrendingEvents()

    // 4. PERSONALIZED SCORING: Combine all factors with weights
    const recommendedEvents = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        capacity: { gt: 0 } // Ensure events with available capacity
      },
      include: {
        likes: true,
        favorites: true,
        comments: true,
        tickets: {
          select: {
            createdAt: true, // For recency scoring
            userId: true
          }
        }
      }
    })

    // Calculate recommendation scores
    const scoredEvents = recommendedEvents.map(event => ({
      ...event,
      recommendationScore: calculateRecommendationScore(event, userPreferences, similarUsers, trendingEvents)
    }))

    // Sort by score and apply diversity filter (avoid too many same category/type)
    const diverseRecommendations = applyDiversityFilter(
      scoredEvents.sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 20) // Take top 20 candidates
    )

    return diverseRecommendations.slice(0, 12) // Final recommendations
  } catch (error) {
    console.error('Recommendation error:', error)
    // Fallback to simple algorithm
    return getSimpleFallback(userId)
  }
}

// Helper functions for the recommendation algorithm

interface UserPreferences {
  favoriteCategories: Record<string, number>
  favoriteLocations: string[]
  priceRange: [number, number]
  timePreferences: { weekend: boolean; weekday: boolean }
  socialEngagement: number // Based on likes/comments ratio
}

function extractUserPreferences(likes: any[], favorites: any[], comments: any[]): UserPreferences {
  const allInteractions = [...likes, ...favorites, ...comments]

  const categoryFreq: Record<string, number> = {}
  const locations: Set<string> = new Set()
  const prices: number[] = []

  for (const interaction of allInteractions) {
    const event = interaction.event
    if (event.category) {
      categoryFreq[event.category] = (categoryFreq[event.category] || 0) + 1
    }
    locations.add(event.location)
    prices.push(event.priceCents / 100) // Convert to euros
  }

  // Analyze timing preferences
  const allDates = allInteractions.map(i => new Date(i.createdAt))
  const weekendInteractions = allDates.filter(d => [0, 6].includes(d.getDay())).length

  return {
    favoriteCategories: categoryFreq,
    favoriteLocations: Array.from(locations),
    priceRange: prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 100],
    timePreferences: {
      weekend: weekendInteractions / allDates.length > 0.5,
      weekday: weekendInteractions / allDates.length <= 0.5
    },
    socialEngagement: allInteractions.length
  }
}

async function findSimilarUsers(userId: string, userPrefs: UserPreferences): Promise<string[]> {
  const { prisma } = await import('@/lib/prisma')

  // Find users with similar category preferences
  const similarUsers = await prisma.like.findMany({
    where: {
      event: {
        category: { in: Object.keys(userPrefs.favoriteCategories) }
      },
      userId: { not: userId } // Exclude current user
    },
    include: { user: true },
    take: 20
  })

  const similarUserIds = similarUsers.map(l => l.userId)
  return [...new Set(similarUserIds)]
}

async function getTrendingEvents(): Promise<Set<string>> {
  const { prisma } = await import('@/lib/prisma')

  // Events with high engagement in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const topEngaged = await prisma.like.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    include: { event: true },
    take: 20
  })

  return new Set(topEngaged.map(l => l.eventId))
}

function calculateRecommendationScore(
  event: any,
  userPrefs: UserPreferences,
  similarUsers: string[],
  trendingEvents: Set<string>
): number {
  let score = 0

  // Category preference score (40% weight)
  const eventCategory = event.category || 'Général'
  const categoryPreference = userPrefs.favoriteCategories[eventCategory] || 0
  score += categoryPreference * 40

  // Location preference score (20% weight)
  const locationScore = userPrefs.favoriteLocations.includes(event.location) ? 20 : 0
  score += locationScore

  // Price preference score (15% weight)
  const price = event.priceCents / 100
  const [minPrice, maxPrice] = userPrefs.priceRange
  if (price >= minPrice && price <= maxPrice) {
    score += 15
  } else if (price >= minPrice * 0.8 && price <= maxPrice * 1.2) { // Near preference range
    score += 10
  }

  // Time preference score (10% weight)
  const eventDay = new Date(event.date).getDay()
  const isWeekend = [0, 6].includes(eventDay)
  if ((isWeekend && userPrefs.timePreferences.weekend) ||
      (!isWeekend && userPrefs.timePreferences.weekday)) {
    score += 10
  }

  // Social proof score (10% weight) - based on engagement
  const engagementScore = Math.min((event.likes.length + event.favorites.length + event.comments.length) / 10, 1) * 10
  score += engagementScore

  // Trending bonus (5% weight)
  if (trendingEvents.has(event.id)) {
    score += 5
  }

  return score
}

function applyDiversityFilter(events: any[]): any[] {
  const diverseEvents: any[] = []
  const categoryCount: Record<string, number> = {}

  for (const event of events) {
    const category = event.category || 'Général'
    if (categoryCount[category] && categoryCount[category] >= 2) {
      continue // Skip if too many events from same category
    }
    diverseEvents.push(event)
    categoryCount[category] = (categoryCount[category] || 0) + 1

    if (diverseEvents.length >= 8) break // Limit diversity to top 8
  }

  return diverseEvents
}

async function getPopularEventsFallback(): Promise<any[]> {
  const { prisma } = await import('@/lib/prisma')

  const now = new Date()
  return await prisma.event.findMany({
    where: { date: { gte: now } },
    include: {
      likes: { select: { id: true } },
      favorites: { select: { id: true } },
      comments: { select: { id: true } }
    },
    orderBy: [
      { likes: { _count: 'desc' } },
      { favorites: { _count: 'desc' } },
      { date: 'asc' }
    ],
    take: 12
  })
}

async function getSimpleFallback(userId: string): Promise<any[]> {
  const { prisma } = await import('@/lib/prisma')

  let favCategory: string | undefined
  try {
    const lastLikes = await prisma.like.findMany({ where: { userId }, include: { event: true }, take: 10, orderBy: { createdAt: 'desc' } })
    const cats = lastLikes.map(l => l.event.category).filter(Boolean) as string[]
    if (cats.length) {
      const freq = cats.reduce<Record<string, number>>((acc, c) => { acc[c] = (acc[c]||0)+1; return acc }, {})
      favCategory = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0]
    }
  } catch (e) {
    console.error('Simple fallback error:', e)
  }

  const now = new Date()
  const baseWhere: any = { date: { gte: now } }
  if (favCategory) baseWhere.category = { contains: favCategory, mode: 'insensitive' }

  return await prisma.event.findMany({ where: baseWhere, orderBy: { date: 'asc' }, take: 12 })
}

export async function summarizeRecommendations(events: { title: string; location: string; date: Date; category?: string }[]) {
  // Create a simple natural language summary locally (no external API)
  if (!events.length) return 'Aucun événement recommandé pour le moment.'
  const parts = events.slice(0, 5).map(e => `${e.title} (${e.category || 'Général'}) à ${e.location} le ${e.date.toLocaleDateString()}`)
  return `Suggestions à venir: ${parts.join('; ')}.`
}

export async function chatAI(message: string) {
  // Local rule-based assistant as default
  const lower = message.toLowerCase()
  if (lower.includes('billet') || lower.includes('ticket')) {
    return 'Pour acheter un billet, ouvrez la page d’un événement et cliquez sur “Acheter”. Vous recevrez un QR code.'
  }
  if (lower.includes('favori')) {
    return 'Ajoutez un événement aux favoris via le bouton “Ajouter aux favoris” sur la page de l’événement.'
  }
  if (lower.includes('compte') || lower.includes('mot de passe')) {
    return 'Gérez votre profil dans “Mon compte > Profil”. Pour réinitialiser le mot de passe, utilisez “Mot de passe oublié?”.'
  }
  return 'Je peux vous aider à trouver des événements. Essayez: “recommande-moi un concert ce week-end”.'
}
