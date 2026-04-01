import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import VerifyButton from './VerifyButton'
import MarkPaidButton from './MarkPaidButton'

export default async function AdminWinnersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select('*, profiles(full_name, email), draws(month, year)')
    .order('created_at', { ascending: false })

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
              <Link key={tab.href} href={tab.href} className={`btn btn-sm ${tab.href === '/admin/winners' ? 'btn-primary' : 'btn-secondary'}`}>{tab.label}</Link>
            ))}
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🏆 Winners <span className="gradient-text">Verification</span></h1>

          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr><th>Winner</th><th>Email</th><th>Draw</th><th>Verification</th><th>Payment</th><th>Proof</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {verifications?.map((v: any) => (
                    <tr key={v.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v.profiles?.full_name || 'Unknown'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{v.profiles?.email}</td>
                      <td>{v.draws ? new Date(v.draws.year, v.draws.month - 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' }) : '—'}</td>
                      <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                      <td><span className={`badge ${v.payment_status === 'paid' ? 'badge-active' : 'badge-pending'}`}>{v.payment_status}</span></td>
                      <td>
                        {v.proof_url
                          ? <a href={v.proof_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>View Proof</a>
                          : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not uploaded</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {v.status === 'pending' && (
                            <>
                              <VerifyButton id={v.id} action="approve" />
                              <VerifyButton id={v.id} action="reject" />
                            </>
                          )}
                          {v.status === 'approved' && v.payment_status === 'pending' && (
                            <MarkPaidButton id={v.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!verifications || verifications.length === 0) && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No winner verifications yet.</td></tr>
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
