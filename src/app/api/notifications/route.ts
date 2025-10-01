// =====================================================
// Notifications API Routes - ponteGEEK SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { CacheService } from "@/lib/cache"

// GET - Obtener notificaciones del usuario
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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const cacheKey = CacheService.getKeys.userNotifications(userId)
    const cachedNotifications = await CacheService.get(cacheKey)

    if (cachedNotifications) {
      return NextResponse.json(cachedNotifications)
    }

    // Obtener notificaciones del usuario
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Calcular estadísticas
    const total = await prisma.notification.count({ where: { userId } })
    const unread = await prisma.notification.count({ 
      where: { userId, read: false } 
    })

    const byType = {
      info: await prisma.notification.count({ 
        where: { userId, type: 'INFO' } 
      }),
      success: await prisma.notification.count({ 
        where: { userId, type: 'SUCCESS' } 
      }),
      warning: await prisma.notification.count({ 
        where: { userId, type: 'WARNING' } 
      }),
      error: await prisma.notification.count({ 
        where: { userId, type: 'ERROR' } 
      })
    }

    const byCategory = {
      event: await prisma.notification.count({ 
        where: { userId, type: 'INFO' } // Asumiendo que eventos son INFO
      }),
      project: await prisma.notification.count({ 
        where: { userId, type: 'SUCCESS' } // Asumiendo que proyectos son SUCCESS
      }),
      contact: await prisma.notification.count({ 
        where: { userId, type: 'WARNING' } // Asumiendo que contactos son WARNING
      }),
      system: await prisma.notification.count({ 
        where: { userId, type: 'ERROR' } // Asumiendo que sistema son ERROR
      })
    }

    const result = {
      notifications,
      stats: {
        total,
        unread,
        byType,
        byCategory
      }
    }

    // Cache por 2 minutos
    await CacheService.set(cacheKey, result, 120)

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    
    const { title, message, type, priority, category, actionUrl, actionText, metadata } = body

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'INFO',
        priority: priority || 'medium',
        category: category || 'system',
        actionUrl,
        actionText,
        metadata: metadata ? JSON.stringify(metadata) : null,
        read: false
      }
    })

    // Invalidar cache
    await CacheService.invalidatePattern(`user:${userId}:notifications*`)

    return NextResponse.json(notification)

  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}