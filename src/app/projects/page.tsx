"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ProjectWizard } from "@/components/project-wizard"
import { Plus, Users, Calendar, Settings, Eye, Edit, Trash2, Home, ArrowLeft, Clock, FileText } from "lucide-react"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  _count: {
    members: number
    events: number
  }
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProjects()
    }
  }, [session])

  const fetchProjects = async () => {
    if (!session) return
    
    try {
      const response = await fetch("/api/projects")
      const data = await response.json()

      if (response.ok) {
        setProjects(data.projects || data)
      } else {
        toast.error(data.error || "Error al cargar proyectos")
      }
    } catch (error) {
      toast.error("Error al cargar proyectos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    
    setIsLoading(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Proyecto creado exitosamente")
        setNewProject({ name: "", description: "" })
        setIsDialogOpen(false)
        fetchProjects()
      } else {
        toast.error(data.error || "Error al crear proyecto")
      }
    } catch (error) {
      toast.error("Error al crear proyecto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      return
    }
    if (!session) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Proyecto eliminado exitosamente")
        fetchProjects()
      } else {
        toast.error(data.error || "Error al eliminar proyecto")
      }
    } catch (error) {
      toast.error("Error al eliminar proyecto")
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Hace menos de 1 hora"
    if (diffInHours < 24) return `Hace ${diffInHours} horas`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Ayer"
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    
    return date.toLocaleDateString()
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="h-10 px-2 sm:px-4">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  Mis Proyectos
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Gestiona tus proyectos y colabora con tu equipo
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button 
                onClick={() => setIsWizardOpen(true)}
                className="h-10 sm:h-12 px-3 sm:px-6 text-sm sm:text-base"
                disabled={isCreatingProject}
              >
                {isCreatingProject ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Creando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Nuevo Proyecto</span>
                    <span className="sm:hidden">Nuevo</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              ¡Comienza tu primer proyecto! 🚀
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Organiza eventos, gestiona contactos y colabora con tu equipo. 
              Todo en una plataforma intuitiva y poderosa.
            </p>
            <div className="space-y-4">
            <Button 
              onClick={() => setIsWizardOpen(true)}
              className="h-12 px-8 text-base"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Primer Proyecto
            </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ✨ Gratis para siempre • Sin tarjeta de crédito
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {project.description || "Sin descripción."}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="ml-2 text-xs"
                    >
                      {project.status === 'ACTIVE' ? 'Activo' : project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{project._count.members} Miembros</span>
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{project._count.events} Eventos</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Última actividad: {formatTimeAgo(project.updatedAt)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 text-xs">
                          <Eye className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Ver Dashboard</span>
                          <span className="sm:hidden">Ver</span>
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Project Wizard */}
      <ProjectWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => {
          fetchProjects()
          setIsWizardOpen(false)
        }}
      />
    </div>
  )
}