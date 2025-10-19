import fs from 'fs'
import path from 'path'

// Script pour ajouter facilement les clés Stripe
console.log('🔧 Configuration des clés Stripe')

const envPath = '.env'
const publishableKey = process.env.STRIPE_PK || process.argv[2]
const secretKey = process.env.STRIPE_SK || process.argv[3]

if (!publishableKey || !secretKey) {
  console.log('Usage:')
  console.log('  node add-stripe-keys.mjs pk_test_VOTRE_CLE sk_test_VOTRE_CLE')
  console.log('  ou définir STRIPE_PK et STRIPE_SK comme variables d\'environnement')
  process.exit(1)
}

if (!publishableKey.startsWith('pk_')) {
  console.error('❌ La clé publique doit commencer par pk_')
  process.exit(1)
}

if (!secretKey.startsWith('sk_')) {
  console.error('❌ La clé secrète doit commencer par sk_')
  process.exit(1)
}

try {
  let envContent = fs.readFileSync(envPath, 'utf8')
  
  // Remplacer ou ajouter les clés Stripe
  if (envContent.includes('# STRIPE_PUBLISHABLE_KEY=')) {
    envContent = envContent.replace(
      /# STRIPE_PUBLISHABLE_KEY=".*"/,
      `STRIPE_PUBLISHABLE_KEY="${publishableKey}"`
    )
    envContent = envContent.replace(
      /# STRIPE_SECRET_KEY=".*"/,
      `STRIPE_SECRET_KEY="${secretKey}"`
    )
  } else {
    // Ajouter à la fin si pas trouvé
    envContent += `\n# Stripe Configuration\nSTRIPE_PUBLISHABLE_KEY="${publishableKey}"\nSTRIPE_SECRET_KEY="${secretKey}"\n`
  }
  
  fs.writeFileSync(envPath, envContent)
  
  console.log('✅ Clés Stripe ajoutées avec succès !')
  console.log('🔑 Publishable Key:', publishableKey.substring(0, 20) + '...')
  console.log('🔐 Secret Key:', secretKey.substring(0, 20) + '...')
  console.log('🔄 Redémarrez votre serveur pour appliquer les changements')
  
} catch (error) {
  console.error('❌ Erreur:', error.message)
  process.exit(1)
}