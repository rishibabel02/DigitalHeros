'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard/charity')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', isolation: 'isolate' }}>
      <div className="orb orb-purple" style={{ width: 500, height: 500, top: -100, left: -100, opacity: 0.3 }} />
      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" className="navbar-logo" style={{ display: 'inline-block', marginBottom: '1.5rem', fontSize: '1.8rem' }}>GolfGive</Link>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Join the community playing for good</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input id="signup-name" className="input" type="text" placeholder="Your full name" required
                value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input id="signup-email" className="input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input id="signup-password" className="input" type="password" placeholder="Min. 8 characters" required minLength={8}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button id="signup-btn" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? <span className="spinner" /> : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
