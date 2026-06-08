'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NovoPacientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    admin_notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao cadastrar participante.')
        return
      }

      toast.success('Paciente cadastrado e convite enviado com sucesso!')
      router.push('/admin/pacientes')
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/pacientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Novo Participante</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do participante</CardTitle>
          <CardDescription>
            Apos o cadastro, um e-mail de convite sera enviado automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de nascimento</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_notes">Notas internas</Label>
              <Textarea
                id="admin_notes"
                name="admin_notes"
                value={form.admin_notes}
                onChange={handleChange}
                rows={3}
                disabled={loading}
                placeholder="Observacoes clinicas, contexto, etc."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando convite...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Cadastrar e enviar convite</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
