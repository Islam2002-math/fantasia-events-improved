import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { generateTicketName, generateValidationCode } from '@/lib/nameGenerator'

export async function POST(request: Request) {
  try {
    const session = await getUserFromRequest()
    
    // Seuls les admins peuvent valider les billets
    if (!session?.userId || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé - Accès admin requis' }, { status: 403 })
    }

    const { qrCode } = await request.json()
    
    if (!qrCode) {
      return NextResponse.json({ error: 'Code QR manquant' }, { status: 400 })
    }

    // Trouver le billet par QR code
    const ticket = await prisma.ticket.findFirst({
      where: { qrCode },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ 
        error: 'Billet invalide',
        valid: false,
        message: 'Ce QR code ne correspond à aucun billet valide'
      }, { status: 404 })
    }

    // Vérifier si le billet n'a pas déjà été utilisé
    if (ticket.usedAt) {
      return NextResponse.json({
        error: 'Billet déjà utilisé',
        valid: false,
        ticket: {
          id: ticket.id,
          event: ticket.event,
          user: ticket.user,
          usedAt: ticket.usedAt
        },
        message: `Ce billet a déjà été utilisé le ${new Date(ticket.usedAt).toLocaleString('fr-FR')}`
      }, { status: 400 })
    }

    // Vérifier si l'événement a lieu aujourd'hui ou dans le futur proche
    const eventDate = new Date(ticket.event.date)
    const now = new Date()
    const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < -1) { // Plus d'un jour après l'événement
      return NextResponse.json({
        error: 'Événement terminé',
        valid: false,
        message: 'Cet événement est terminé depuis plus d\'un jour'
      }, { status: 400 })
    }

    if (daysDiff > 1) { // Plus d'un jour avant l'événement
      return NextResponse.json({
        error: 'Événement pas encore commencé',
        valid: false,
        message: `Cet événement aura lieu dans ${daysDiff} jour(s)`
      }, { status: 400 })
    }

    // Générer un nom amusant et un code de validation
    const generatedName = generateTicketName()
    const validationCode = generateValidationCode()

    // Marquer le billet comme utilisé
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { 
        usedAt: new Date()
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      valid: true,
      message: 'Billet validé avec succès !',
      ticket: updatedTicket,
      generatedName,
      validationCode,
      welcome: `Bienvenue ${generatedName} ! 🎉`
    })

  } catch (error) {
    console.error('Error validating ticket:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      valid: false,
      message: 'Une erreur est survenue lors de la validation'
    }, { status: 500 })
  }
}

// GET pour vérifier un billet sans le marquer comme utilisé
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const qrCode = url.searchParams.get('qr')
    
    if (!qrCode) {
      return NextResponse.json({ error: 'Code QR manquant' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findFirst({
      where: { qrCode },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ 
        valid: false,
        message: 'Billet non trouvé'
      }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      ticket,
      alreadyUsed: !!ticket.usedAt,
      message: ticket.usedAt 
        ? `Billet déjà utilisé le ${new Date(ticket.usedAt).toLocaleString('fr-FR')}`
        : 'Billet valide et prêt à être utilisé'
    })

  } catch (error) {
    console.error('Error checking ticket:', error)
    return NextResponse.json({ 
      valid: false,
      message: 'Erreur lors de la vérification'
    }, { status: 500 })
  }
}