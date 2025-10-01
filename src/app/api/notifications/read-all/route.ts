// =====================================================
// Mark All Notifications as Read API - ponteGEEK SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { CacheService } from "@/lib/cache"

// PATCH - Marcar todas las notificaciones como leídas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Marcar todas las notificaciones no leídas como leídas
    const result = await prisma.notification.updateMany({
      where: { 
        userId,
        read: false
      },
      data: { read: true }
    })

    // Invalidar cache
    await CacheService.invalidatePattern(`user:${userId}:notifications*`)

    return NextResponse.json({
      success: true,
      updated: result.count
    })

  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
