import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import bcrypt from 'bcryptjs'

async function main() {
  // Create admin demo user if missing
  const adminEmail = 'admin@example.com'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const hash = await bcrypt.hash('admin12345', 10)
    await prisma.user.create({ data: { email: adminEmail, password: hash, name: 'Admin', role: 'ADMIN' } })
  }

  const count = await prisma.event.count()
  if (count === 0) {
    const now = new Date()
    await prisma.event.createMany({
      data: [
        {
          title: 'Concert Fantasia',
          description: 'Un concert exceptionnel avec artistes locaux.',
          location: 'Alger, Salle Ibn Khaldoun',
          date: new Date(now.getTime() + 7*24*3600*1000),
          priceCents: 2500,
          category: 'Concert',
          capacity: 150,
          imageUrl: 'https://picsum.photos/seed/fantasia1/1200/400',
        },
        {
          title: 'Festival des Annonces',
          description: 'Festival multi-scènes et annonces spéciales.',
          location: 'Oran, Théâtre',
          date: new Date(now.getTime() + 14*24*3600*1000),
          priceCents: 4000,
          category: 'Festival',
          capacity: 300,
          imageUrl: 'https://picsum.photos/seed/fantasia2/1200/400',
        }
      ]
    })
    // Set a default image on events missing imageUrl
    await prisma.event.updateMany({ where: { imageUrl: null }, data: { imageUrl: 'https://picsum.photos/seed/fantasia3/1200/400' } })
    await prisma.announcement.createMany({
      data: [
        { title: 'Ouverture des ventes', body: 'Les billets sont disponibles dès maintenant !' },
        { title: 'Nouveaux artistes', body: 'Deux artistes confirmés pour le prochain concert.' },
      ]
    })
    console.log('Seeded events.')
  } else {
    console.log('Events already exist, skipping.')
  }
}

main().finally(async () => { await prisma.$disconnect() })