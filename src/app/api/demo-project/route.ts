// =====================================================
// Demo Project API Route - ponteGEEK SaaS
// =====================================================

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { createDemoProject, deleteDemoProject } from "@/lib/demo-project"

// POST - Crear proyecto demo
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
    
    // Verificar si ya existe un proyecto demo
    const existingDemo = await prisma.project.findFirst({
      where: {
        ownerId: userId,
        name: "Conferencia Tech 2024"
      }
    })

    if (existingDemo) {
      return NextResponse.json(
        { error: "Ya tienes un proyecto demo" },
        { status: 400 }
      )
    }

    const demoProject = await createDemoProject(userId)

    return NextResponse.json({
      success: true,
      project: demoProject,
      message: "Proyecto demo creado exitosamente"
    })

  } catch (error) {
    console.error("Error creating demo project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar proyecto demo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const deleted = await deleteDemoProject(userId)

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: "Proyecto demo eliminado exitosamente"
      })
    } else {
      return NextResponse.json(
        { error: "No se encontró proyecto demo" },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error("Error deleting demo project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
