// Validation stricte des cartes de crédit

export interface CardValidationResult {
  isValid: boolean
  cardType: string
  errors: string[]
}

export function validateCreditCard(cardNumber: string, expiryDate: string, cvv: string, cardholderName: string): CardValidationResult {
  const errors: string[] = []
  let cardType = 'Unknown'
  
  // Nettoyer le numéro de carte
  const cleanCardNumber = cardNumber.replace(/\s+/g, '')
  
  // 1. Validation du numéro de carte (algorithme de Luhn)
  if (!isValidCardNumber(cleanCardNumber)) {
    errors.push('Numéro de carte invalide')
  } else {
    cardType = getCardType(cleanCardNumber)
  }
  
  // 2. Validation de la longueur selon le type de carte
  if (!isValidCardLength(cleanCardNumber, cardType)) {
    errors.push(`Longueur invalide pour une carte ${cardType}`)
  }
  
  // 3. Validation de la date d'expiration
  if (!isValidExpiryDate(expiryDate)) {
    errors.push('Date d\'expiration invalide ou expirée')
  }
  
  // 4. Validation du CVV
  if (!isValidCVV(cvv, cardType)) {
    errors.push('Code CVV invalide')
  }
  
  // 5. Validation du nom du porteur
  if (!isValidCardholderName(cardholderName)) {
    errors.push('Nom du porteur invalide (minimum 2 caractères)')
  }
  
  return {
    isValid: errors.length === 0,
    cardType,
    errors
  }
}

// Algorithme de Luhn pour valider les numéros de carte
function isValidCardNumber(cardNumber: string): boolean {
  if (!/^\d+$/.test(cardNumber)) return false
  
  let sum = 0
  let isEven = false
  
  // Parcourir de droite à gauche
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Déterminer le type de carte
function getCardType(cardNumber: string): string {
  const firstDigit = cardNumber[0]
  const firstTwoDigits = cardNumber.substring(0, 2)
  const firstFourDigits = cardNumber.substring(0, 4)
  
  if (firstDigit === '4') {
    return 'Visa'
  }
  
  if (['51', '52', '53', '54', '55'].includes(firstTwoDigits) || 
      (parseInt(firstFourDigits) >= 2221 && parseInt(firstFourDigits) <= 2720)) {
    return 'Mastercard'
  }
  
  if (['34', '37'].includes(firstTwoDigits)) {
    return 'American Express'
  }
  
  if (['6011', '6022', '6044', '6045', '6046', '6047', '6048', '6049'].some(prefix => cardNumber.startsWith(prefix)) ||
      cardNumber.startsWith('65')) {
    return 'Discover'
  }
  
  return 'Unknown'
}

// Validation de la longueur selon le type
function isValidCardLength(cardNumber: string, cardType: string): boolean {
  const lengths = {
    'Visa': [13, 16, 19],
    'Mastercard': [16],
    'American Express': [15],
    'Discover': [16],
    'Unknown': [13, 14, 15, 16, 17, 18, 19]
  }
  
  return lengths[cardType as keyof typeof lengths]?.includes(cardNumber.length) || false
}

// Validation de la date d'expiration
function isValidExpiryDate(expiryDate: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false
  
  const [monthStr, yearStr] = expiryDate.split('/')
  const month = parseInt(monthStr, 10)
  const year = parseInt(`20${yearStr}`, 10)
  
  // Vérifier que le mois est valide
  if (month < 1 || month > 12) return false
  
  // Vérifier que la date n'est pas expirée
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  
  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false
  
  // Vérifier que la date n'est pas trop loin dans le futur (10 ans max)
  if (year > currentYear + 10) return false
  
  return true
}

// Validation du CVV
function isValidCVV(cvv: string, cardType: string): boolean {
  if (!/^\d+$/.test(cvv)) return false
  
  // American Express a un CVV à 4 chiffres, autres cartes à 3
  const expectedLength = cardType === 'American Express' ? 4 : 3
  return cvv.length === expectedLength
}

// Validation du nom du porteur
function isValidCardholderName(name: string): boolean {
  if (!name || name.trim().length < 2) return false
  
  // Vérifier qu'il contient seulement des lettres, espaces, tirets et apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/
  return nameRegex.test(name.trim())
}

// Cartes de test autorisées (pour le développement)
export const TEST_CARDS = {
  visa: {
    number: '4242424242424242',
    expiry: '12/25',
    cvv: '123',
    name: 'Test User'
  },
  mastercard: {
    number: '5555555555554444',
    expiry: '12/25', 
    cvv: '123',
    name: 'Test User'
  },
  amex: {
    number: '378282246310005',
    expiry: '12/25',
    cvv: '1234',
    name: 'Test User'
  }
}

// Vérifier si c'est une carte de test
export function isTestCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s+/g, '')
  return Object.values(TEST_CARDS).some(card => card.number === cleanNumber)
}