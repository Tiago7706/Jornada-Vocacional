import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Map,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin/painel', label: 'Painel', icon: LayoutDashboard },
  { href: '/admin/pacientes', label: 'Pacientes', icon: Users },
  { href: '/admin/configuracoes/prompts', label: 'Configuracoes', icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/painel')

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col">
        <div className="h-14 border-b flex items-center px-4 gap-2">
          <Map className="h-5 w-5" />
          <span className="font-semibold text-sm">Admin — Jornada</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" type="submit">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
