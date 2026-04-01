import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('profiles')
    .select('*, subscriptions(status, plan, renewal_date), user_charities(contribution_percentage, charities(name))')
    .order('created_at', { ascending: false })

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {[
              { href: '/admin', label: '📊 Overview' },
              { href: '/admin/users', label: '👥 Users' },
              { href: '/admin/draws', label: '🎰 Draws' },
              { href: '/admin/charities', label: '💜 Charities' },
              { href: '/admin/winners', label: '🏆 Winners' },
            ].map(tab => (
              <Link key={tab.href} href={tab.href} className={`btn btn-sm ${tab.href === '/admin/users' ? 'btn-primary' : 'btn-secondary'}`}>{tab.label}</Link>
            ))}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>👥 User <span className="gradient-text">Management</span></h1>

          <div className="card">
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{users?.length || 0} total users</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Charity</th>
                    <th>Renewal</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u: any) => {
                    const sub = u.subscriptions?.[0]
                    const charity = u.user_charities?.[0]
                    return (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.full_name || '—'}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-active' : 'badge-draft'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{sub?.plan || '—'}</td>
                        <td>
                          {sub ? <span className={`badge badge-${sub.status}`}>{sub.status}</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No sub</span>}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {charity ? `${charity.charities?.name} (${charity.contribution_percentage}%)` : '—'}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {sub?.renewal_date ? new Date(sub.renewal_date).toLocaleDateString('en-GB') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                  {(!users || users.length === 0) && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
