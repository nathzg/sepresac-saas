// =====================================================
// Home Page - Sepresac SaaS
// =====================================================

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, FileText, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4">
                <div className="flex items-center mb-4 sm:mb-0">
                  <img 
                    src="/logo-light.png" 
                    alt="ponteGEEK" 
                    className="h-6 w-auto dark:hidden sm:h-8"
                  />
                  <img 
                    src="/logo-dark.png" 
                    alt="ponteGEEK" 
                    className="h-6 w-auto hidden dark:block sm:h-8"
                  />
                </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full sm:w-auto h-10 px-4">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto h-10 px-4">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Gestión de Eventos y Proyectos
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Organiza, planifica y ejecuta tus eventos y proyectos de manera eficiente. 
            Gestiona contactos, agenda y colabora con tu equipo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tus eventos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma completa que te permite organizar proyectos, 
              gestionar eventos y mantener contacto con tu audiencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Gestión de Eventos</CardTitle>
                <CardDescription>
                  Crea y organiza eventos con calendario integrado, 
                  gestión de fechas y recordatorios automáticos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Gestión de Contactos</CardTitle>
                <CardDescription>
                  Mantén una agenda completa de contactos por proyecto, 
                  con información detallada y seguimiento.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Gestión de Proyectos</CardTitle>
                <CardDescription>
                  Organiza proyectos con roles y permisos, 
                  invita colaboradores y gestiona el flujo de trabajo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Dashboard y KPIs</CardTitle>
                <CardDescription>
                  Visualiza métricas importantes, 
                  estadísticas de eventos y rendimiento del proyecto.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Únete a miles de organizadores que ya confían en Sepresac 
            para gestionar sus eventos y proyectos.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <img 
                    src="/logo-light.png" 
                    alt="ponteGEEK" 
                    className="h-8 w-auto"
                  />
                  <span className="text-xl font-bold text-white">ponteGEEK</span>
                </div>
                <p className="text-gray-400">
                  © 2024 ponteGEEK. Todos los derechos reservados.
                </p>
          </div>
        </div>
      </footer>
    </div>
  )
}