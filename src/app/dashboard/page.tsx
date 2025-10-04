// =====================================================
// Dashboard Page - Sepresac SaaS
// =====================================================

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProjectWizard } from "@/components/project-wizard"
import { OnboardingChecklist } from "@/components/onboarding-checklist"
import { GuidedTour } from "@/components/guided-tour"
import { GlobalSearch } from "@/components/global-search"
import { Plus, Calendar, Users, FileText, TrendingUp, Bell, Clock, MapPin, User, Search } from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
  events: {
    total: number
    thisMonth: number
    next7Days: number
    today: number
  }
  projects: {
    total: number
    active: number
  }
  contacts: {
    total: number
  }
  notifications: {
    unread: number
  }
}

interface RecentEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
  project: {
    id: string
    name: string
  }
  creator: {
    id: string
    name: string
  }
  createdAt: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchDashboardData()
      
      // Mostrar tour si es la primera vez
      const hasSeenTour = localStorage.getItem('pontegeek-tour-seen')
      if (!hasSeenTour) {
        setTimeout(() => {
          setIsTourOpen(true)
        }, 1000)
      }
    }
  }, [status, router])

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(timer)
  }, [])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, notificationsResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/notifications?limit=5")
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
        setRecentEvents(statsData.recentEvents)
      }

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.notifications)
      }
    } catch (error) {
      toast.error("Error al cargar datos del dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT"
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
      }
    } catch (error) {
      toast.error("Error al marcar notificación")
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    
    setIsCreatingProject(true)
    
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
        toast.success("Proyecto creado ✅ — Ver detalles", {
          action: {
            label: "Ver",
            onClick: () => router.push("/projects")
          }
        })
        setNewProject({ name: "", description: "" })
        setIsCreateProjectOpen(false)
        fetchDashboardData() // Recargar datos del dashboard
      } else {
        toast.error(data.error || "Error al crear proyecto")
      }
    } catch (error) {
      toast.error("Error al crear proyecto")
    } finally {
      setIsCreatingProject(false)
    }
  }

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || !stats) {
    return null
  }

  return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900 dark:text-white truncate">
                {session.user?.name || 'Usuario'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Hora actual: {formatCurrentTime()}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="h-10 px-2 sm:px-3"
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Buscar</span>
                <kbd className="hidden sm:inline ml-2 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">⌘K</kbd>
              </Button>
              {stats.notifications.unread > 0 && (
                <Badge variant="destructive" className="flex items-center">
                  <Bell className="h-3 w-3 mr-1" />
                  {stats.notifications.unread}
                </Badge>
              )}
              <Button 
                onClick={() => setIsWizardOpen(true)}
                className="h-10 sm:h-12 px-3 sm:px-6 text-sm sm:text-base"
                disabled={isCreatingProject}
                data-tour="create-project-btn"
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8" data-tour="dashboard-stats">
            {/* Eventos del Mes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Eventos del Mes
                </CardTitle>
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{stats.events.thisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.events.total} eventos en total
                </p>
              </CardContent>
            </Card>

            {/* Próximos 7 Días */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Próximos 7 Días
                </CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{stats.events.next7Days}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.events.today} eventos hoy
                </p>
              </CardContent>
            </Card>

            {/* Proyectos Activos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Proyectos Activos
                </CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{stats.projects.active}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.projects.total} proyectos en total
                </p>
              </CardContent>
            </Card>

            {/* Total Contactos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Total Contactos
                </CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{stats.contacts.total}</div>
                <p className="text-xs text-muted-foreground">
                  En todos los proyectos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Onboarding Checklist - Solo mostrar si no hay proyectos */}
            {stats && stats.projects.total === 0 && (
              <div className="lg:col-span-2">
                <OnboardingChecklist
                  onProjectCreated={() => {
                    fetchDashboardData()
                    toast.success("¡Proyecto creado! ✅", {
                      description: "Continúa con el siguiente paso del onboarding"
                    })
                  }}
                  onCreateDemo={async () => {
                    try {
                      const response = await fetch("/api/demo-project", {
                        method: "POST"
                      })
                      const data = await response.json()
                      
                      if (response.ok) {
                        toast.success("¡Proyecto demo creado! 🎉", {
                          description: "Explora el proyecto 'Conferencia Tech 2024' con eventos y contactos de ejemplo"
                        })
                        fetchDashboardData()
                      } else {
                        toast.error(data.error || "Error al crear proyecto demo")
                      }
                    } catch (error) {
                      toast.error("Error al crear proyecto demo")
                    }
                  }}
                />
              </div>
            )}

            {/* Eventos Recientes */}
            <Card data-tour="recent-events">
              <CardHeader>
                <CardTitle>Eventos Recientes</CardTitle>
                <CardDescription>
                  Últimos eventos creados en tus proyectos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      ¡Excelente! Ya tienes tu primer proyecto 🎉
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Crea tu primer evento para comenzar a organizar
                    </p>
                    <Button 
                      onClick={() => setIsWizardOpen(true)}
                      className="h-10 px-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Proyecto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.project.name}
                          </p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(event.createdAt)}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Link href={`/projects/${event.project.id}/events/${event.id}`}>
                            <Button size="sm" variant="outline">
                              Ver
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notificaciones */}
            <Card data-tour="notifications">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notificaciones
                  {stats.notifications.unread > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {stats.notifications.unread}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Últimas notificaciones del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nada nuevo por ahora 🚀
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Te notificaremos cuando tengas actualizaciones importantes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                        }`}
                        onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm ${
                              !notification.read ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card data-tour="quick-actions">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Accesos directos a las funciones más utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-16 sm:h-20 flex flex-col items-center justify-center"
                    onClick={() => setIsWizardOpen(true)}
                  >
                    <Plus className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm">Crear Proyecto</span>
                  </Button>
                  <Link href="/projects">
                    <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center">
                      <Calendar className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm">Ver Proyectos</span>
                    </Button>
                  </Link>
                  <Link href="/contacts">
                    <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center">
                      <Users className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm">Gestionar Contactos</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full h-16 sm:h-20 flex flex-col items-center justify-center"
                    onClick={() => router.push("/reports")}
                  >
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm">Ver Reportes</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full h-16 sm:h-20 flex flex-col items-center justify-center"
                    onClick={() => router.push("/notifications")}
                  >
                    <Bell className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm">Notificaciones</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Project Wizard */}
      <ProjectWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => {
          fetchDashboardData()
          setIsWizardOpen(false)
        }}
      />

      {/* Guided Tour */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => {
          setIsTourOpen(false)
          localStorage.setItem('pontegeek-tour-seen', 'true')
        }}
        onComplete={() => {
          localStorage.setItem('pontegeek-tour-seen', 'true')
          toast.success("¡Tour completado! 🎉", {
            description: "Ya conoces las funciones principales de ponteGEEK"
          })
        }}
      />

      {/* Global Search */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  )
}