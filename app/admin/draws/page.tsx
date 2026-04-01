'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), logic: 'random' })
  const [simResult, setSimResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => { loadDraws() }, [])

  async function loadDraws() {
    const res = await fetch('/api/draws')
    const data = await res.json()
    setDraws(data.draws || [])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: form.month, year: form.year, drawLogic: form.logic }),
    })
    const data = await res.json()
    if (res.ok) { alert(`✅ Draw created! ${data.enrolledCount} subscribers enrolled.`); loadDraws() }
    else alert('Error: ' + data.error)
    setCreating(false)
  }

  async function handleSimulate(drawId: string, logic: string) {
    setLoading(true)
    const res = await fetch(`/api/draws/${drawId}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logic }),
    })
    const data = await res.json()
    setSimResult({ ...data, drawId })
    setLoading(false)
  }

  async function handlePublish(drawId: string, logic: string) {
    if (!confirm('⚠️ This will publish LIVE results. This cannot be undone. Proceed?')) return
    setLoading(true)
    const res = await fetch(`/api/draws/${drawId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logic }),
    })
    const data = await res.json()
    if (res.ok) { alert('✅ Draw published! Winners notified.'); loadDraws() }
    else alert('Error: ' + data.error)
    setLoading(false)
  }

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const NAV = [
    { href: '/admin', label: '📊 Overview' },
    { href: '/admin/users', label: '👥 Users' },
    { href: '/admin/draws', label: '🎰 Draws' },
    { href: '/admin/charities', label: '💜 Charities' },
    { href: '/admin/winners', label: '🏆 Winners' },
  ]

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">GolfGive</Link>
          <div className="navbar-actions">
            <Link href="/admin" className="btn btn-secondary btn-sm">← Admin</Link>
          </div>
        </div>
      </nav>
      <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {NAV.map(tab => (
              <Link key={tab.href} href={tab.href} className={`btn btn-sm ${tab.href === '/admin/draws' ? 'btn-primary' : 'btn-secondary'}`}>{tab.label}</Link>
            ))}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🎰 Draw <span className="gradient-text">Management</span></h1>

          {/* Create Draw */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Create New Draw</h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label className="label">Month</label>
                <select className="input" value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })}>
                  {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <input className="input" type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Draw Logic</label>
                <select className="input" value={form.logic} onChange={e => setForm({ ...form, logic: e.target.value })}>
                  <option value="random">🎲 Random</option>
                  <option value="algorithmic">🧠 Algorithmic (Frequency-Weighted)</option>
                </select>
              </div>
              <button id="create-draw-btn" className="btn btn-primary" type="submit" disabled={creating}>
                {creating ? <span className="spinner" /> : 'Create + Snapshot'}
              </button>
            </form>
          </div>

          {/* Simulation Results */}
          {simResult && (
            <div className="card" style={{ marginBottom: '2rem', borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--gold)' }}>⚠️ SIMULATION ONLY — Not Live Results</h3>
                <button onClick={() => setSimResult(null)} className="btn btn-secondary btn-sm">Dismiss</button>
              </div>
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                Winning Numbers: <strong style={{ color: 'var(--purple-light)', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>
                  {simResult.winningNumbers?.join(' · ')}
                </strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {['five','four','three'].map(tier => (
                  <div key={tier} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {tier === 'five' ? '5-Match (Jackpot)' : tier === 'four' ? '4-Match' : '3-Match'}
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {simResult.matches?.[tier]?.length || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>winners</span>
                    </p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Total Entries: {simResult.summary?.totalEntries} · This is a preview. Click "Publish" to make official.
              </p>
            </div>
          )}

          {/* Draws Table */}
          <div className="card">
            <table className="admin-table">
              <thead>
                <tr><th>Month</th><th>Logic</th><th>Status</th><th>Winning Numbers</th><th>Jackpot Rollover</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {draws.map((d: any) => (
                  <tr key={d.id}>
                    <td>{months[d.month - 1]} {d.year}</td>
                    <td style={{ textTransform: 'capitalize' }}>{d.draw_logic}</td>
                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                    <td style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--purple-light)' }}>
                      {d.winning_numbers?.join(' · ') || '—'}
                    </td>
                    <td>{d.jackpot_rolled_over ? <span className="badge badge-pending">Yes</span> : '—'}</td>
                    <td>
                      {d.status !== 'published' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" disabled={loading} onClick={() => handleSimulate(d.id, d.draw_logic)}>
                            Simulate
                          </button>
                          <button id={`publish-draw-${d.id}`} className="btn btn-gold btn-sm" disabled={loading} onClick={() => handlePublish(d.id, d.draw_logic)}>
                            Publish
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {draws.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No draws created yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
