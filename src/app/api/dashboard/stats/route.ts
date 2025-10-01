// =====================================================
// Dashboard Stats API Route - Sepresac SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { CacheService } from "@/lib/cache"

// GET - Obtener estadísticas del dashboard
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
    const cacheKey = CacheService.getKeys.dashboardStats(userId)
    const cachedStats = await CacheService.get(cacheKey)
    
    if (cachedStats) {
      return NextResponse.json(cachedStats)
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

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

    // Estadísticas de eventos
    const [
      totalEvents,
      eventsThisMonth,
      eventsNext7Days,
      eventsToday,
      recentEvents
    ] = await Promise.all([
      // Total de eventos
      prisma.event.count({
        where: {
          projectId: { in: projectIds }
        }
      }),
      
      // Eventos del mes
      prisma.event.count({
        where: {
          projectId: { in: projectIds },
          startDate: {
            gte: startOfMonth
          }
        }
      }),
      
      // Próximos 7 días
      prisma.event.count({
        where: {
          projectId: { in: projectIds },
          startDate: {
            gte: startOfWeek,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Eventos hoy
      prisma.event.count({
        where: {
          projectId: { in: projectIds },
          startDate: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),
      
      // Eventos recientes
      prisma.event.findMany({
        where: {
          projectId: { in: projectIds }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ])

    // Estadísticas de contactos
    const totalContacts = await prisma.contact.count({
      where: {
        projectId: { in: projectIds }
      }
    })

    // Estadísticas de proyectos
    const totalProjects = userProjects.length
    const activeProjects = await prisma.project.count({
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
        ],
        status: 'ACTIVE'
      }
    })

    // Notificaciones no leídas
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: userId,
        read: false
      }
    })

    // Actividad reciente (últimas 24 horas)
    const recentActivity = await prisma.event.findMany({
      where: {
        projectId: { in: projectIds },
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const result = {
      stats: {
        events: {
          total: totalEvents,
          thisMonth: eventsThisMonth,
          next7Days: eventsNext7Days,
          today: eventsToday
        },
        projects: {
          total: totalProjects,
          active: activeProjects
        },
        contacts: {
          total: totalContacts
        },
        notifications: {
          unread: unreadNotifications
        }
      },
      recentEvents,
      recentActivity
    }

    // Guardar en caché por 5 minutos
    await CacheService.set(cacheKey, result, 300)

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
