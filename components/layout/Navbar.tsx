import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  let profileName = ''
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
    profileName = profile?.full_name || user.email?.split('@')[0] || 'Golfer'
  }

  const initials = profileName
    ? profileName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'G'

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
              {/* User identity pill */}
              <Link href="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.25)',
                borderRadius: '999px',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                {/* Avatar circle */}
                <span style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--gradient-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, color: 'white', flexShrink: 0,
                  fontFamily: 'Outfit, sans-serif',
                }}>{initials}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profileName.split(' ')[0]}
                </span>
                {/* Online dot */}
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
              </Link>

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
