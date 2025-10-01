// =====================================================
// Project Members API Route - Sepresac SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Obtener miembros del proyecto
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

    // Obtener miembros
    const members = await prisma.projectMember.findMany({
      where: {
        projectId: projectId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    })

    return NextResponse.json({ members })

  } catch (error) {
    console.error("Error obteniendo miembros:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Invitar miembro al proyecto
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

    const { email, role = "MEMBER" } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    const { id: projectId } = await params

    // Verificar que el usuario sea owner o co-owner del proyecto
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { 
            members: {
              some: {
                userId: session.user.id,
                role: { in: ["CO_OWNER"] }
              }
            }
          }
        ]
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "No tienes permisos para invitar miembros" },
        { status: 403 }
      )
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar si ya es miembro
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: user.id
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "El usuario ya es miembro del proyecto" },
        { status: 400 }
      )
    }

        // Agregar miembro
        const member = await prisma.projectMember.create({
          data: {
            projectId: projectId,
            userId: user.id,
            role: role as "MEMBER" | "CO_OWNER"
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        // Crear notificación para el usuario invitado
        const { NotificationService } = await import("@/lib/notifications")
        await NotificationService.createProjectInviteNotification(
          user.id,
          project.name,
          session.user.name || "Un usuario"
        )

    return NextResponse.json({
      message: "Miembro agregado exitosamente",
      member
    }, { status: 201 })

  } catch (error) {
    console.error("Error agregando miembro:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
