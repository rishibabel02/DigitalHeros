import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo">GolfGive</Link>

        <ul className="navbar-links">
          <li><Link href="/charities">Charities</Link></li>
          <li><Link href="/how-it-works">How It Works</Link></li>
          <li><Link href="/draws">Draw Results</Link></li>
          {isAdmin && <li><Link href="/admin" style={{ color: 'var(--purple-light)' }}>Admin</Link></li>}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
              <form action="/api/auth/signout" method="POST">
                <button className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Sign Out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
