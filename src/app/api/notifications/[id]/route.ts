// =====================================================
// Notification Actions API Routes - ponteGEEK SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { CacheService } from "@/lib/cache"

// PATCH - Marcar notificación como leída
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const notificationId = params.id

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      )
    }

    // Marcar como leída
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })

    // Invalidar cache
    await CacheService.invalidatePattern(`user:${userId}:notifications*`)

    return NextResponse.json(updatedNotification)

  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar notificación
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const notificationId = params.id

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      )
    }

    // Eliminar notificación
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    // Invalidar cache
    await CacheService.invalidatePattern(`user:${userId}:notifications*`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}