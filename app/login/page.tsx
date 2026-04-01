'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.push(redirectTo)
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div className="orb orb-purple" style={{ width: 500, height: 500, top: -100, right: -100, opacity: 0.3 }} />
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" className="navbar-logo" style={{ display: 'inline-block', marginBottom: '1.5rem', fontSize: '1.8rem' }}>GolfGive</Link>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sign in to your account</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="label">Email</label>
              <input id="login-email" className="input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input id="login-password" className="input" type="password" placeholder="Your password" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button id="login-btn" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? <span className="spinner" /> : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
