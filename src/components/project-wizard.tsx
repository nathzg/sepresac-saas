// =====================================================
// Project Wizard Component - ponteGEEK SaaS
// =====================================================

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileText, 
  Users, 
  Settings,
  Calendar,
  Mail,
  Building,
  MapPin
} from "lucide-react"
import { toast } from "sonner"

interface ProjectWizardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ProjectData {
  name: string
  description: string
  type: 'event' | 'business' | 'personal' | 'other'
  privacy: 'private' | 'team' | 'public'
  teamEmails: string[]
}

const projectTypes = [
  {
    id: 'event' as const,
    name: 'Evento',
    description: 'Organiza conferencias, talleres, fiestas',
    icon: Calendar,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
  },
  {
    id: 'business' as const,
    name: 'Empresarial',
    description: 'Proyectos corporativos y equipos',
    icon: Building,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
  },
  {
    id: 'personal' as const,
    name: 'Personal',
    description: 'Proyectos personales y hobbies',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
  },
  {
    id: 'other' as const,
    name: 'Otro',
    description: 'Otro tipo de proyecto',
    icon: Settings,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
  }
]

const privacyOptions = [
  {
    id: 'private' as const,
    name: 'Privado',
    description: 'Solo tú puedes ver y editar',
    icon: '🔒'
  },
  {
    id: 'team' as const,
    name: 'Equipo',
    description: 'Miembros invitados pueden colaborar',
    icon: '👥'
  },
  {
    id: 'public' as const,
    name: 'Público',
    description: 'Cualquiera puede ver (no editar)',
    icon: '🌐'
  }
]

export function ProjectWizard({ isOpen, onClose, onSuccess }: ProjectWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    type: 'event',
    privacy: 'private',
    teamEmails: []
  })
  const [newEmail, setNewEmail] = useState('')

  const totalSteps = 3

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      toast.error("El nombre del proyecto es requerido")
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          type: projectData.type,
          privacy: projectData.privacy
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("¡Proyecto creado exitosamente! 🎉", {
          description: "Ya puedes comenzar a organizar eventos y gestionar contactos",
          action: {
            label: "Ver Proyecto",
            onClick: () => router.push("/projects")
          }
        })
        
        onSuccess?.()
        onClose()
        resetWizard()
      } else {
        toast.error(data.error || "Error al crear proyecto")
      }
    } catch (error) {
      toast.error("Error al crear proyecto")
    } finally {
      setIsCreating(false)
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setProjectData({
      name: '',
      description: '',
      type: 'event',
      privacy: 'private',
      teamEmails: []
    })
    setNewEmail('')
  }

  const addTeamEmail = () => {
    if (newEmail.trim() && !projectData.teamEmails.includes(newEmail.trim())) {
      setProjectData(prev => ({
        ...prev,
        teamEmails: [...prev.teamEmails, newEmail.trim()]
      }))
      setNewEmail('')
    }
  }

  const removeTeamEmail = (email: string) => {
    setProjectData(prev => ({
      ...prev,
      teamEmails: prev.teamEmails.filter(e => e !== email)
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Información básica</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comencemos con los datos esenciales de tu proyecto
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del proyecto *</Label>
                <Input
                  id="name"
                  placeholder="Mi Conferencia 2024"
                  value={projectData.name}
                  onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe brevemente tu proyecto..."
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tipo y privacidad</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configura el tipo de proyecto y quién puede acceder
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Tipo de proyecto</Label>
                <div className="grid grid-cols-2 gap-3">
                  {projectTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          projectData.type === type.id
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setProjectData(prev => ({ ...prev, type: type.id }))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{type.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Privacidad</Label>
                <div className="space-y-2">
                  {privacyOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        projectData.privacy === option.id
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setProjectData(prev => ({ ...prev, privacy: option.id }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <h4 className="font-medium">{option.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Invitar equipo (opcional)</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Invita colaboradores a tu proyecto. Puedes hacerlo más tarde.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email del colaborador</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="colaborador@empresa.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTeamEmail()}
                  />
                  <Button
                    type="button"
                    onClick={addTeamEmail}
                    disabled={!newEmail.trim()}
                    size="sm"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {projectData.teamEmails.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Colaboradores invitados ({projectData.teamEmails.length})
                  </Label>
                  <div className="space-y-2">
                    {projectData.teamEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm">{email}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamEmail(email)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      ¡Casi listo!
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      Después de crear el proyecto, podrás:
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-200 mt-2 space-y-1">
                      <li>• Crear eventos y gestionar fechas</li>
                      <li>• Agregar contactos y colaboradores</li>
                      <li>• Configurar recordatorios automáticos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Crear Nuevo Proyecto</span>
            <Badge variant="outline" className="ml-2">
              Paso {currentStep} de {totalSteps}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Configura tu proyecto paso a paso para una experiencia óptima
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            disabled={isCreating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </Button>

          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i + 1 <= currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 && !projectData.name.trim()}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateProject}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Crear Proyecto
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
