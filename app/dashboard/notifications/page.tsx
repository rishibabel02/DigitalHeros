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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNotifications() }, [])

  async function loadNotifications() {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.notifications || [])
    setLoading(false)
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const typeIcon: Record<string, string> = {
    draw_result: '🎰',
    winner_status: '🏆',
    subscription_alert: '💳',
    general: '🔔',
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

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
            <Link key={item.href} href={item.href} className={`sidebar-link ${item.href === '/dashboard/notifications' ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem' }}>🔔 Notifications</h1>
              {unreadCount > 0 && (
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn btn-secondary btn-sm">Mark all as read</button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <span className="spinner" style={{ width: 32, height: 32, margin: '0 auto', display: 'block' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔔</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>All caught up!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications yet. We'll alert you when the draw results are published.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {notifications.map((n: any, i: number) => (
                <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`} style={{
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  borderRadius: 0,
                }}>
                  <div style={{ flexShrink: 0, fontSize: '1.5rem', lineHeight: 1.2 }}>
                    {typeIcon[n.type] || '🔔'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: n.is_read ? 400 : 600, marginBottom: '0.2rem' }}>
                        {n.title}
                      </p>
                      {!n.is_read && <div className="notification-dot" style={{ flexShrink: 0, marginTop: 4 }} />}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', lineHeight: '1.5' }}>{n.message}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
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
