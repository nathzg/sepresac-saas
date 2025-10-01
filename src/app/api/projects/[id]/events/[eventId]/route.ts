// =====================================================
// Event Detail API Route - Sepresac SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener evento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: projectId, eventId } = await params

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

    // Obtener evento
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
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
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })

  } catch (error) {
    console.error("Error obteniendo evento:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar evento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: projectId, eventId } = await params
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      location 
    } = await request.json()

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

    // Verificar que el evento existe
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        projectId: projectId
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    // Verificar permisos (solo el creador o owner/co-owner pueden editar)
    const isOwner = project.ownerId === session.user.id
    const isCreator = existingEvent.creatorId === session.user.id
    const isCoOwner = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: session.user.id,
        role: "CO_OWNER"
      }
    })

    if (!isOwner && !isCreator && !isCoOwner) {
      return NextResponse.json(
        { error: "No tienes permisos para editar este evento" },
        { status: 403 }
      )
    }

    // Actualizar evento
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(location !== undefined && { location })
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
      }
    })

    return NextResponse.json({
      message: "Evento actualizado exitosamente",
      event: updatedEvent
    })

  } catch (error) {
    console.error("Error actualizando evento:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: projectId, eventId } = await params

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

    // Verificar que el evento existe
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        projectId: projectId
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    // Verificar permisos (solo el creador o owner pueden eliminar)
    const isOwner = project.ownerId === session.user.id
    const isCreator = existingEvent.creatorId === session.user.id

    if (!isOwner && !isCreator) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar este evento" },
        { status: 403 }
      )
    }

    // Eliminar evento
    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({
      message: "Evento eliminado exitosamente"
    })

  } catch (error) {
    console.error("Error eliminando evento:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
