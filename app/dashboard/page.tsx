import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: subscription },
    { data: scores },
    { data: userCharity },
    { data: notifications },
    { data: drawEntries },
    { data: wins },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('golf_scores').select('*').eq('user_id', user.id).order('played_date', { ascending: false }).limit(5),
    supabase.from('user_charities').select('*, charities(name)').eq('user_id', user.id).single(),
    supabase.from('notifications').select('*').eq('user_id', user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('draw_entries').select('*, draws(month, year, status)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('winner_verifications').select('*, draws(month, year)').eq('user_id', user.id),
  ])

  const subStatus = subscription?.status || 'inactive'
  const unreadCount = notifications?.length || 0
  const totalWon = wins?.filter((w: any) => w.payment_status === 'paid').length || 0
  const currentDraw = drawEntries?.find((e: any) => e.draws?.status !== 'published')

  const statusColors: Record<string, string> = {
    active: 'var(--green)',
    inactive: 'var(--red)',
    lapsed: '#f87171',
    cancelled: 'var(--text-muted)',
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' }}>Dashboard</p>
          </div>
          {[
            { href: '/dashboard', label: 'Overview', icon: '🏠' },
            { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
            { href: '/dashboard/draws', label: 'Draw History', icon: '🎰' },
            { href: '/dashboard/charity', label: 'My Charity', icon: '💜' },
            { href: '/dashboard/winnings', label: 'Winnings', icon: '🏆' },
            { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
            { href: '/dashboard/notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: '🔔' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="sidebar-link">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <div className="dashboard-header">
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
              Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Golfer'}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Here's your performance and giving overview.</p>
          </div>

          {/* Subscription Warning */}
          {subStatus !== 'active' && (
            <div className="alert alert-warning" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚠️ Your subscription is {subStatus}. Score entry and draw participation are restricted.</span>
              <Link href="/subscribe" className="btn btn-gold btn-sm">Subscribe Now</Link>
            </div>
          )}

          {/* Stats Grid */}
          <div className="dashboard-grid">
            {/* Subscription */}
            <div className="card stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💳</span>
                <span className={`badge badge-${subStatus}`}>{subStatus}</span>
              </div>
              <div className="stat-value" style={{ color: statusColors[subStatus] || 'var(--text-primary)' }}>
                {subscription?.plan === 'yearly' ? 'Yearly' : subscription?.plan === 'monthly' ? 'Monthly' : 'No Plan'}
              </div>
              <div className="stat-label">Subscription</div>
              {subscription?.renewal_date && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Renews {new Date(subscription.renewal_date).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>

            {/* Scores */}
            <div className="card stat-card">
              <div style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>⛳</div>
              <div className="stat-value gradient-text">{scores?.length || 0}/5</div>
              <div className="stat-label">Scores Logged</div>
              {scores && scores.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Latest: <strong style={{ color: 'var(--text-secondary)' }}>{scores[0].score} pts</strong> on {new Date(scores[0].played_date).toLocaleDateString('en-GB')}
                </p>
              )}
              <Link href="/dashboard/scores" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                Manage Scores
              </Link>
            </div>

            {/* Current Draw */}
            <div className="card stat-card">
              <div style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>🎰</div>
              <div className="stat-value">
                {currentDraw ? (
                  <span className="gradient-text">Entered</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Not Entered</span>
                )}
              </div>
              <div className="stat-label">Current Draw</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {drawEntries?.length || 0} draws participated total
              </p>
            </div>

            {/* Charity */}
            <div className="card stat-card">
              <div style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>💜</div>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>
                {(userCharity as any)?.charities?.name || 'Not selected'}
              </div>
              <div className="stat-label">Supporting</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {userCharity?.contribution_percentage || 10}% of subscription
              </p>
              <Link href="/dashboard/charity" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                Change Charity
              </Link>
            </div>
          </div>

          {/* Notifications */}
          {unreadCount > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem' }}>🔔 Unread Notifications</h3>
                <Link href="/dashboard/notifications" className="btn btn-secondary btn-sm">View All</Link>
              </div>
              <div>
                {notifications?.slice(0, 3).map((n: any) => (
                  <div key={n.id} className="notification-item unread">
                    <div className="notification-dot" />
                    <div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem', fontWeight: 500 }}>{n.title}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Winnings Overview */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>🏆 Winnings Overview</h3>
            {wins && wins.length > 0 ? (
              <div>
                {wins.map((w: any) => (
                  <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        Draw — {new Date(w.draws?.year, w.draws?.month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className={`badge badge-${w.status}`}>{w.status}</span>
                      <span className={`badge ${w.payment_status === 'paid' ? 'badge-active' : 'badge-pending'}`}>{w.payment_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No winnings yet. Keep entering scores to participate in monthly draws!
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
