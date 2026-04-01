import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import SubscribeButton from '@/app/dashboard/subscription/SubscribeButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscribe — GolfGive',
  description: 'Choose your GolfGive plan. Monthly at £29.99 or yearly at £299 (save £61). Start competing in prize draws while supporting charity.',
}

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If subscriber already active, redirect to dashboard
  if (user) {
    const { data: sub } = await supabase.from('subscriptions').select('status').eq('user_id', user.id).single()
    if (sub?.status === 'active') redirect('/dashboard')
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <section style={{ paddingTop: '120px', paddingBottom: '6rem', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <div className="orb orb-purple" style={{ width: 600, height: 600, top: -200, left: -200 }} />
        <div className="orb orb-pink" style={{ width: 400, height: 400, bottom: -100, right: -100 }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-tag">Join GolfGive</div>
            <h1 style={{ marginBottom: '1rem' }}>Choose Your <span className="gradient-text">Plan</span></h1>
            <p style={{ maxWidth: 500, margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              One subscription. Monthly prize draws. Automatic charity contributions. Cancel anytime.
            </p>
          </div>

          <div className="plans-grid">
            {/* Monthly */}
            <div className="card plan-card">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Monthly</p>
              <div className="plan-price gradient-text">£29.99</div>
              <div className="plan-interval">per month · billed monthly</div>

              <ul style={{ listStyle: 'none', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left' }}>
                {['Monthly draw entry', 'Log up to 5 scores', 'Charity contribution (min 10%)', 'Full dashboard access', 'Cancel anytime'].map(f => (
                  <li key={f} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              {user ? (
                <SubscribeButton plan="monthly" label="Subscribe Monthly" />
              ) : (
                <Link href="/signup" className="btn btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                  Sign Up to Subscribe
                </Link>
              )}
            </div>

            {/* Yearly */}
            <div className="card plan-card featured">
              <div className="plan-featured-badge">BEST VALUE — SAVE £61</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Yearly</p>
              <div className="plan-price gradient-text">£299</div>
              <div className="plan-interval">per year · 12 months for the price of 10</div>

              <ul style={{ listStyle: 'none', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left' }}>
                {['12 monthly draw entries', 'Log up to 5 scores', 'Charity contribution (min 10%)', 'Full dashboard access', 'Priority winner support', 'Best value — save £61'].map(f => (
                  <li key={f} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              {user ? (
                <SubscribeButton plan="yearly" label="Subscribe Yearly" />
              ) : (
                <Link href="/signup" className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                  Sign Up to Subscribe
                </Link>
              )}
            </div>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            {['🔒 Secured by Stripe', '💜 Min 10% to charity', '🎰 First draw this month', '❌ Cancel anytime'].map(t => (
              <p key={t} style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t}</p>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
