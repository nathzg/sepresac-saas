// =====================================================
// Notification Service - Sepresac SaaS
// =====================================================

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export interface CreateNotificationData {
  userId: string
  type: 'PROJECT_INVITATION' | 'EVENT_CREATED' | 'EVENT_UPDATED' | 'CONTACT_ADDED' | 'EVENT_REMINDER'
  title: string
  message: string
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message
        }
      })

      return notification
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }

  static async createProjectInviteNotification(
    userId: string, 
    projectName: string, 
    inviterName: string
  ) {
    return this.createNotification({
      userId,
      type: 'PROJECT_INVITATION',
      title: 'Invitación a Proyecto',
      message: `${inviterName} te ha invitado al proyecto "${projectName}"`
    })
  }

  static async createEventCreatedNotification(
    userId: string,
    eventTitle: string,
    projectName: string,
    creatorName: string
  ) {
    return this.createNotification({
      userId,
      type: 'EVENT_CREATED',
      title: 'Nuevo Evento',
      message: `${creatorName} ha creado el evento "${eventTitle}" en el proyecto "${projectName}"`
    })
  }

  static async createEventUpdatedNotification(
    userId: string,
    eventTitle: string,
    projectName: string,
    updaterName: string
  ) {
    return this.createNotification({
      userId,
      type: 'EVENT_UPDATED',
      title: 'Evento Actualizado',
      message: `${updaterName} ha actualizado el evento "${eventTitle}" en el proyecto "${projectName}"`
    })
  }

  static async createContactAddedNotification(
    userId: string,
    contactName: string,
    projectName: string,
    adderName: string
  ) {
    return this.createNotification({
      userId,
      type: 'CONTACT_ADDED',
      title: 'Nuevo Contacto',
      message: `${adderName} ha agregado el contacto "${contactName}" al proyecto "${projectName}"`
    })
  }

  static async createEventReminderNotification(
    userId: string,
    eventTitle: string,
    projectName: string
  ) {
    return this.createNotification({
      userId,
      type: 'EVENT_REMINDER',
      title: 'Recordatorio de Evento',
      message: `El evento "${eventTitle}" del proyecto "${projectName}" está próximo a comenzar`
    })
  }

  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          read: true
        }
      })

      return notification
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false
        },
        data: {
          read: true
        }
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  static async deleteNotification(notificationId: string, userId: string) {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId: userId
        }
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }

  static async getUserNotifications(userId: string, limit: number = 20) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      return notifications
    } catch (error) {
      console.error("Error getting user notifications:", error)
      throw error
    }
  }

  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: userId,
          read: false
        }
      })

      return count
    } catch (error) {
      console.error("Error getting unread count:", error)
      throw error
    }
  }
}
