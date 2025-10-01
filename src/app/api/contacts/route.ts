// =====================================================
// Contacts API Route - ponteGEEK SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { CacheService } from "@/lib/cache"

// GET - Obtener contactos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    
    // Verificar caché primero
    const cacheKey = `user:${userId}:contacts`
    const cachedContacts = await CacheService.get(cacheKey)
    
    if (cachedContacts) {
      return NextResponse.json(cachedContacts)
    }

    // Obtener proyectos del usuario
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { 
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      select: {
        id: true
      }
    })

    const projectIds = userProjects.map(p => p.id)

    // Obtener contactos de los proyectos del usuario
    const contacts = await prisma.contact.findMany({
      where: {
        projectId: { in: projectIds }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const result = {
      contacts
    }

    // Guardar en caché por 10 minutos
    await CacheService.set(cacheKey, result, 600)

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error obteniendo contactos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
