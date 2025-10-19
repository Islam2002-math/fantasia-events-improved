// Générateur de noms amusants pour les billets validés
export function generateTicketName(): string {
  const adjectives = [
    'Magique', 'Fantastique', 'Brillant', 'Étoilé', 'Lumineux',
    'Joyeux', 'Festif', 'Coloré', 'Dansant', 'Musicale',
    'Éclatant', 'Radieux', 'Pétillant', 'Vibrant', 'Harmonieux',
    'Céleste', 'Merveilleux', 'Enchanté', 'Scintillant', 'Triumphant'
  ]

  const nouns = [
    'Papillon', 'Étoile', 'Diamant', 'Cristal', 'Perle',
    'Licorne', 'Dragon', 'Phénix', 'Aigle', 'Lion',
    'Orchidée', 'Rose', 'Tournesol', 'Iris', 'Jasmin',
    'Océan', 'Montagne', 'Aurore', 'Comète', 'Galaxie',
    'Symphonie', 'Mélodie', 'Harmonie', 'Rythme', 'Accord'
  ]

  const colors = [
    'Doré', 'Argenté', 'Azur', 'Pourpre', 'Émeraude',
    'Saphir', 'Rubis', 'Ambre', 'Jade', 'Corail',
    'Turquoise', 'Violet', 'Indigo', 'Cyan', 'Magenta'
  ]

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  
  // Différents formats de noms
  const formats = [
    `${adjective} ${noun}`,
    `${noun} ${color}`,
    `${adjective} ${noun} ${color}`,
    `${color} ${adjective}`,
    `L'${adjective} ${noun}`
  ]
  
  const format = formats[Math.floor(Math.random() * formats.length)]
  return format
}

// Génère un code de validation unique
export function generateValidationCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}