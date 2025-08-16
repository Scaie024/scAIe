import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseTable } from "@/components/database-table"

export default async function Database() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()

  // Fetch contacts data
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contacts:", error)
  }

  return (
    <div className="p-6 space-y-6 bg-stone-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Base de Datos</h1>
        <p className="text-gray-600">Gestiona tus clientes y prospectos con funciones CRUD avanzadas</p>
      </div>

      <Card className="bg-stone-200 border-gray-500">
        <CardHeader>
          <CardTitle className="text-gray-900">Clientes y Prospectos</CardTitle>
          <CardDescription className="text-gray-600">
            Tabla interactiva con búsqueda, filtros, edición inline y exportación CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DatabaseTable initialContacts={contacts || []} />
        </CardContent>
      </Card>
    </div>
  )
}
