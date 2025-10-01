// =====================================================
// Project Detail Page - Sepresac SaaS
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
import { ArrowLeft, Users, Calendar, Settings, Plus, Mail, UserPlus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  description: string
  status: "ACTIVE" | "ARCHIVED"
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
  events: Array<{
    id: string
    title: string
    startDate: string
    endDate: string
    location: string
    creator: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    events: number
    members: number
  }
  createdAt: string
  updatedAt: string
}

export default function ProjectDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "MEMBER"
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchProject()
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteData.email.trim()) {
      toast.error("El email es requerido")
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inviteData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Miembro invitado exitosamente")
        setInviteData({ email: "", role: "MEMBER" })
        setIsInviteDialogOpen(false)
        fetchProject()
      } else {
        toast.error(data.error || "Error al invitar miembro")
      }
    } catch (error) {
      toast.error("Error al invitar miembro")
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800"
      case "CO_OWNER":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Propietario"
      case "CO_OWNER":
        return "Co-Propietario"
      default:
        return "Miembro"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (!session || !project) {
    return null
  }

  const isOwner = project.owner.id === session.user?.id
  const userRole = project.members.find(m => m.user.id === session.user?.id)?.role || "MEMBER"
  const isCoOwner = userRole === "CO_OWNER"

  // Función para verificar si el usuario puede editar un evento
  const canEditEvent = (event: any) => {
    if (!session?.user?.id) return false
    const isEventCreator = event.creator.id === session.user.id
    return isOwner || isEventCreator || isCoOwner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <p className="text-gray-600">
                  {project.description || "Sin descripción"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getRoleBadgeColor(isOwner ? "OWNER" : userRole)}>
                {getRoleLabel(isOwner ? "OWNER" : userRole)}
              </Badge>
              {(isOwner || userRole === "CO_OWNER") && (
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invitar Miembro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invitar Miembro</DialogTitle>
                      <DialogDescription>
                        Invita a un usuario existente a unirse al proyecto.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInviteMember} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email del usuario</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="usuario@ejemplo.com"
                          value={inviteData.email}
                          onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <select
                          id="role"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={inviteData.role}
                          onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                        >
                          <option value="MEMBER">Miembro</option>
                          {isOwner && <option value="CO_OWNER">Co-Propietario</option>}
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsInviteDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Invitar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Eventos</p>
                      <p className="text-2xl font-bold text-gray-900">{project._count.events}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Miembros</p>
                      <p className="text-2xl font-bold text-gray-900">{project._count.members}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Settings className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Estado</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {project.status === "ACTIVE" ? "Activo" : "Archivado"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Eventos Recientes</CardTitle>
                    <div className="flex space-x-2">
                      <Link href={`/projects/${projectId}/contacts`}>
                        <Button size="sm" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Contactos
                        </Button>
                      </Link>
                      {(isOwner || isCoOwner) && (
                        <Link href={`/projects/${projectId}/events`}>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Evento
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                {project.events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay eventos en este proyecto</p>
                    {(isOwner || isCoOwner) && (
                      <Link href={`/projects/${projectId}/events`}>
                        <Button className="mt-4" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primer Evento
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.startDate).toLocaleDateString()} - {event.location}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Creado por {event.creator.name}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/projects/${projectId}/events`}>
                            <Button size="sm" variant="outline">
                              Ver
                            </Button>
                          </Link>
                          {canEditEvent(event) && (
                            <Link href={`/projects/${projectId}/events?edit=${event.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Members */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Miembros del Proyecto</CardTitle>
                    <CardDescription>
                      {project._count.members} miembros en total
                    </CardDescription>
                  </div>
                  {(isOwner || isCoOwner) && (
                    <Link href={`/projects/${projectId}/contacts`}>
                      <Button size="sm" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Ver Contactos
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-800">
                          {project.owner.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{project.owner.name}</p>
                        <p className="text-sm text-gray-600">{project.owner.email}</p>
                      </div>
                    </div>
                    <Badge className={getRoleBadgeColor("OWNER")}>
                      {getRoleLabel("OWNER")}
                    </Badge>
                  </div>

                  {/* Members */}
                  {project.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {member.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.user.name}</p>
                          <p className="text-sm text-gray-600">{member.user.email}</p>
                        </div>
                      </div>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Creado por</Label>
                  <p className="text-sm">{project.owner.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha de creación</Label>
                  <p className="text-sm">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Última actualización</Label>
                  <p className="text-sm">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
