import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import CharitySelectForm from './CharitySelectForm'

export default async function CharityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: charities }, { data: userCharity }] = await Promise.all([
    supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }),
    supabase.from('user_charities').select('*, charities(name)').eq('user_id', user.id).single(),
  ])

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          {[
            { href: '/dashboard', label: 'Overview', icon: '🏠' },
            { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
            { href: '/dashboard/draws', label: 'Draw History', icon: '🎰' },
            { href: '/dashboard/charity', label: 'My Charity', icon: '💜' },
            { href: '/dashboard/winnings', label: 'Winnings', icon: '🏆' },
            { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
            { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
          ].map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${item.href === '/dashboard/charity' ? 'active' : ''}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-header">
            <h1 style={{ fontSize: '1.8rem' }}>💜 My Charity</h1>
            <p style={{ color: 'var(--text-muted)' }}>A portion of every subscription goes directly to your chosen charity.</p>
          </div>

          {/* Current Selection */}
          {userCharity && (
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.06) 100%)', borderColor: 'rgba(168,85,247,0.3)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>Currently Supporting</p>
              <h2 style={{ marginBottom: '0.5rem' }}>{(userCharity as any).charities?.name}</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                You're contributing <strong style={{ color: 'var(--purple-light)' }}>{userCharity.contribution_percentage}%</strong> of your subscription to this charity every month.
              </p>
            </div>
          )}

          {/* Change Charity Form — client component */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
              {userCharity ? 'Change Charity or Contribution' : 'Select Your Charity'}
            </h3>
            <CharitySelectForm charities={charities || []} currentCharityId={userCharity?.charity_id} currentPct={userCharity?.contribution_percentage} />
          </div>

          {/* Charity Directory */}
          <h3 style={{ marginBottom: '1rem' }}>All Charities</h3>
          <div className="charity-grid">
            {charities?.map((charity: any) => (
              <div key={charity.id} className="card charity-card">
                <div className="charity-img">
                  <span style={{ fontSize: '3rem' }}>🎗️</span>
                </div>
                {charity.is_featured && (
                  <span className="badge badge-active" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>⭐ Featured</span>
                )}
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{charity.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {charity.description}
                </p>
                {charity.upcoming_events && (
                  <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--gold)' }}>
                    📅 {charity.upcoming_events}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
