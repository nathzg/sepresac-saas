// =====================================================
// Event Detail Page - Sepresac SaaS
// =====================================================

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Edit, 
  Trash2,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Plus
} from "lucide-react"
import { toast } from "sonner"

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  creator: {
    id: string
    name: string
    email: string
  }
  contacts: Array<{
    contact: {
      id: string
      name: string
      email: string
      phone: string
      organization: string
    }
  }>
  _count: {
    contacts: number
  }
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description: string
}

interface RelatedEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
  creator: {
    id: string
    name: string
  }
  _count: {
    contacts: number
  }
}

export default function EventDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const eventId = params.eventId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchEvent()
      fetchRelatedEvents()
    }
  }, [status, router, projectId, eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/events/${eventId}`)
      const data = await response.json()
      
      if (response.ok) {
        setEvent(data.event)
        setProject(data.project)
      } else {
        toast.error("Error al cargar evento")
        router.push(`/projects/${projectId}/events`)
      }
    } catch (error) {
      toast.error("Error al cargar evento")
      router.push(`/projects/${projectId}/events`)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedEvents = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/events?exclude=${eventId}&limit=5`)
      const data = await response.json()
      
      if (response.ok) {
        setRelatedEvents(data.events || [])
      }
    } catch (error) {
      console.error("Error fetching related events:", error)
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("Evento eliminado correctamente")
        router.push(`/projects/${projectId}/events`)
      } else {
        toast.error("Error al eliminar evento")
      }
    } catch (error) {
      toast.error("Error al eliminar evento")
    }
  }

  const canEditEvent = (event: Event) => {
    return session?.user?.id === event.creator.id
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEvent.title || !newEvent.startDate) {
      toast.error("Título y fecha de inicio son requeridos")
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Evento creado exitosamente")
        setIsDialogOpen(false)
        setNewEvent({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          location: ""
        })
        // Recargar eventos relacionados
        fetchRelatedEvents()
      } else {
        toast.error(data.error || "Error al crear evento")
      }
    } catch (error) {
      toast.error("Error al crear evento")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!event || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Evento no encontrado
            </h1>
            <Link href={`/projects/${projectId}/events`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a eventos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/projects/${projectId}/events`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {event.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {project.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Evento</DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo evento al proyecto.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Nombre del evento"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Descripción del evento"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="startDate">Fecha de inicio *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">Fecha de fin</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Ubicación del evento"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Crear Evento
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              {canEditEvent(event) && (
                <>
                  <Link href={`/projects/${projectId}/events?edit=${event.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeleteEvent}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Información del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-300">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Fecha de inicio
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(event.startDate)} a las {formatTime(event.startDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Fecha de fin
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(event.endDate)} a las {formatTime(event.endDate)}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-center space-x-3 md:col-span-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Ubicación
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Creator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Creador del Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.creator.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.creator.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Contactos invitados
                  </span>
                  <Badge variant="secondary">
                    {event._count.contacts}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Creado
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(event.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Última actualización
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(event.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/projects/${projectId}/events?edit=${event.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar evento
                  </Button>
                </Link>
                
                <Link href={`/projects/${projectId}/contacts`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar contactos
                  </Button>
                </Link>
                
                <Link href={`/projects/${projectId}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver proyecto
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contacts Section */}
        {event.contacts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Contactos Invitados ({event.contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.contacts.map((eventContact) => (
                  <div key={eventContact.contact.id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {eventContact.contact.name}
                        </p>
                        {eventContact.contact.organization && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            <Building className="h-3 w-3 inline mr-1" />
                            {eventContact.contact.organization}
                          </p>
                        )}
                        {eventContact.contact.email && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {eventContact.contact.email}
                          </p>
                        )}
                        {eventContact.contact.phone && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {eventContact.contact.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Otros Eventos del Proyecto ({relatedEvents.length})
              </CardTitle>
              <CardDescription>
                Eventos relacionados en el mismo proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatedEvents.map((relatedEvent) => (
                  <div key={relatedEvent.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {relatedEvent.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(relatedEvent.startDate)} - {relatedEvent.location}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Creado por {relatedEvent.creator.name} • {relatedEvent._count.contacts} contactos
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/projects/${projectId}/events/${relatedEvent.id}`}>
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {relatedEvents.length >= 5 && (
                <div className="mt-4 text-center">
                  <Link href={`/projects/${projectId}/events`}>
                    <Button variant="outline" size="sm">
                      Ver todos los eventos
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
