// =====================================================
// Contacts Page - ponteGEEK SaaS
// =====================================================

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Users, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner"

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  location?: string
  notes?: string
  project: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function ContactsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchContacts()
    }
  }, [status, router])

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts")
      const data = await response.json()

      if (response.ok) {
        setContacts(data.contacts || data)
      } else {
        toast.error("Error al cargar contactos")
      }
    } catch (error) {
      toast.error("Error al cargar contactos")
    } finally {
      setIsLoading(false)
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando contactos...</p>
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
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="h-10 px-2 sm:px-4">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold leading-tight text-gray-900 dark:text-white truncate">
                  Contactos
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Gestiona tus contactos y redes profesionales
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button className="h-10 sm:h-12 px-3 sm:px-6 text-sm sm:text-base">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo Contacto</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-3 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Total Contactos
                </CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{contacts.length}</div>
                <p className="text-xs text-muted-foreground">
                  En todos los proyectos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Con Email
                </CardTitle>
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {contacts.filter(c => c.email).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Contactos con email
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Con Teléfono
                </CardTitle>
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {contacts.filter(c => c.phone).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Contactos con teléfono
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contacts List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Contactos</CardTitle>
              <CardDescription>
                Todos los contactos de tus proyectos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-16 w-16 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    ¡Construye tu red de contactos! 👥
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Mantén organizados todos tus contactos profesionales. 
                    Invita, gestiona y colabora con tu equipo.
                  </p>
                  <div className="space-y-4">
                    <Link href="/projects">
                      <Button size="lg" className="h-12 px-8 text-base">
                        <Plus className="h-5 w-5 mr-2" />
                        Crear Primer Proyecto
                      </Button>
                    </Link>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      💡 Los contactos se crean dentro de los proyectos
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {contact.name}
                          </h3>
                          <Badge variant="outline">
                            {contact.project.name}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          {contact.email && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-4 w-4 mr-2" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-4 w-4 mr-2" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.company && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {contact.position ? `${contact.position} en ${contact.company}` : contact.company}
                            </div>
                          )}
                          {contact.location && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 mr-2" />
                              {contact.location}
                            </div>
                          )}
                        </div>
                        {contact.notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {contact.notes}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-gray-400 mt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          Agregado {formatTimeAgo(contact.createdAt)}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Link href={`/projects/${contact.project.id}/contacts`}>
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
        </div>
      </main>
    </div>
  )
}
