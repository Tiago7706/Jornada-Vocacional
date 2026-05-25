'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { ReportType } from '@/types/database'

interface Props {
  patientId: string
}

export default function GenerateReportButton({ patientId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<ReportType | null>(null)
  const [report, setReport] = useState<{ id: string; content: string; type: ReportType } | null>(null)

  async function generate(reportType: ReportType) {
    setLoading(reportType)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, reportType }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao gerar relatorio.')
        return
      }
      setReport({ id: data.reportId, content: data.content, type: reportType })
      setOpen(true)
      toast.success('Relatorio gerado com sucesso!')
    } catch {
      toast.error('Erro de conexao.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => generate('clinical')}
          disabled={loading !== null}
        >
          {loading === 'clinical' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Gerar Relatorio Clinico
        </Button>
        <Button
          variant="outline"
          onClick={() => generate('simplified')}
          disabled={loading !== null}
        >
          {loading === 'simplified' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Gerar Relatorio Simplificado
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Relatorio {report?.type === 'clinical' ? 'Clinico' : 'Simplificado'}
            </DialogTitle>
            <DialogDescription>Gerado pelo Gemini AI</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none mt-4 whitespace-pre-wrap text-sm">
            {report?.content}
          </div>
          {report?.id && (
            <div className="flex justify-end mt-4">
              <a
                href={`/api/reports/${report.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
