import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas de API usam service-role key e não precisam de sessão SSR.
  // Bypass ANTES de qualquer chamada ao Supabase Auth para evitar latência.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() atualiza a sessão e verifica o token — necessário para páginas
  const { data: { user } } = await supabase.auth.getUser()

  // Rotas públicas (auth/callback precisa ser pública: usuário chega sem sessão, só com o code)
  const publicRoutes = ['/login', '/aceitar-convite', '/auth/callback']
  const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r))

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const role = user.user_metadata?.role as string | undefined

    // Admin tentando acessar área de paciente
    if (role === 'admin' && pathname.startsWith('/painel')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/painel'
      return NextResponse.redirect(url)
    }

    // Paciente tentando acessar área admin
    if (role === 'patient' && pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/painel'
      return NextResponse.redirect(url)
    }

    // Usuário autenticado tentando acessar login
    if (isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin/painel' : '/painel'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
