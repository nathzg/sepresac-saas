// =====================================================
// Project Contacts Page - Sepresac SaaS
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
import { ArrowLeft, Plus, Users, Mail, Phone, Building, User, Edit, Trash2, Search } from "lucide-react"
import { toast } from "sonner"

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  organization: string
  position: string
  notes: string
  _count: {
    eventContacts: number
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

export default function ProjectContactsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    position: "",
    notes: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchProject()
      fetchContacts()
    }
  }, [status, router, projectId])

  useEffect(() => {
    // Filtrar contactos basado en el término de búsqueda
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredContacts(filtered)
  }, [contacts, searchTerm])

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

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/contacts`)
      const data = await response.json()
      
      if (response.ok) {
        setContacts(data.contacts)
      } else {
        toast.error("Error al cargar contactos")
      }
    } catch (error) {
      toast.error("Error al cargar contactos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newContact.name.trim() || !newContact.email.trim()) {
      toast.error("Nombre y email son requeridos")
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Contacto creado exitosamente")
        setNewContact({ name: "", email: "", phone: "", organization: "", position: "", notes: "" })
        setIsDialogOpen(false)
        fetchContacts()
      } else {
        toast.error(data.error || "Error al crear contacto")
      }
    } catch (error) {
      toast.error("Error al crear contacto")
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este contacto?")) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/contacts/${contactId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Contacto eliminado exitosamente")
        fetchContacts()
      } else {
        toast.error(data.error || "Error al eliminar contacto")
      }
    } catch (error) {
      toast.error("Error al eliminar contacto")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando contactos...</p>
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
                  Contactos - {project.name}
                </h1>
                <p className="text-gray-600">
                  Gestiona la agenda de contactos del proyecto
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Contacto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Contacto</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo contacto al proyecto.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateContact} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      placeholder="Nombre completo"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="+1 234 567 8900"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organización</Label>
                    <Input
                      id="organization"
                      placeholder="Nombre de la organización"
                      value={newContact.organization}
                      onChange={(e) => setNewContact({ ...newContact, organization: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo/Posición</Label>
                    <Input
                      id="position"
                      placeholder="Cargo o posición"
                      value={newContact.position}
                      onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Input
                      id="notes"
                      placeholder="Notas adicionales"
                      value={newContact.notes}
                      onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
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
                      Crear Contacto
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar contactos por nombre, email, organización o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No se encontraron contactos" : "No hay contactos"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Intenta con otros términos de búsqueda."
                  : "Crea tu primer contacto para comenzar a organizar la agenda del proyecto."
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Contacto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-600" />
                        {contact.name}
                      </CardTitle>
                      {contact.position && (
                        <CardDescription className="mt-1">
                          {contact.position}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  
                  {contact.organization && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{contact.organization}</span>
                    </div>
                  )}
                  
                  {contact.notes && (
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">{contact.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <Badge variant="outline">
                      {contact._count.eventContacts} eventos
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(contact.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {contacts.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
                    <div className="text-sm text-gray-600">Total Contactos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {contacts.filter(c => c.organization).length}
                    </div>
                    <div className="text-sm text-gray-600">Con Organización</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {contacts.reduce((sum, c) => sum + c._count.eventContacts, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Participaciones en Eventos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
