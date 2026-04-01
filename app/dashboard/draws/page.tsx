'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const SIDEBAR = [
  { href: '/dashboard', label: 'Overview', icon: '🏠' },
  { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
  { href: '/dashboard/draws', label: 'Draw History', icon: '🎰' },
  { href: '/dashboard/charity', label: 'My Charity', icon: '💜' },
  { href: '/dashboard/winnings', label: 'Winnings', icon: '🏆' },
  { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
]

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function DrawHistoryPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data } = await supabase
        .from('draw_entries')
        .select('*, draws(month, year, status, winning_numbers, jackpot_rolled_over)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">GolfGive</Link>
          <div className="navbar-actions">
            <Link href="/dashboard" className="btn btn-secondary btn-sm">← Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="dashboard-layout">
        <aside className="sidebar">
          {SIDEBAR.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${item.href === '/dashboard/draws' ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-header">
            <h1 style={{ fontSize: '1.8rem' }}>🎰 Draw History</h1>
            <p style={{ color: 'var(--text-muted)' }}>All draws you've participated in.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <span className="spinner" style={{ width: 32, height: 32, margin: '0 auto', display: 'block' }} />
            </div>
          ) : entries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎰</div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>No draw participation yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                You'll be auto-enrolled in draws while you have an active subscription and at least one score logged.
              </p>
              <Link href="/dashboard/scores" className="btn btn-primary btn-sm">Add Your First Score</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {entries.map((entry: any) => {
                const draw = entry.draws
                const isPublished = draw?.status === 'published'
                const winningNums: number[] = draw?.winning_numbers || []
                const snapshot: number[] = entry.scores_snapshot || []
                const matchCount = snapshot.filter((s: number) => winningNums.includes(s)).length

                return (
                  <div key={entry.id} className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: isPublished ? '1.25rem' : 0 }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                          {draw ? `${MONTHS[draw.month - 1]} ${draw.year}` : 'Draw'}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Your scores: {snapshot.join(', ') || 'No scores'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {isPublished && matchCount >= 3 && (
                          <span className="badge badge-active">🏆 {matchCount}-Match Winner!</span>
                        )}
                        <span className={`badge badge-${draw?.status || 'draft'}`}>{draw?.status || 'Draft'}</span>
                      </div>
                    </div>

                    {isPublished && winningNums.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Winning Numbers</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {winningNums.map((num: number) => {
                            const isMatch = snapshot.includes(num)
                            return (
                              <div key={num} style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                background: isMatch ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.05)',
                                border: isMatch ? 'none' : '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem',
                                color: isMatch ? 'white' : 'var(--text-muted)',
                                boxShadow: isMatch ? '0 0 12px rgba(168,85,247,0.4)' : 'none',
                              }}>
                                {num}
                              </div>
                            )
                          })}
                        </div>
                        {matchCount > 0 && matchCount < 3 && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            You matched {matchCount} number{matchCount !== 1 ? 's' : ''} — need 3 to win a prize
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
