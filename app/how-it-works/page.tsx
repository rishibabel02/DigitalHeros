import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works — GolfGive',
  description: 'Learn how GolfGive works — subscribe, log your scores, enter monthly draws, and support your chosen charity automatically.',
}

const steps = [
  {
    n: 1,
    icon: '🔑',
    title: 'Subscribe',
    desc: 'Choose monthly (£29.99) or yearly (£299). Select a charity. You are in from your very first month.',
    detail: 'Cancel anytime. No hidden fees. Your billing is handled securely by Stripe.',
  },
  {
    n: 2,
    icon: '⛳',
    title: 'Log Your Scores',
    desc: 'Enter your Stableford golf scores (1–45) in your dashboard. We keep your latest 5.',
    detail: 'Score a round at any affiliated club. Input it before the monthly draw date to be counted.',
  },
  {
    n: 3,
    icon: '📸',
    title: 'Scores Are Snapshotted',
    desc: 'At the start of each month, your 5 current scores are locked in as your draw entry.',
    detail: 'This ensures fairness — no edits affect past draws. Locked scores are clearly marked.',
  },
  {
    n: 4,
    icon: '🎰',
    title: 'Monthly Draw',
    desc: '5 winning numbers are generated. Match 3, 4, or all 5 of your scores to win a prize.',
    detail: 'Draw logic is transparent — either standard random or our frequency-weighted algorithm, selected by admin.',
  },
  {
    n: 5,
    icon: '🏆',
    title: 'Claim Your Prize',
    desc: 'Winners are notified by email and in-app. Upload your proof to claim your prize.',
    detail: 'Prize verification is done by our admin team. Payouts are processed within 7 business days.',
  },
  {
    n: 6,
    icon: '💜',
    title: 'Charity Receives Your Contribution',
    desc: 'Every month, a minimum of 10% of your subscription goes directly to your chosen charity.',
    detail: 'You can increase your contribution percentage at any time from your dashboard.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '4rem', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <div className="orb orb-purple" style={{ width: 600, height: 600, top: -200, left: -200 }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div className="section-tag">Simple & Transparent</div>
          <h1 style={{ marginBottom: '1rem' }}>How <span className="gradient-text">GolfGive</span> Works</h1>
          <p style={{ maxWidth: 560, margin: '0 auto 2.5rem', fontSize: '1.1rem', lineHeight: '1.7' }}>
            Six steps between signing up and making a real difference — while competing for life-changing monthly prizes.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg">Start Playing for Good →</Link>
        </div>
      </section>

      {/* Steps */}
      <section style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {steps.map((step, i) => (
              <div key={step.n} className="card" style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '2rem',
                alignItems: 'flex-start',
                padding: '2.5rem',
              }}>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div className="step-number">{step.n}</div>
                  <div style={{ fontSize: '2rem' }}>{step.icon}</div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.7' }}>{step.desc}</p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid rgba(168,85,247,0.4)' }}>
                    💡 {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Structure */}
      <section>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Prize Structure</div>
            <h2>How Prizes Are Calculated</h2>
            <p style={{ maxWidth: 520, margin: '1rem auto' }}>
              40% of every subscription contributes to the monthly prize pool. Prizes roll over if unclaimed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { match: '5 Numbers', pct: '40%', label: 'Jackpot', color: 'var(--gold)', icon: '🏆', desc: 'Rolls over to next month if no winner' },
              { match: '4 Numbers', pct: '35%', label: 'Second Prize', color: 'var(--purple-light)', icon: '🥈', desc: 'Split equally among all 4-match winners' },
              { match: '3 Numbers', pct: '25%', label: 'Third Prize', color: 'var(--blue)', icon: '🥉', desc: 'Split equally among all 3-match winners' },
            ].map(tier => (
              <div key={tier.match} className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{tier.icon}</div>
                <h3 style={{ color: tier.color, marginBottom: '0.25rem' }}>{tier.match}</h3>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3rem', fontWeight: 800, color: tier.color, lineHeight: 1, margin: '0.75rem 0' }}>{tier.pct}</div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{tier.label}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Questions & Answers</div>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { q: 'What is Stableford scoring?', a: 'Stableford is a widely-used golf scoring system where points are awarded based on your performance on each hole relative to par. Scores typically range from 1 to 45 for an 18-hole round.' },
              { q: 'When is the monthly draw?', a: 'Scores are snapshotted on the 1st of each month. Results are published by the admin team within the first week. You\'ll be notified by email and in-app.' },
              { q: 'What if nobody matches 5 numbers?', a: 'The jackpot rolls over to the next month, growing the prize pool. 4-match and 3-match prizes are still paid out for that month.' },
              { q: 'Can I change my charity?', a: 'Yes. You can update your charity selection and contribution percentage at any time from your dashboard. Changes take effect from the next billing cycle.' },
              { q: 'How do I claim a prize?', a: 'You\'ll receive an email and in-app notification if you win. Simply upload a screenshot of your scores from your golf platform as proof. Our admin team reviews and approves within 7 business days.' },
              { q: 'Is my payment secure?', a: 'Yes. All payments are processed by Stripe, a PCI-compliant payment processor. GolfGive never stores your card details.' },
            ].map(faq => (
              <div key={faq.q} className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.6rem', color: 'var(--text-primary)' }}>{faq.q}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to <span className="gradient-text">get started?</span></h2>
          <p style={{ marginBottom: '2.5rem', color: 'var(--text-muted)', fontSize: '1rem' }}>Subscribe today and your first draw entry is included this month.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary btn-lg">Subscribe Now</Link>
            <Link href="/charities" className="btn btn-secondary btn-lg">Browse Charities</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
