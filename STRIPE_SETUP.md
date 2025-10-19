# Guide de Configuration Stripe - Fantasia Events

## État Actuel
✅ Votre application fonctionne déjà en mode simulation (sans Stripe)  
✅ Les utilisateurs peuvent "acheter" des billets et recevoir des QR codes  
✅ Le code Stripe est prêt, il manque juste les clés API  

## Configuration Stripe (Étapes)

### 1. Créer un compte Stripe
1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte avec votre email
3. Vérifier votre email et connectez-vous

### 2. Récupérer vos clés de test
1. Dans le dashboard Stripe, aller à **Developers > API Keys**
2. Copier la **Publishable key** (commence par `pk_test_`)
3. Copier la **Secret key** (commence par `sk_test_`) - cliquer "Reveal"

### 3. Ajouter les clés dans votre .env
Remplacez dans votre fichier `.env` :
```bash
# STRIPE_PUBLISHABLE_KEY="pk_test_..."
# STRIPE_SECRET_KEY="sk_test_..."
```

Par :
```bash
STRIPE_PUBLISHABLE_KEY="pk_test_VOTRE_CLE_PUBLIQUE"
STRIPE_SECRET_KEY="sk_test_VOTRE_CLE_SECRETE"
```

### 4. Configurer le webhook (optionnel pour les tests)
1. Dans Stripe Dashboard: **Developers > Webhooks**
2. Cliquer "Add endpoint"
3. URL: `https://votre-domaine.com/api/webhooks/stripe`
4. Événements: sélectionner `checkout.session.completed`
5. Copier le "Signing secret" et l'ajouter dans `.env` :
```bash
STRIPE_WEBHOOK_SECRET="whsec_VOTRE_WEBHOOK_SECRET"
```

## Cartes de Test Stripe

Une fois Stripe configuré, vous pouvez tester avec ces cartes :

### Cartes qui réussissent
- **4242424242424242** (Visa)
- **5555555555554444** (Mastercard)

### Cartes qui échouent (pour tester les erreurs)
- **4000000000000002** (Carte déclinée)
- **4000000000000069** (Carte expirée)

**Date d'expiration** : N'importe quelle date future (ex: 12/25)  
**CVC** : N'importe quel 3 chiffres (ex: 123)

## Ajouter Votre Carte Wise (Production)

Votre carte Wise (BE65 96781262 0896) sera utilisée quand vous passerez en production :

1. **Mode Test** (maintenant) : Utilisez les cartes de test Stripe
2. **Mode Production** (plus tard) : 
   - Activez votre compte Stripe en production
   - Ajoutez votre carte Wise comme méthode de paiement dans votre compte bancaire Stripe
   - Changez les clés `pk_test_` vers `pk_live_` et `sk_test_` vers `sk_live_`

## Tester le Système Actuel (Sans Stripe)

En attendant vos clés Stripe, votre app fonctionne déjà :
1. Connectez-vous avec : `islam.bouadjadj02@gmail.com` / `Islam2002@`
2. Allez sur un événement
3. Cliquez "Acheter un billet"
4. Vous recevrez un QR code directement (simulation)

## Prochaines Étapes

1. 🔄 Créer votre compte Stripe
2. 🔑 Récupérer vos clés API
3. ⚙️ Les ajouter dans votre `.env`
4. 🧪 Tester avec les cartes de test
5. 🚀 Passer en production quand vous êtes prêt

## Support

Si vous avez des questions, vérifiez :
- [Documentation Stripe](https://stripe.com/docs)
- [Tests avec Stripe](https://stripe.com/docs/testing)

---
**Note** : Gardez vos clés secrètes privées et ne les partagez jamais !