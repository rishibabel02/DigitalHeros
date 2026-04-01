import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Charities — GolfGive',
  description: 'Browse all charities supported by GolfGive. Choose a cause you believe in and a portion of your subscription goes directly there, every month.',
}

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })

  const featured = charities?.find((c: any) => c.is_featured)
  const rest = charities?.filter((c: any) => !c.is_featured) || []

  const CHARITY_ICONS: Record<string, string> = {
    'Cancer Research UK': '🎗️',
    'British Heart Foundation': '❤️',
    'Macmillan Cancer Support': '🌿',
    'Age UK': '💙',
    'Children in Need': '⭐',
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '4rem', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-purple" style={{ width: 500, height: 500, top: -150, right: -100 }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div className="section-tag">Making a Difference</div>
          <h1 style={{ marginBottom: '1rem' }}>Charities We <span className="gradient-text">Support</span></h1>
          <p style={{ maxWidth: 560, margin: '0 auto 2rem', fontSize: '1.1rem', lineHeight: '1.7' }}>
            Every GolfGive subscription automatically donates to a charity of your choice — minimum 10%, every single month.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg">Start Supporting a Charity</Link>
        </div>
      </section>

      {/* Featured Charity */}
      {featured && (
        <section style={{ background: 'var(--bg-secondary)', padding: '4rem 0' }}>
          <div className="container">
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-active">⭐ This Month's Featured Charity</span>
            </div>
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(236,72,153,0.06) 100%)',
              borderColor: 'rgba(168,85,247,0.35)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3rem',
              alignItems: 'center',
              padding: '3rem',
            }}>
              <div>
                <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
                  {CHARITY_ICONS[featured.name] || '🎗️'}
                </div>
                <h2 style={{ marginBottom: '1rem' }}>{featured.name}</h2>
                <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  {featured.description}
                </p>
                {featured.upcoming_events && (
                  <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📅 Upcoming Event</p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{featured.upcoming_events}</p>
                  </div>
                )}
                {featured.website_url && (
                  <a href={featured.website_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    Visit Website ↗
                  </a>
                )}
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Your monthly contribution</p>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '5rem', fontWeight: 900, lineHeight: 1 }} className="gradient-text">10%+</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '2rem' }}>of every subscription, automatically</p>
                <Link href="/signup" className="btn btn-primary">Start Contributing</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fallback if no charities exist yet */}
      {!charities || charities.length === 0 && (
        <section>
          <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎗️</div>
            <h2 style={{ marginBottom: '1rem' }}>Charities Coming Soon</h2>
            <p style={{ color: 'var(--text-muted)' }}>We're onboarding our first charity partners. Check back soon!</p>
          </div>
        </section>
      )}

      {/* All Charities */}
      {rest.length > 0 && (
        <section>
          <div className="container">
            <h2 style={{ marginBottom: '2.5rem' }}>All Supported Charities</h2>
            <div className="charity-grid">
              {rest.map((charity: any) => (
                <div key={charity.id} className="card charity-card">
                  <div className="charity-img">
                    <span style={{ fontSize: '3rem' }}>{CHARITY_ICONS[charity.name] || '🎗️'}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>{charity.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
                    {charity.description}
                  </p>
                  {charity.upcoming_events && (
                    <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '1rem' }}>
                      📅 {charity.upcoming_events}
                    </div>
                  )}
                  {charity.website_url && (
                    <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
                      Visit Website ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Play golf. <span className="gradient-text">Make a difference.</span></h2>
          <p style={{ marginBottom: '2rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Join GolfGive and start contributing to your chosen charity automatically, every month.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg">Get Started — From $499/mo</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
