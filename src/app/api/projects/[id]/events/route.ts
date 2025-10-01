// =====================================================
// Project Events API Route - Sepresac SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener eventos del proyecto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: projectId } = await params

    // Verificar acceso al proyecto
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { 
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      )
    }

    // Obtener eventos
    const events = await prisma.event.findMany({
      where: {
        projectId: projectId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        contacts: {
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                organization: true
              }
            }
          }
        },
        _count: {
          select: {
            contacts: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json({ events })

  } catch (error) {
    console.error("Error obteniendo eventos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo evento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: projectId } = await params
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      location, 
      contactIds = [] 
    } = await request.json()

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Título y fecha de inicio son requeridos" },
        { status: 400 }
      )
    }

    // Verificar acceso al proyecto
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { 
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      )
    }

    // Crear evento
    const event = await prisma.event.create({
      data: {
        title,
        description: description || "",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        location: location || "",
        projectId: projectId,
        creatorId: session.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            contacts: true
          }
        }
      }
    })

    // Crear notificaciones para todos los miembros del proyecto
    const { NotificationService } = await import("@/lib/notifications")
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: projectId },
      select: { userId: true }
    })

    const notificationPromises = projectMembers
      .filter(member => member.userId !== session.user.id) // No notificar al creador
      .map(member => 
        NotificationService.createEventCreatedNotification(
          member.userId,
          title,
          project.name,
          session.user.name || "Un usuario"
        )
      )

    await Promise.all(notificationPromises)

    // Agregar contactos si se proporcionan
    if (contactIds.length > 0) {
      await prisma.eventContact.createMany({
        data: contactIds.map((contactId: string) => ({
          eventId: event.id,
          contactId: contactId
        }))
      })
    }

    return NextResponse.json({
      message: "Evento creado exitosamente",
      event
    }, { status: 201 })

  } catch (error) {
    console.error("Error creando evento:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
