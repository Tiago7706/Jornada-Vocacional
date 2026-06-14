import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.role === 'admin') redirect('/admin/painel')

  return (
    <div className="min-h-screen" style={{ backgroundImage: "url('/images/bg-painel.png')", backgroundSize: 'cover', backgroundPosition: 'top center', backgroundAttachment: 'fixed' }}>
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            <span className="font-semibold">Jornada Vocacional</span>
          </div>
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
