// =====================================================
// Project Events Page - Sepresac SaaS
// =====================================================

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Calendar, MapPin, Users, Clock, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

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
  owner: {
    id: string
    name: string
    email: string
  }
  members: Array<{
    id: string
    role: "MEMBER" | "CO_OWNER"
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

export default function ProjectEventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
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
      fetchProject()
      fetchEvents()
    }
  }, [status, router, projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()
      
      if (response.ok) {
        setProject(data.project)
      } else {
        toast.error("Error al cargar proyecto")
        router.push("/projects")
      }
    } catch (error) {
      toast.error("Error al cargar proyecto")
      router.push("/projects")
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/events`)
      const data = await response.json()
      
      if (response.ok) {
        setEvents(data.events)
      } else {
        toast.error("Error al cargar eventos")
      }
    } catch (error) {
      toast.error("Error al cargar eventos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEvent.title.trim() || !newEvent.startDate) {
      toast.error("Título y fecha de inicio son requeridos")
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Evento creado exitosamente")
        setNewEvent({ title: "", description: "", startDate: "", endDate: "", location: "" })
        setIsDialogOpen(false)
        fetchEvents()
      } else {
        toast.error(data.error || "Error al crear evento")
      }
    } catch (error) {
      toast.error("Error al crear evento")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/events/${eventId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Evento eliminado exitosamente")
        fetchEvents()
      } else {
        toast.error(data.error || "Error al eliminar evento")
      }
    } catch (error) {
      toast.error("Error al eliminar evento")
    }
  }

  const canEditEvent = (event: Event) => {
    if (!session?.user?.id || !project) return false
    
    const isOwner = project.owner.id === session.user.id
    const isCreator = event.creator.id === session.user.id
    const isCoOwner = project.members.find(m => m.user.id === session.user?.id)?.role === "CO_OWNER"
    
    return isOwner || isCreator || isCoOwner
  }

  const formatEventForCalendar = (event: Event) => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    extendedProps: {
      description: event.description,
      location: event.location,
      creator: event.creator.name,
      contactsCount: event._count.contacts
    }
  })

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  if (!session || !project) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href={`/projects/${projectId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Eventos - {project.name}
                </h1>
                <p className="text-gray-600">
                  Gestiona la agenda de eventos del proyecto
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendario
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                >
                  Lista
                </Button>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
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
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        placeholder="Título del evento"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Input
                        id="description"
                        placeholder="Descripción del evento"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha Inicio *</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={newEvent.startDate}
                          onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Fecha Fin</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={newEvent.endDate}
                          onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        placeholder="Ubicación del evento"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'calendar' ? (
          <Card>
            <CardContent className="p-6">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events.map(formatEventForCalendar)}
                eventClick={(info) => {
                  const event = events.find(e => e.id === info.event.id)
                  if (event) {
                    // Aquí podrías abrir un modal con los detalles del evento
                    toast.info(`Evento: ${event.title}`)
                  }
                }}
                height="auto"
                locale="es"
                buttonText={{
                  today: 'Hoy',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día'
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay eventos
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Crea tu primer evento para comenzar a organizar la agenda del proyecto.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Evento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <Badge variant="outline">
                            {new Date(event.startDate).toLocaleDateString()}
                          </Badge>
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-600 mb-3">{event.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event._count.contacts} contactos
                          </div>
                          <div className="text-xs">
                            Creado por {event.creator.name}
                          </div>
                        </div>
                      </div>
                      
                      {canEditEvent(event) && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
