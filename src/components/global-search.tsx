// =====================================================
// Global Search Component - ponteGEEK SaaS
// =====================================================

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  X, 
  Calendar, 
  Users, 
  FileText, 
  Target,
  Clock,
  ArrowRight,
  Command
} from "lucide-react"

interface SearchResult {
  id: string
  type: 'project' | 'event' | 'contact' | 'action'
  title: string
  description: string
  url?: string
  action?: () => void
  icon: React.ComponentType<any>
  category: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (query.length > 0) {
      searchItems(query)
    } else {
      setResults(getDefaultResults())
    }
  }, [query])

  const getDefaultResults = (): SearchResult[] => [
    {
      id: 'dashboard',
      type: 'action',
      title: 'Ir al Dashboard',
      description: 'Vista principal con estadísticas y resumen',
      url: '/dashboard',
      icon: Target,
      category: 'Navegación'
    },
    {
      id: 'projects',
      type: 'action',
      title: 'Ver Proyectos',
      description: 'Gestionar todos tus proyectos',
      url: '/projects',
      icon: FileText,
      category: 'Navegación'
    },
    {
      id: 'contacts',
      type: 'action',
      title: 'Ver Contactos',
      description: 'Gestionar contactos y colaboradores',
      url: '/contacts',
      icon: Users,
      category: 'Navegación'
    },
    {
      id: 'reports',
      type: 'action',
      title: 'Ver Reportes',
      description: 'Análisis y métricas de rendimiento',
      url: '/reports',
      icon: Target,
      category: 'Navegación'
    }
  ]

  const searchItems = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      // Simular búsqueda en proyectos, eventos y contactos
      const searchResults: SearchResult[] = []

      // Buscar proyectos
      const projectsResponse = await fetch('/api/projects')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        const matchingProjects = projectsData.projects?.filter((project: { name: string; description?: string }) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []

        matchingProjects.forEach((project: { id: string; name: string; description?: string }) => {
          searchResults.push({
            id: `project-${project.id}`,
            type: 'project',
            title: project.name,
            description: project.description || 'Proyecto sin descripción',
            url: `/projects/${project.id}`,
            icon: FileText,
            category: 'Proyectos'
          })
        })
      }

      // Buscar contactos
      const contactsResponse = await fetch('/api/contacts')
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json()
        const matchingContacts = contactsData.contacts?.filter((contact: { name: string; email?: string; company?: string }) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []

        matchingContacts.forEach((contact: { id: string; name: string; email?: string; company?: string }) => {
          searchResults.push({
            id: `contact-${contact.id}`,
            type: 'contact',
            title: contact.name,
            description: `${contact.company || 'Sin empresa'} • ${contact.email || 'Sin email'}`,
            url: `/contacts`,
            icon: Users,
            category: 'Contactos'
          })
        })
      }

      // Agregar acciones de navegación si coinciden
      const navigationActions = getDefaultResults().filter(action =>
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

      searchResults.push(...navigationActions)

      setResults(searchResults)
    } catch (error) {
      console.error('Error searching:', error)
      setResults(getDefaultResults())
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelectResult(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    if (result.url) {
      router.push(result.url)
    } else if (result.action) {
      result.action()
    }
    onClose()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'event':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'contact':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'action':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'Proyecto'
      case 'event':
        return 'Evento'
      case 'contact':
        return 'Contacto'
      case 'action':
        return 'Acción'
      default:
        return 'Item'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar proyectos, contactos, eventos..."
            className="border-0 shadow-none focus-visible:ring-0 text-lg"
          />
          <div className="flex items-center space-x-2 ml-3">
            <Badge variant="outline" className="text-xs">
              <Command className="h-3 w-3 mr-1" />
              K
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

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Buscando...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No se encontraron resultados para &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = result.icon
                return (
                  <div
                    key={result.id}
                    className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      index === selectedIndex ? 'bg-gray-50 dark:bg-gray-800' : ''
                    }`}
                    onClick={() => handleSelectResult(result)}
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </h4>
                        <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)}`}>
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {result.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {result.category}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>↑↓ para navegar</span>
              <span>↵ para seleccionar</span>
              <span>esc para cerrar</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">ponteGEEK</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
