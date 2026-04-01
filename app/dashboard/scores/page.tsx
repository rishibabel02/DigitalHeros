'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Score {
  id: string
  score: number
  played_date: string
  is_locked: boolean
}

const SIDEBAR_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '🏠' },
  { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
  { href: '/dashboard/draws', label: 'Draw History', icon: '🎰' },
  { href: '/dashboard/charity', label: 'My Charity', icon: '💜' },
  { href: '/dashboard/winnings', label: 'Winnings', icon: '🏆' },
  { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
]

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [form, setForm] = useState({ score: '', date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [userName, setUserName] = useState('')
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const [scoresRes, subRes, profileRes] = await Promise.all([
      supabase.from('golf_scores').select('*').eq('user_id', user.id).order('played_date', { ascending: false }).limit(5),
      supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    ])

    setScores(scoresRes.data || [])
    setIsSubscribed(subRes.data?.status === 'active')
    setUserName(profileRes.data?.full_name || '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: Number(form.score), playedDate: form.date }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess('Score saved successfully!')
      setForm({ score: '', date: '' })
      loadData()
    }
    setLoading(false)
  }

  async function handleDelete(scoreId: string) {
    setError('')
    const res = await fetch('/api/scores', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoreId }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error)
    else loadData()
  }

  return (
    <div className="page-wrapper">
      {/* Inline minimal navbar for client page */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">GolfGive</Link>
          <div className="navbar-actions">
            <Link href="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="dashboard-layout">
        <aside className="sidebar">
          {SIDEBAR_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${item.href === '/dashboard/scores' ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-header">
            <h1 style={{ fontSize: '1.8rem' }}>⛳ My Scores</h1>
            <p style={{ color: 'var(--text-muted)' }}>Stableford format · Range 1–45 · Latest 5 retained</p>
          </div>

          {!isSubscribed && (
            <div className="alert alert-warning">
              ⚠️ Score entry requires an active subscription.{' '}
              <Link href="/dashboard/subscription" style={{ color: 'var(--gold)', fontWeight: 600 }}>Subscribe now</Link>
            </div>
          )}

          {/* Add Score Form */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Add New Score</h3>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label className="label">Score (1–45)</label>
                <input id="score-input" className="input" type="number" min={1} max={45} placeholder="e.g. 32"
                  value={form.score} onChange={e => setForm({ ...form, score: e.target.value })}
                  required disabled={!isSubscribed} />
              </div>
              <div>
                <label className="label">Date Played</label>
                <input id="score-date" className="input" type="date" max={new Date().toISOString().split('T')[0]}
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  required disabled={!isSubscribed} />
              </div>
              <button id="add-score-btn" className="btn btn-primary" type="submit" disabled={loading || !isSubscribed}>
                {loading ? <span className="spinner" /> : 'Add Score'}
              </button>
            </form>
          </div>

          {/* Scores List */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem' }}>Your Scores ({scores.length}/5)</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Newest first · Oldest auto-removed at 5</span>
            </div>

            {scores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛳</div>
                <p>No scores yet. Add your first score to enter draws!</p>
              </div>
            ) : (
              <div className="score-list">
                {scores.map((score, i) => (
                  <div key={score.id} className={`score-item ${score.is_locked ? 'locked' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '20px' }}>#{i + 1}</span>
                      <span className="score-number">{score.score}</span>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{score.score} points</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(score.played_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {score.is_locked ? (
                        <span className="badge badge-locked">🔒 Locked</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(score.id)}
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
