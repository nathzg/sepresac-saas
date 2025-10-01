// =====================================================
// Guided Tour Component - ponteGEEK SaaS
// =====================================================

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Target, 
  Eye, 
  Plus,
  Calendar,
  Users,
  FileText,
  Sparkles
} from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
  actionText?: string
  icon: React.ComponentType<{ className?: string }>
}

interface GuidedTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a ponteGEEK! 👋',
    description: 'Te guiaremos por las funciones principales para que puedas comenzar a gestionar eventos como un profesional.',
    target: 'tour-welcome',
    position: 'bottom',
    icon: Sparkles
  },
  {
    id: 'dashboard-overview',
    title: 'Dashboard Principal',
    description: 'Aquí tienes una vista general de tus proyectos, eventos y estadísticas importantes.',
    target: 'dashboard-stats',
    position: 'bottom',
    icon: Target
  },
  {
    id: 'create-project',
    title: 'Crear Proyecto',
    description: 'Haz clic aquí para crear tu primer proyecto. Te guiaremos paso a paso.',
    target: 'create-project-btn',
    position: 'left',
    actionText: 'Crear Proyecto',
    icon: Plus
  },
  {
    id: 'quick-actions',
    title: 'Acciones Rápidas',
    description: 'Accesos directos a las funciones más utilizadas: crear proyectos, ver proyectos y gestionar contactos.',
    target: 'quick-actions',
    position: 'top',
    icon: Eye
  },
  {
    id: 'recent-events',
    title: 'Eventos Recientes',
    description: 'Mantente al día con los últimos eventos creados en tus proyectos.',
    target: 'recent-events',
    position: 'left',
    icon: Calendar
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Recibe alertas importantes sobre tus eventos y proyectos.',
    target: 'notifications',
    position: 'right',
    icon: Users
  },
  {
    id: 'complete',
    title: '¡Tour Completado! 🎉',
    description: 'Ya conoces las funciones principales. ¡Es hora de crear tu primer proyecto y comenzar a organizar eventos!',
    target: 'tour-complete',
    position: 'bottom',
    actionText: 'Comenzar',
    icon: Sparkles
  }
]

export function GuidedTour({ isOpen, onClose, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => {
        highlightTarget()
      }, 100)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, currentStep])

  const highlightTarget = () => {
    const target = document.querySelector(`[data-tour="${tourSteps[currentStep].target}"]`) as HTMLElement
    if (target) {
      targetRef.current = target
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    onComplete?.()
    onClose()
  }

  const handleAction = () => {
    const step = tourSteps[currentStep]
    if (step.action) {
      step.action()
    }
    nextStep()
  }

  if (!isOpen || !isVisible) return null

  const currentStepData = tourSteps[currentStep]
  const Icon = currentStepData.icon

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Tour Tooltip */}
      {targetRef.current && (
        <div
          className="fixed z-50 transition-all duration-300"
          style={{
            top: getTooltipPosition().top,
            left: getTooltipPosition().left,
            transform: getTooltipTransform()
          }}
        >
          <Card className="w-80 shadow-2xl border-2 border-blue-500 bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentStepData.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {currentStep + 1}/{tourSteps.length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {currentStepData.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      {tourSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentStep
                              ? 'bg-blue-600'
                              : index < currentStep
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      {currentStep > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={previousStep}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                      )}
                      
                      {currentStepData.actionText ? (
                        <Button
                          size="sm"
                          onClick={handleAction}
                        >
                          {currentStepData.actionText}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={nextStep}
                        >
                          {currentStep === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Highlight Target */}
      {targetRef.current && (
        <div
          className="fixed z-45 pointer-events-none"
          style={{
            top: targetRef.current.offsetTop - 4,
            left: targetRef.current.offsetLeft - 4,
            width: targetRef.current.offsetWidth + 8,
            height: targetRef.current.offsetHeight + 8,
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}
    </>
  )

  function getTooltipPosition() {
    if (!targetRef.current) return { top: '50%', left: '50%' }

    const rect = targetRef.current.getBoundingClientRect()
    const position = currentStepData.position

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`
        }
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`
        }
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`
        }
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`
        }
      default:
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left + rect.width / 2}px`
        }
    }
  }

  function getTooltipTransform() {
    const position = currentStepData.position

    switch (position) {
      case 'top':
        return 'translate(-50%, -100%)'
      case 'bottom':
        return 'translate(-50%, 0)'
      case 'left':
        return 'translate(-100%, -50%)'
      case 'right':
        return 'translate(0, -50%)'
      default:
        return 'translate(-50%, -50%)'
    }
  }
}
