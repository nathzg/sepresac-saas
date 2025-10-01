// =====================================================
// Project Contacts API Route - Sepresac SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener contactos del proyecto
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

    // Obtener contactos del proyecto
    const contacts = await prisma.contact.findMany({
      where: {
        projectId: projectId
      },
      include: {
        _count: {
          select: {
            eventContacts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ contacts })

  } catch (error) {
    console.error("Error obteniendo contactos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo contacto
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
      name, 
      email, 
      phone, 
      organization, 
      position, 
      notes 
    } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
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

    // Verificar si ya existe un contacto con ese email en el proyecto
    const existingContact = await prisma.contact.findFirst({
      where: {
        projectId: projectId,
        email: email
      }
    })

    if (existingContact) {
      return NextResponse.json(
        { error: "Ya existe un contacto con ese email en este proyecto" },
        { status: 400 }
      )
    }

    // Crear contacto
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || "",
        organization: organization || "",
        position: position || "",
        notes: notes || "",
        projectId: projectId
      },
      include: {
        _count: {
          select: {
            eventContacts: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Contacto creado exitosamente",
      contact
    }, { status: 201 })

  } catch (error) {
    console.error("Error creando contacto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
