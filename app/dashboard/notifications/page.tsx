import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0

  const typeIcon: Record<string, string> = {
    draw_result: '🎰',
    winner: '🏆',
    subscription: '💳',
    charity: '💜',
    general: '🔔',
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
            { href: '/dashboard/notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: '🔔' },
          ].map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link${item.href === '/dashboard/notifications' ? ' active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🔔 Notifications</h1>
              <p style={{ color: 'var(--text-muted)' }}>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <form action="/api/notifications/mark-all-read" method="POST">
                <button type="submit" className="btn btn-secondary btn-sm">Mark all read</button>
              </form>
            )}
          </div>

          {!notifications || notifications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔔</div>
              <h3 style={{ marginBottom: '0.75rem' }}>No notifications yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                You&apos;ll be notified about draw results, prize claims, and subscription updates here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n: any) => (
                <div key={n.id} className="card" style={{
                  padding: '1.25rem 1.5rem',
                  borderColor: !n.is_read ? 'rgba(168,85,247,0.3)' : 'var(--border)',
                  background: !n.is_read ? 'rgba(168,85,247,0.04)' : 'var(--bg-card)',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>
                      {typeIcon[n.type] || '🔔'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.25rem' }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{n.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block' }} />}
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
