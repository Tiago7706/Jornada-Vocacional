'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

const VARIABLES = [
  { key: '{{patient_name}}', desc: 'Nome do paciente' },
  { key: '{{path_type}}', desc: 'Tipo de caminho (traditional/interactive)' },
  { key: '{{generated_at}}', desc: 'Data/hora de geração' },
  { key: '{{scores_json}}', desc: 'JSON completo com todos os scores' },
]

export default function PromptsPage() {
  const supabase = createClient()
  const [clinical, setClinical] = useState('')
  const [simplified, setSimplified] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('report_prompts').select('*')
      setClinical(data?.find(p => p.prompt_type === 'clinical')?.template ?? '')
      setSimplified(data?.find(p => p.prompt_type === 'simplified')?.template ?? '')
      setLoading(false)
    }
    load()
  }, [supabase])

  async function save(type: 'clinical' | 'simplified') {
    setSaving(type)
    const template = type === 'clinical' ? clinical : simplified

    const { error } = await supabase
      .from('report_prompts')
      .update({ template, updated_at: new Date().toISOString() })
      .eq('prompt_type', type)

    if (error) {
      toast.error('Erro ao salvar prompt.')
    } else {
      toast.success('Prompt salvo com sucesso!')
    }
    setSaving(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuracoes de Prompts</h1>
        <p className="text-muted-foreground mt-1">Edite os templates de prompt enviados ao Gemini para gerar relatorios.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Variaveis disponiveis</CardTitle>
          <CardDescription>Use estas variaveis nos templates — serao substituidas pelos dados do paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {VARIABLES.map(v => (
              <div key={v.key} className="flex items-start gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono whitespace-nowrap">{v.key}</code>
                <span className="text-xs text-muted-foreground">{v.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="clinical">
        <TabsList>
          <TabsTrigger value="clinical">Relatorio Clinico</TabsTrigger>
          <TabsTrigger value="simplified">Relatorio Simplificado</TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="space-y-4 mt-4">
          <Textarea
            value={clinical}
            onChange={e => setClinical(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
          <Button onClick={() => save('clinical')} disabled={saving === 'clinical'}>
            {saving === 'clinical' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Prompt Clinico
          </Button>
        </TabsContent>

        <TabsContent value="simplified" className="space-y-4 mt-4">
          <Textarea
            value={simplified}
            onChange={e => setSimplified(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
          <Button onClick={() => save('simplified')} disabled={saving === 'simplified'}>
            {saving === 'simplified' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Prompt Simplificado
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
