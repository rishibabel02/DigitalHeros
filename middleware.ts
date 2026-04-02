import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ─── Public paths (no auth needed) ───────────────────────────────────────
  const PUBLIC_PATHS = ['/', '/charities', '/how-it-works', '/login', '/signup']
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/api/webhooks'))

  // ─── Auth required ────────────────────────────────────────────────────────
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // ─── Admin routes: server-side role check ─────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .limit(1)
      .maybeSingle()

    if (!profile || profile.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // ─── Subscription-gated routes ─────────────────────────────────────────────
  const SUBSCRIPTION_REQUIRED = ['/api/scores', '/api/draws/enter']
  const needsSubscription = SUBSCRIPTION_REQUIRED.some(p => pathname.startsWith(p))

  if (user && needsSubscription) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required', code: 'SUBSCRIPTION_REQUIRED' },
        { status: 403 }
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
