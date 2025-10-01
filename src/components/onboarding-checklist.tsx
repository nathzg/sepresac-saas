// =====================================================
// Onboarding Checklist Component - ponteGEEK SaaS
// =====================================================

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  Plus, 
  Calendar, 
  Users, 
  FileText, 
  ArrowRight,
  Sparkles,
  Target
} from "lucide-react"
import { toast } from "sonner"

interface ChecklistItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  action: () => void
  actionText: string
}

interface OnboardingChecklistProps {
  onProjectCreated?: () => void
  onEventCreated?: () => void
  onTeamInvited?: () => void
  onContactsAdded?: () => void
  onCreateDemo?: () => void
}

export function OnboardingChecklist({ 
  onProjectCreated, 
  onEventCreated, 
  onTeamInvited, 
  onContactsAdded,
  onCreateDemo 
}: OnboardingChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'create-project',
      title: 'Crear tu primer proyecto',
      description: 'Organiza eventos y gestiona contactos',
      icon: FileText,
      completed: false,
      action: () => {
        // Se manejará desde el componente padre
        toast.success("¡Proyecto creado! ✅")
        onProjectCreated?.()
      },
      actionText: 'Crear Proyecto'
    },
    {
      id: 'create-event',
      title: 'Crear tu primer evento',
      description: 'Agrega fechas, ubicación y detalles',
      icon: Calendar,
      completed: false,
      action: () => {
        toast.success("¡Evento creado! ✅")
        onEventCreated?.()
      },
      actionText: 'Crear Evento'
    },
    {
      id: 'invite-team',
      title: 'Invitar equipo',
      description: 'Colabora con otros miembros',
      icon: Users,
      completed: false,
      action: () => {
        toast.success("¡Equipo invitado! ✅")
        onTeamInvited?.()
      },
      actionText: 'Invitar Equipo'
    },
    {
      id: 'add-contacts',
      title: 'Agregar contactos',
      description: 'Importa tu lista de invitados',
      icon: Users,
      completed: false,
      action: () => {
        toast.success("¡Contactos agregados! ✅")
        onContactsAdded?.()
      },
      actionText: 'Agregar Contactos'
    }
  ])

  const completedCount = checklist.filter(item => item.completed).length
  const totalCount = checklist.length
  const progressPercentage = (completedCount / totalCount) * 100

  const handleItemClick = (item: ChecklistItem) => {
    if (!item.completed) {
      item.action()
      setChecklist(prev => 
        prev.map(i => 
          i.id === item.id 
            ? { ...i, completed: true }
            : i
        )
      )
    }
  }

  const getCompletionMessage = () => {
    if (completedCount === 0) {
      return "¡Comencemos tu onboarding! 🚀"
    } else if (completedCount < totalCount) {
      return `¡Excelente progreso! ${completedCount}/${totalCount} completado`
    } else {
      return "¡Felicidades! Has completado el onboarding 🎉"
    }
  }

  const getCompletionColor = () => {
    if (completedCount === 0) return "bg-blue-500"
    if (completedCount < totalCount) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Checklist de Onboarding
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-200">
                {getCompletionMessage()}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${getCompletionColor()} text-white border-0`}
          >
            {completedCount}/{totalCount}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-4">
          <div
            className={`${getCompletionColor()} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {checklist.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                  item.completed
                    ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {item.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${
                      item.completed 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <h4 className={`text-sm font-medium ${
                      item.completed
                        ? 'text-green-900 dark:text-green-100 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.title}
                    </h4>
                  </div>
                  <p className={`text-xs mt-1 ${
                    item.completed
                      ? 'text-green-700 dark:text-green-200'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.description}
                  </p>
                </div>

                {!item.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemClick(item)
                    }}
                  >
                    {item.actionText}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}

                {item.completed && (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs font-medium">¡Listo!</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {completedCount === totalCount && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                  ¡Onboarding completado! 🎉
                </h4>
                <p className="text-xs text-green-700 dark:text-green-200 mt-1">
                  Ya estás listo para gestionar eventos como un profesional
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateDemo?.()}
                className="h-7 px-3 text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Ver Demo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
