import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import SubscribeButton from './SubscribeButton'
import CancelButton from './CancelButton'

const SIDEBAR = [
  { href: '/dashboard', label: 'Overview', icon: '🏠' },
  { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
  { href: '/dashboard/draws', label: 'Draw History', icon: '🎰' },
  { href: '/dashboard/charity', label: 'My Charity', icon: '💜' },
  { href: '/dashboard/winnings', label: 'Winnings', icon: '🏆' },
  { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
]

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const isActive = subscription?.status === 'active'

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          {SIDEBAR.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${item.href === '/dashboard/subscription' ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-header">
            <h1 style={{ fontSize: '1.8rem' }}>💳 Subscription</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage your plan and billing.</p>
          </div>

          {/* Current Status */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>Current Plan</p>
                <h2 style={{ fontSize: '1.5rem', textTransform: 'capitalize' }}>{subscription?.plan || 'None'}</h2>
                {subscription?.renewal_date && (
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                    {isActive ? 'Renews' : 'Expires'}: {new Date(subscription.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <span className={`badge badge-${subscription?.status || 'inactive'}`}>{subscription?.status || 'inactive'}</span>
            </div>
          </div>

          {/* Plans */}
          {!isActive && (
            <>
              <h3 style={{ marginBottom: '1.5rem' }}>Choose a Plan</h3>
              <div className="plans-grid">
                <div className="card plan-card">
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Monthly</p>
                  <div className="plan-price gradient-text">£29.99</div>
                  <div className="plan-interval">per month</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Full access, cancel anytime</p>
                  <SubscribeButton plan="monthly" label="Subscribe Monthly" />
                </div>
                <div className="card plan-card featured">
                  <div className="plan-featured-badge">BEST VALUE</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Yearly</p>
                  <div className="plan-price gradient-text">£299</div>
                  <div className="plan-interval">per year · Save £61</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>12 months for the price of 10</p>
                  <SubscribeButton plan="yearly" label="Subscribe Yearly" />
                </div>
              </div>
            </>
          )}

          {isActive && (
            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Manage Subscription</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Cancellation takes effect at the end of your current billing period. You'll retain access until then.
              </p>
              <CancelButton />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
