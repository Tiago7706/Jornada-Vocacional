'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Gamepad2, Loader2 } from 'lucide-react'

interface Props {
  patientId: string
  patientName: string
}

export default function PathSelector({ patientId, patientName }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  async function selectPath(pathType: 'traditional' | 'interactive') {
    setLoading(pathType)
    await supabase
      .from('patients')
      .update({ path_type: pathType })
      .eq('id', patientId)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Bem-vindo(a), {patientName.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Escolha como prefere fazer sua Jornada Vocacional:
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <div className="p-3 w-fit rounded-lg bg-muted">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg mt-3">Caminho Tradicional</CardTitle>
            <CardDescription>
              Responda questionarios narrativos no seu ritmo, de forma reflexiva e aprofundada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => selectPath('traditional')}
              disabled={loading !== null}
            >
              {loading === 'traditional' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Escolher Tradicional'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <div className="p-3 w-fit rounded-lg bg-muted">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg mt-3">Caminho Interativo</CardTitle>
            <CardDescription>
              Descubra seus interesses atraves de jogos, batalhas e atividades gamificadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => selectPath('interactive')}
              disabled={loading !== null}
            >
              {loading === 'interactive' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Escolher Interativo'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
