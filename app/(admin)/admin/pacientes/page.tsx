import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, ChevronRight } from 'lucide-react'
import type { Patient } from '@/types/database'

export default async function PacientesPage() {
  const supabase = await createClient()

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Patient[] | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Participantes</h1>
        <Link href="/admin/pacientes/novo">
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Participante
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{patients?.length ?? 0} pacientes cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {patients?.map(p => (
              <Link
                key={p.id}
                href={`/admin/pacientes/${p.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {p.path_type === 'traditional' ? 'Tradicional' :
                     p.path_type === 'interactive' ? 'Interativo' : 'Sem caminho'}
                  </Badge>
                  {p.last_seen_at && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(p.last_seen_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {!patients?.length && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">Nenhum participante cadastrado ainda.</p>
                <Link href="/admin/pacientes/novo" className="mt-2 inline-block">
                  <Button size="sm" variant="outline" className="mt-3">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar primeiro participante
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
