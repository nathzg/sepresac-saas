// =====================================================
// Visual Reports Component - ponteGEEK SaaS
// =====================================================

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
  RefreshCw
} from "lucide-react"

interface KPI {
  id: string
  title: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  format: 'number' | 'percentage' | 'currency'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface EventStats {
  total: number
  completed: number
  upcoming: number
  overdue: number
  thisMonth: number
  lastMonth: number
}

interface ProjectStats {
  total: number
  active: number
  completed: number
  thisMonth: number
  lastMonth: number
}

interface ContactStats {
  total: number
  newThisMonth: number
  withEmail: number
  withPhone: number
  engaged: number
}

interface ReportData {
  kpis: KPI[]
  eventStats: EventStats
  projectStats: ProjectStats
  contactStats: ContactStats
  topProjects: Array<{
    id: string
    name: string
    events: number
    contacts: number
    completion: number
  }>
  recentActivity: Array<{
    id: string
    type: 'event' | 'project' | 'contact'
    title: string
    description: string
    timestamp: string
    status: 'success' | 'warning' | 'info'
  }>
}

export function VisualReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/reports?period=${selectedPeriod}`)
      const data = await response.json()
      
      if (response.ok) {
        setReportData(data)
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value}%`
      case 'currency':
        return `€${value.toLocaleString()}`
      default:
        return value.toLocaleString()
    }
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes y KPIs</h2>
            <p className="text-gray-600 dark:text-gray-400">Análisis de rendimiento y métricas clave</p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Crea algunos proyectos y eventos para ver los reportes
        </p>
        <Button onClick={fetchReportData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes y KPIs</h2>
          <p className="text-gray-600 dark:text-gray-400">Análisis de rendimiento y métricas clave</p>
        </div>
        <div className="flex items-center space-x-3">
          <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
            <TabsList>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mes</TabsTrigger>
              <TabsTrigger value="quarter">Trimestre</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={fetchReportData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportData.kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatValue(kpi.value, kpi.format)}
                </div>
                <div className={`flex items-center text-sm ${getChangeColor(kpi.changeType)}`}>
                  {getChangeIcon(kpi.changeType)}
                  <span className="ml-1">
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </span>
                  <span className="ml-1 text-gray-500">vs período anterior</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Destacados</CardTitle>
                <CardDescription>Proyectos con mayor actividad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {project.events} eventos
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {project.contacts} contactos
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {project.completion}%
                        </div>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                          <div 
                            className="h-2 bg-blue-600 rounded-full" 
                            style={{ width: `${project.completion}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas acciones en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-100 dark:bg-green-900' :
                        activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        {activity.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : activity.status === 'warning' ? (
                          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Proyectos</CardTitle>
                <CardDescription>Proyectos creados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.projectStats.total}
                </div>
                <div className="flex items-center text-sm text-green-600 mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{reportData.projectStats.thisMonth} este mes
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proyectos Activos</CardTitle>
                <CardDescription>En progreso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.projectStats.active}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round((reportData.projectStats.active / reportData.projectStats.total) * 100)}% del total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completados</CardTitle>
                <CardDescription>Proyectos finalizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.projectStats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round((reportData.projectStats.completed / reportData.projectStats.total) * 100)}% del total
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Eventos</CardTitle>
                <CardDescription>Eventos creados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.eventStats.total}
                </div>
                <div className="flex items-center text-sm text-green-600 mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{reportData.eventStats.thisMonth} este mes
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completados</CardTitle>
                <CardDescription>Eventos finalizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.eventStats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round((reportData.eventStats.completed / reportData.eventStats.total) * 100)}% del total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos</CardTitle>
                <CardDescription>Eventos programados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.eventStats.upcoming}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round((reportData.eventStats.upcoming / reportData.eventStats.total) * 100)}% del total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vencidos</CardTitle>
                <CardDescription>Eventos atrasados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.eventStats.overdue}
                </div>
                <div className="text-sm text-red-600 mt-2">
                  Requieren atención
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Contactos</CardTitle>
                <CardDescription>Contactos en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.contactStats.total}
                </div>
                <div className="flex items-center text-sm text-green-600 mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{reportData.contactStats.newThisMonth} este mes
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Con Email</CardTitle>
                <CardDescription>Contactos con correo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.contactStats.withEmail}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round((reportData.contactStats.withEmail / reportData.contactStats.total) * 100)}% del total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Con Teléfono</CardTitle>
                <CardDescription>Contactos con teléfono</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.contactStats.withPhone}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round((reportData.contactStats.withPhone / reportData.contactStats.total) * 100)}% del total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comprometidos</CardTitle>
                <CardDescription>Contactos activos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.contactStats.engaged}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round((reportData.contactStats.engaged / reportData.contactStats.total) * 100)}% del total
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Actividad</CardTitle>
              <CardDescription>Historial completo de acciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100 dark:bg-green-900' :
                      activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : activity.status === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>
                      <Badge 
                        variant="outline" 
                        className="mt-2"
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
