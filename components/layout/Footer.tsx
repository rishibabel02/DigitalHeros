import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div className="navbar-logo" style={{ marginBottom: '1rem', display: 'inline-block' }}>GolfGive</div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
              Where every swing supports a cause. Monthly prize draws powered by your golf scores.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link href="/how-it-works" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>How It Works</Link></li>
              <li><Link href="/draws" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Draw Results</Link></li>
              <li><Link href="/subscribe" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Subscribe</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Giving</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link href="/charities" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Our Charities</Link></li>
              <li><Link href="/charities#donate" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Donate Directly</Link></li>
            </ul>
          </div>
        </div>
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} GolfGive. All rights reserved.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Built with care for charity 💜
          </p>
        </div>
      </div>
    </footer>
  )
}
