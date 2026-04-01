import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Direct DB queries instead of internal fetch (avoids cookie forwarding complexity)
  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: charityDonations },
    { data: draws },
    { data: poolData },
    { data: verifications },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('donations').select('charity_id, amount, charities(name)'),
    supabase.from('draws').select('*').order('year', { ascending: false }).order('month', { ascending: false }).limit(6),
    supabase.from('prize_pool').select('total_pool'),
    supabase.from('winner_verifications')
      .select('*, profiles(full_name, email), draws(month, year)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalPrizePool = poolData?.reduce((sum, p) => sum + p.total_pool, 0) || 0

  // Aggregate charity totals
  const charityMap: Record<string, { name: string; total: number }> = {}
  charityDonations?.forEach((d: any) => {
    const key = d.charity_id
    if (!charityMap[key]) charityMap[key] = { name: d.charities?.name || 'Unknown', total: 0 }
    charityMap[key].total += d.amount
  })
  const charityTotals = Object.entries(charityMap).map(([id, data]) => ({ id, ...data }))

  const NAV = [
    { href: '/admin', label: '📊 Overview' },
    { href: '/admin/users', label: '👥 Users' },
    { href: '/admin/draws', label: '🎰 Draws' },
    { href: '/admin/charities', label: '💜 Charities' },
    { href: '/admin/winners', label: '🏆 Winners' },
  ]

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {NAV.map(tab => (
              <Link key={tab.href} href={tab.href} className={`btn btn-sm ${tab.href === '/admin' ? 'btn-primary' : 'btn-secondary'}`}>{tab.label}</Link>
            ))}
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Admin <span className="gradient-text">Dashboard</span></h1>

          {/* Stats */}
          <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
            {[
              { label: 'Total Users', value: totalUsers || 0, icon: '👥', color: 'var(--purple)' },
              { label: 'Active Subscribers', value: activeSubscribers || 0, icon: '✅', color: 'var(--green)' },
              { label: 'Total Prize Pool', value: `£${(totalPrizePool / 100).toFixed(0)}`, icon: '💰', color: 'var(--gold)' },
            ].map(stat => (
              <div key={stat.label} className="card stat-card">
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{stat.icon}</div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Charity Totals */}
          {charityTotals.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>💜 Charity Contributions</h3>
              <table className="admin-table">
                <thead><tr><th>Charity</th><th>Total Donated</th></tr></thead>
                <tbody>
                  {charityTotals.map((c: any) => (
                    <tr key={c.id}><td>{c.name}</td><td style={{ color: 'var(--green)' }}>£{(c.total / 100).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pending Verifications */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem' }}>🏆 Pending Winner Verifications</h3>
              <Link href="/admin/winners" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            <table className="admin-table">
              <thead><tr><th>User</th><th>Draw</th><th>Status</th><th>Payment</th><th>Action</th></tr></thead>
              <tbody>
                {verifications && verifications.length > 0 ? verifications.map((v: any) => (
                  <tr key={v.id}>
                    <td>{v.profiles?.full_name || 'Unknown'}</td>
                    <td>{v.draws ? `${new Date(v.draws.year, v.draws.month - 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' })}` : '—'}</td>
                    <td><span className="badge badge-pending">{v.status}</span></td>
                    <td><span className={`badge ${v.payment_status === 'paid' ? 'badge-active' : 'badge-pending'}`}>{v.payment_status}</span></td>
                    <td><Link href={`/admin/winners`} className="btn btn-secondary btn-sm">Review</Link></td>
                  </tr>
                )) : <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending verifications</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Recent Draws */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem' }}>🎰 Recent Draws</h3>
              <Link href="/admin/draws" className="btn btn-secondary btn-sm">Manage Draws</Link>
            </div>
            <table className="admin-table">
              <thead><tr><th>Month</th><th>Logic</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {draws && draws.length > 0 ? draws.map((d: any) => (
                  <tr key={d.id}>
                    <td>{new Date(d.year, d.month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</td>
                    <td style={{ textTransform: 'capitalize' }}>{d.draw_logic}</td>
                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                    <td><Link href={`/admin/draws`} className="btn btn-secondary btn-sm">Manage</Link></td>
                  </tr>
                )) : <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No draws yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
