// =====================================================
// Reports API Route - ponteGEEK SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { CacheService } from "@/lib/cache"

// GET - Obtener reportes y KPIs
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
    const period = searchParams.get('period') || 'month'
    
    const cacheKey = CacheService.getKeys.userReports(userId, period)
    const cachedReports = await CacheService.get(cacheKey)

    if (cachedReports) {
      return NextResponse.json(cachedReports)
    }

    // Calcular fechas según el período
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
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
      include: {
        events: true,
        contacts: true,
        members: true
      }
    })

    const projectIds = userProjects.map(p => p.id)

    // Estadísticas de eventos
    const totalEvents = await prisma.event.count({
      where: { projectId: { in: projectIds } }
    })

    const completedEvents = await prisma.event.count({
      where: { 
        projectId: { in: projectIds },
        endDate: { lt: now }
      }
    })

    const upcomingEvents = await prisma.event.count({
      where: { 
        projectId: { in: projectIds },
        startDate: { gt: now }
      }
    })

    const overdueEvents = await prisma.event.count({
      where: { 
        projectId: { in: projectIds },
        endDate: { lt: now },
        startDate: { lt: now }
      }
    })

    const thisMonthEvents = await prisma.event.count({
      where: { 
        projectId: { in: projectIds },
        createdAt: { gte: startDate }
      }
    })

    const lastMonthEvents = await prisma.event.count({
      where: { 
        projectId: { in: projectIds },
        createdAt: { 
          gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
          lt: startDate
        }
      }
    })

    // Estadísticas de proyectos
    const totalProjects = userProjects.length
    const activeProjects = userProjects.filter(p => p.status === 'ACTIVE').length
    const completedProjects = userProjects.filter(p => p.status === 'COMPLETED').length

    const thisMonthProjects = userProjects.filter(p => 
      p.createdAt >= startDate
    ).length

    const lastMonthProjects = userProjects.filter(p => {
      const lastMonthStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
      return p.createdAt >= lastMonthStart && p.createdAt < startDate
    }).length

    // Estadísticas de contactos
    const totalContacts = await prisma.contact.count({
      where: { projectId: { in: projectIds } }
    })

    const newThisMonthContacts = await prisma.contact.count({
      where: { 
        projectId: { in: projectIds },
        createdAt: { gte: startDate }
      }
    })

    const contactsWithEmail = await prisma.contact.count({
      where: { 
        projectId: { in: projectIds },
        email: { not: null }
      }
    })

    const contactsWithPhone = await prisma.contact.count({
      where: { 
        projectId: { in: projectIds },
        phone: { not: null }
      }
    })

    const engagedContacts = await prisma.contact.count({
      where: { 
        projectId: { in: projectIds },
        OR: [
          { email: { not: null } },
          { phone: { not: null } }
        ]
      }
    })

    // Top proyectos
    const topProjects = userProjects
      .map(project => ({
        id: project.id,
        name: project.name,
        events: project.events.length,
        contacts: project.contacts.length,
        completion: project.events.length > 0 
          ? Math.round((project.events.filter(e => e.endDate < now).length / project.events.length) * 100)
          : 0
      }))
      .sort((a, b) => (b.events + b.contacts) - (a.events + a.contacts))
      .slice(0, 5)

    // Actividad reciente
    const recentEvents = await prisma.event.findMany({
      where: { projectId: { in: projectIds } },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const recentProjects = await prisma.project.findMany({
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
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentContacts = await prisma.contact.findMany({
      where: { projectId: { in: projectIds } },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentActivity = [
      ...recentEvents.map(event => ({
        id: `event-${event.id}`,
        type: 'event' as const,
        title: `Evento creado: ${event.title}`,
        description: `En proyecto ${event.project.name}`,
        timestamp: event.createdAt.toISOString(),
        status: 'success' as const
      })),
      ...recentProjects.map(project => ({
        id: `project-${project.id}`,
        type: 'project' as const,
        title: `Proyecto creado: ${project.name}`,
        description: `Estado: ${project.status}`,
        timestamp: project.createdAt.toISOString(),
        status: 'info' as const
      })),
      ...recentContacts.map(contact => ({
        id: `contact-${contact.id}`,
        type: 'contact' as const,
        title: `Contacto agregado: ${contact.name}`,
        description: `En proyecto ${contact.project.name}`,
        timestamp: contact.createdAt.toISOString(),
        status: 'success' as const
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

    // Calcular KPIs
    const eventGrowth = lastMonthEvents > 0 
      ? Math.round(((thisMonthEvents - lastMonthEvents) / lastMonthEvents) * 100)
      : thisMonthEvents > 0 ? 100 : 0

    const projectGrowth = lastMonthProjects > 0 
      ? Math.round(((thisMonthProjects - lastMonthProjects) / lastMonthProjects) * 100)
      : thisMonthProjects > 0 ? 100 : 0

    const contactGrowth = totalContacts > 0 
      ? Math.round((newThisMonthContacts / totalContacts) * 100)
      : 0

    const completionRate = totalEvents > 0 
      ? Math.round((completedEvents / totalEvents) * 100)
      : 0

    const kpis = [
      {
        id: 'total-events',
        title: 'Total Eventos',
        value: totalEvents,
        change: eventGrowth,
        changeType: eventGrowth >= 0 ? 'increase' : 'decrease',
        format: 'number',
        icon: 'Calendar',
        color: 'bg-blue-500'
      },
      {
        id: 'total-projects',
        title: 'Total Proyectos',
        value: totalProjects,
        change: projectGrowth,
        changeType: projectGrowth >= 0 ? 'increase' : 'decrease',
        format: 'number',
        icon: 'Target',
        color: 'bg-green-500'
      },
      {
        id: 'total-contacts',
        title: 'Total Contactos',
        value: totalContacts,
        change: contactGrowth,
        changeType: contactGrowth >= 0 ? 'increase' : 'decrease',
        format: 'number',
        icon: 'Users',
        color: 'bg-purple-500'
      },
      {
        id: 'completion-rate',
        title: 'Tasa de Finalización',
        value: completionRate,
        change: 0,
        changeType: 'neutral',
        format: 'percentage',
        icon: 'CheckCircle',
        color: 'bg-orange-500'
      }
    ]

    const reportData = {
      kpis,
      eventStats: {
        total: totalEvents,
        completed: completedEvents,
        upcoming: upcomingEvents,
        overdue: overdueEvents,
        thisMonth: thisMonthEvents,
        lastMonth: lastMonthEvents
      },
      projectStats: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        thisMonth: thisMonthProjects,
        lastMonth: lastMonthProjects
      },
      contactStats: {
        total: totalContacts,
        newThisMonth: newThisMonthContacts,
        withEmail: contactsWithEmail,
        withPhone: contactsWithPhone,
        engaged: engagedContacts
      },
      topProjects,
      recentActivity
    }

    // Cache por 5 minutos
    await CacheService.set(cacheKey, reportData, 300)

    return NextResponse.json(reportData)

  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
