// =====================================================
// Projects API Route - Sepresac SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { CacheService } from "@/lib/cache"

// GET - Obtener proyectos del usuario
export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión desde las cookies
    const session = await getServerSession(authOptions)
    
    console.log("Session in API:", session)
    
    if (!session?.user?.id) {
      console.log("No session found, redirecting to login")
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar caché primero
    const cacheKey = CacheService.getKeys.userProjects(session.user.id)
    const cachedProjects = await CacheService.get(cacheKey)
    
    if (cachedProjects) {
      return NextResponse.json({ projects: cachedProjects })
    }

    // Obtener proyectos donde el usuario es owner o miembro
    const projects = await prisma.project.findMany({
      where: {
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
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            events: true,
            members: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Guardar en caché por 10 minutos
    await CacheService.set(cacheKey, projects, 600)

    return NextResponse.json({ projects })

  } catch (error) {
    console.error("Error obteniendo proyectos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: "El nombre del proyecto es requerido" },
        { status: 400 }
      )
    }

    // Crear proyecto
    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        ownerId: session.user.id,
        status: "ACTIVE"
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            events: true,
            members: true
          }
        }
      }
    })

    // Invalidar caché de proyectos del usuario
    await CacheService.del(CacheService.getKeys.userProjects(session.user.id))

    return NextResponse.json(
      { 
        message: "Proyecto creado exitosamente",
        project
      }, 
      { status: 201 }
    )

  } catch (error) {
    console.error("Error creando proyecto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
