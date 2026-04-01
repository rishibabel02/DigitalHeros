import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import WinnerProofUpload from './WinnerProofUpload'

const SIDEBAR = [
  { href: '/dashboard', label: 'Overview', icon: '🏠' },
  { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
  { href: '/dashboard/draws', label: 'Draw History', icon: '🎰' },
  { href: '/dashboard/charity', label: 'My Charity', icon: '💜' },
  { href: '/dashboard/winnings', label: 'Winnings', icon: '🏆' },
  { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
]

export default async function WinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wins } = await supabase
    .from('winner_verifications')
    .select('*, draws(month, year)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          {SIDEBAR.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${item.href === '/dashboard/winnings' ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-header">
            <h1 style={{ fontSize: '1.8rem' }}>🏆 My Winnings</h1>
            <p style={{ color: 'var(--text-muted)' }}>Your draw prizes and verification status.</p>
          </div>

          {wins && wins.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {wins.map((w: any) => (
                <div key={w.id} className="card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>
                        {w.draws ? `${months[w.draws.month - 1]} ${w.draws.year} Draw` : 'Draw Prize'}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Won {new Date(w.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${w.status}`}>{w.status}</span>
                      <span className={`badge ${w.payment_status === 'paid' ? 'badge-active' : 'badge-pending'}`}>{w.payment_status}</span>
                    </div>
                  </div>

                  {/* Verification workflow */}
                  {w.status === 'pending' && !w.proof_url && (
                    <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                      ⚠️ Please upload your proof of scores to claim your prize.
                    </div>
                  )}

                  {w.status === 'rejected' && w.admin_note && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                      ❌ Rejected: {w.admin_note}
                    </div>
                  )}

                  {w.status === 'approved' && w.payment_status === 'pending' && (
                    <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                      ✅ Approved! Your payment is being processed within 7 business days.
                    </div>
                  )}

                  {w.status === 'approved' && w.payment_status === 'paid' && (
                    <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                      💰 Prize paid! Congratulations!
                    </div>
                  )}

                  {/* Proof upload */}
                  {w.status === 'pending' && !w.proof_url && (
                    <WinnerProofUpload verificationId={w.id} currentStatus={w.status} />
                  )}

                  {w.proof_url && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className="badge badge-active">✅ Proof Uploaded</span>
                      <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
                        View Proof ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎰</div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>No winnings yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Make sure you have 5 scores logged and an active subscription to be entered in the next draw!
              </p>
              <Link href="/dashboard/scores" className="btn btn-primary btn-sm">Add Scores</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
