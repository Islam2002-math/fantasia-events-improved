import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const emailArg = process.argv.find(a => a.startsWith('--email='))
const email = emailArg?.split('=')[1] || process.env.EMAIL

if (!email) {
  console.error('Usage: npm run user:promote -- --email=user@example.com')
  process.exit(1)
}

const user = await prisma.user.findUnique({ where: { email } })
if (!user) {
  console.error('User not found:', email)
  process.exit(1)
}
await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } })
console.log('Promoted to ADMIN:', email)
process.exit(0)