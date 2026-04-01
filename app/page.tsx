import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default async function HomePage() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="orb orb-purple" style={{ width: 700, height: 700, top: -250, left: -200 }} />
        <div className="orb orb-pink" style={{ width: 500, height: 500, bottom: -100, right: -150 }} />

        <div className="container hero-content" style={{ textAlign: 'center', maxWidth: 860 }}>
          <div className="hero-badge" style={{ margin: '0 auto 1.5rem' }}>
            💜 Every subscription supports charity
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(3.5rem, 7vw, 6.5rem)', textAlign: 'center' }}>
            Swing for<br />
            <span className="gradient-text">something bigger.</span>
          </h1>

          <p className="hero-subtitle" style={{ margin: '0 auto 2.5rem', textAlign: 'center', maxWidth: 600 }}>
            Enter your golf scores. Compete in monthly prize draws worth thousands.
            Every subscription automatically supports a charity you believe in.
          </p>

          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link href="/signup" className="btn btn-primary btn-lg animate-pulse-glow">
              Start Playing for Good →
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary btn-lg">
              How It Works
            </Link>
          </div>

          <div className="hero-stats" style={{ justifyContent: 'center', borderTop: '1px solid var(--border)', marginTop: '4rem', paddingTop: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="hero-stat-value">£29.99</div>
              <div className="hero-stat-label">Per month</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="hero-stat-value">Monthly</div>
              <div className="hero-stat-label">Prize draws</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="hero-stat-value">10%+</div>
              <div className="hero-stat-label">To charity</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="hero-stat-value">5</div>
              <div className="hero-stat-label">Charities</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────── */}
      <section style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Simple Process</div>
            <h2>How GolfGive Works</h2>
            <p style={{ maxWidth: 520, margin: '1rem auto' }}>
              Four steps between you and making a real difference — while competing for life-changing prizes.
            </p>
          </div>

          <div className="steps-grid">
            {[
              { n: 1, icon: '🔑', title: 'Subscribe', desc: 'Choose monthly (£29.99) or yearly (£299) and select your charity. Cancel anytime.' },
              { n: 2, icon: '⛳', title: 'Enter Scores', desc: 'Log your latest 5 Stableford scores. We keep the most recent automatically.' },
              { n: 3, icon: '🎰', title: 'Monthly Draw', desc: 'Your scores enter you into our monthly draw. Match 3, 4, or 5 numbers to win.' },
              { n: 4, icon: '💜', title: 'Give Back', desc: 'A portion of every subscription goes directly to your chosen charity, every month.' },
            ].map((step) => (
              <div key={step.n} className="card step-card">
                <div className="step-number">{step.n}</div>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRIZE POOL ─────────────────────────────────────── */}
      <section>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Prize Structure</div>
            <h2>What You Could Win</h2>
            <p style={{ maxWidth: 520, margin: '1rem auto' }}>
              Monthly draws with three prize tiers. The jackpot rolls over if unclaimed — getting bigger every month.
            </p>
          </div>

          <div className="prize-tiers">
            <div className="prize-tier-card tier-jackpot">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
              <h3 style={{ color: 'var(--gold)' }}>5-Number Match</h3>
              <div className="prize-amount gradient-text-gold">JACKPOT</div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>40% of monthly pool · Rolls over if unclaimed</p>
            </div>
            <div className="prize-tier-card tier-four">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🥈</div>
              <h3>4-Number Match</h3>
              <div className="prize-amount gradient-text">35%</div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>35% of monthly prize pool</p>
            </div>
            <div className="prize-tier-card tier-three">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🥉</div>
              <h3>3-Number Match</h3>
              <div className="prize-amount" style={{ color: 'var(--blue)' }}>25%</div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>25% of monthly prize pool</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED CHARITY ───────────────────────────────── */}
      <section style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Featured Charity</div>
          </div>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.06) 100%)',
            border: '1px solid rgba(168,85,247,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎗️</div>
            <h2 style={{ marginBottom: '1rem' }}>Cancer Research UK</h2>
            <p style={{ maxWidth: 600, marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.8' }}>
              Fighting cancer through world-class research. This month's spotlight charity receives contributions
              from every active subscriber. Every swing you play funds groundbreaking science.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/charities" className="btn btn-primary">View All Charities</Link>
              <Link href="/signup" className="btn btn-secondary">Start Contributing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div className="orb orb-purple" style={{ width: 400, height: 400, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ marginBottom: '1rem' }}>
                Ready to swing for <span className="gradient-text">something bigger?</span>
              </h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem' }}>
                Join a community of golfers making a real difference — one score at a time.
              </p>
              <Link href="/signup" className="btn btn-primary btn-lg animate-pulse-glow">
                Subscribe Now — From £29.99/mo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
