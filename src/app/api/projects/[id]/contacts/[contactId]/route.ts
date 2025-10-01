// =====================================================
// Contact Detail API Route - Sepresac SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener contacto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: projectId, contactId } = await params

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

    // Obtener contacto
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        projectId: projectId
      },
      include: {
        eventContacts: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                location: true
              }
            }
          }
        },
        _count: {
          select: {
            eventContacts: true
          }
        }
      }
    })

    if (!contact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ contact })

  } catch (error) {
    console.error("Error obteniendo contacto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar contacto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: projectId, contactId } = await params
    const { 
      name, 
      email, 
      phone, 
      organization, 
      position, 
      notes 
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

    // Verificar que el contacto existe
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        projectId: projectId
      }
    })

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      )
    }

    // Verificar si el email ya existe en otro contacto del proyecto
    if (email && email !== existingContact.email) {
      const emailExists = await prisma.contact.findFirst({
        where: {
          projectId: projectId,
          email: email,
          id: { not: contactId }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "Ya existe un contacto con ese email en este proyecto" },
          { status: 400 }
        )
      }
    }

    // Actualizar contacto
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(organization !== undefined && { organization }),
        ...(position !== undefined && { position }),
        ...(notes !== undefined && { notes })
      },
      include: {
        eventContacts: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                location: true
              }
            }
          }
        },
        _count: {
          select: {
            eventContacts: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Contacto actualizado exitosamente",
      contact: updatedContact
    })

  } catch (error) {
    console.error("Error actualizando contacto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar contacto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: projectId, contactId } = await params

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

    // Verificar que el contacto existe
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        projectId: projectId
      }
    })

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      )
    }

    // Eliminar contacto (cascade delete de eventContacts)
    await prisma.contact.delete({
      where: { id: contactId }
    })

    return NextResponse.json({
      message: "Contacto eliminado exitosamente"
    })

  } catch (error) {
    console.error("Error eliminando contacto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
