import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default async function DrawHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('draw_entries')
    .select('*, draws(month, year, status, winning_numbers)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  function countMatches(scores: number[], winning: number[]): number {
    if (!scores || !winning) return 0
    return scores.filter(s => winning.includes(s)).length
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Dashboard</p>
          </div>
          {[
            { href: '/dashboard', label: 'Overview', icon: '🏠' },
            { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
            { href: '/dashboard/draws', label: 'Draw History', icon: '🎰' },
            { href: '/dashboard/charity', label: 'My Charity', icon: '💜' },
            { href: '/dashboard/winnings', label: 'Winnings', icon: '🏆' },
            { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
            { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
          ].map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link${item.href === '/dashboard/draws' ? ' active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-header">
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🎰 Draw History</h1>
            <p style={{ color: 'var(--text-muted)' }}>Your participation history across all monthly draws.</p>
          </div>

          {!entries || entries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎰</div>
              <h3 style={{ marginBottom: '0.75rem' }}>No draw history yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Once you have an active subscription and scores logged, you&apos;ll be automatically entered into monthly draws.
              </p>
              <Link href="/dashboard/scores" className="btn btn-primary">Log Your Scores</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {entries.map((entry: any) => {
                const draw = entry.draws
                const scores: number[] = entry.scores_snapshot || []
                const winning: number[] = draw?.winning_numbers || []
                const matches = countMatches(scores, winning)
                const isPublished = draw?.status === 'published'

                return (
                  <div key={entry.id} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                          {draw ? `${MONTHS[(draw.month || 1) - 1]} ${draw.year}` : 'Unknown Draw'}
                        </h3>
                        <span className={`badge badge-${isPublished ? 'published' : 'pending'}`}>
                          {draw?.status || 'unknown'}
                        </span>
                      </div>
                      {isPublished && matches > 0 && (
                        <div style={{
                          background: matches >= 5 ? 'rgba(245,158,11,0.15)' : 'rgba(168,85,247,0.15)',
                          border: `1px solid ${matches >= 5 ? 'rgba(245,158,11,0.4)' : 'rgba(168,85,247,0.4)'}`,
                          borderRadius: 'var(--radius)',
                          padding: '0.5rem 1rem',
                          color: matches >= 5 ? 'var(--gold)' : 'var(--purple-light)',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}>
                          🎯 {matches} Match{matches !== 1 ? 'es' : ''}!
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Your Scores</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {scores.length > 0 ? scores.map((s, i) => (
                            <span key={i} style={{
                              width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem',
                              background: isPublished && winning.includes(s) ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.06)',
                              border: isPublished && winning.includes(s) ? 'none' : '1px solid var(--border)',
                              color: isPublished && winning.includes(s) ? 'white' : 'var(--text-secondary)'
                            }}>{s}</span>
                          )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No scores recorded</span>}
                        </div>
                      </div>

                      {isPublished && winning.length > 0 && (
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Winning Numbers</p>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {winning.map((n, i) => (
                              <span key={i} style={{
                                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem',
                                background: 'var(--gradient-gold)', color: 'white'
                              }}>{n}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
