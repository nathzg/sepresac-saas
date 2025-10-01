// =====================================================
// Demo Project Seeder - ponteGEEK SaaS
// =====================================================

import { prisma } from "@/lib/database"

export async function createDemoProject(userId: string) {
  try {
    // Crear proyecto demo
    const demoProject = await prisma.project.create({
      data: {
        name: "Conferencia Tech 2024",
        description: "Proyecto demo para mostrar las capacidades de ponteGEEK. Incluye eventos, contactos y colaboradores.",
        status: "ACTIVE",
        ownerId: userId,
        type: "event",
        privacy: "team"
      }
    })

    // Crear eventos demo
    const events = [
      {
        title: "Registro y Bienvenida",
        description: "Registro de participantes y sesión de bienvenida",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 horas
        location: "Auditorio Principal",
        projectId: demoProject.id,
        creatorId: userId
      },
      {
        title: "Keynote: El Futuro de la Tecnología",
        description: "Presentación principal sobre tendencias tecnológicas",
        startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 días desde ahora
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // +90 minutos
        location: "Auditorio Principal",
        projectId: demoProject.id,
        creatorId: userId
      },
      {
        title: "Workshop: Desarrollo Web Moderno",
        description: "Taller práctico sobre tecnologías web actuales",
        startDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 días desde ahora
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 horas
        location: "Sala de Talleres",
        projectId: demoProject.id,
        creatorId: userId
      }
    ]

    for (const eventData of events) {
      await prisma.event.create({
        data: eventData
      })
    }

    // Crear contactos demo
    const contacts = [
      {
        name: "María González",
        email: "maria.gonzalez@empresa.com",
        phone: "+34 600 123 456",
        company: "TechCorp",
        position: "CTO",
        location: "Madrid, España",
        notes: "Interesada en tecnologías emergentes",
        projectId: demoProject.id
      },
      {
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@startup.com",
        phone: "+34 600 789 012",
        company: "StartupXYZ",
        position: "Fundador",
        location: "Barcelona, España",
        notes: "Especialista en IA y Machine Learning",
        projectId: demoProject.id
      },
      {
        name: "Ana Martínez",
        email: "ana.martinez@universidad.edu",
        phone: "+34 600 345 678",
        company: "Universidad Tecnológica",
        position: "Profesora",
        location: "Valencia, España",
        notes: "Investigadora en ciberseguridad",
        projectId: demoProject.id
      },
      {
        name: "David López",
        email: "david.lopez@consultora.com",
        phone: "+34 600 901 234",
        company: "Consultora Digital",
        position: "Consultor Senior",
        location: "Sevilla, España",
        notes: "Experto en transformación digital",
        projectId: demoProject.id
      }
    ]

    for (const contactData of contacts) {
      await prisma.contact.create({
        data: contactData
      })
    }

    // Crear notificaciones demo
    const notifications = [
      {
        userId: userId,
        type: "INFO",
        title: "Proyecto Demo Creado",
        message: "Se ha creado el proyecto 'Conferencia Tech 2024' con eventos y contactos de ejemplo.",
        read: false
      },
      {
        userId: userId,
        type: "REMINDER",
        title: "Evento Próximo",
        message: "El evento 'Registro y Bienvenida' está programado para dentro de 7 días.",
        read: false
      },
      {
        userId: userId,
        type: "SUCCESS",
        title: "Contactos Importados",
        message: "Se han agregado 4 contactos al proyecto demo.",
        read: false
      }
    ]

    for (const notificationData of notifications) {
      await prisma.notification.create({
        data: notificationData
      })
    }

    return demoProject
  } catch (error) {
    console.error("Error creating demo project:", error)
    throw error
  }
}

export async function deleteDemoProject(userId: string) {
  try {
    // Buscar proyecto demo del usuario
    const demoProject = await prisma.project.findFirst({
      where: {
        ownerId: userId,
        name: "Conferencia Tech 2024"
      }
    })

    if (demoProject) {
      // Eliminar eventos relacionados
      await prisma.event.deleteMany({
        where: {
          projectId: demoProject.id
        }
      })

      // Eliminar contactos relacionados
      await prisma.contact.deleteMany({
        where: {
          projectId: demoProject.id
        }
      })

      // Eliminar el proyecto
      await prisma.project.delete({
        where: {
          id: demoProject.id
        }
      })

      return true
    }

    return false
  } catch (error) {
    console.error("Error deleting demo project:", error)
    throw error
  }
}
