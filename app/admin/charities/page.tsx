import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

export default async function AdminCharitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: charities } = await supabase.from('charities').select('*').order('is_featured', { ascending: false })

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {[
              { href: '/admin', label: '📊 Overview' },
              { href: '/admin/users', label: '👥 Users' },
              { href: '/admin/draws', label: '🎰 Draws' },
              { href: '/admin/charities', label: '💜 Charities' },
              { href: '/admin/winners', label: '🏆 Winners' },
            ].map(tab => (
              <Link key={tab.href} href={tab.href} className={`btn btn-sm ${tab.href === '/admin/charities' ? 'btn-primary' : 'btn-secondary'}`}>{tab.label}</Link>
            ))}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>💜 Charity <span className="gradient-text">Management</span></h1>

          {/* Add Charity Form */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Add New Charity</h3>
            <form action="/api/admin/charities" method="POST" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="label">Charity Name</label>
                <input id="charity-name" className="input" type="text" name="name" placeholder="e.g. Cancer Research UK" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="label">Description</label>
                <textarea id="charity-description" className="input" name="description" placeholder="Brief description..." required style={{ minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="label">Website URL</label>
                <input id="charity-website" className="input" type="url" name="website_url" placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="label">Upcoming Events</label>
                <input id="charity-events" className="input" type="text" name="upcoming_events" placeholder="e.g. Golf Day — June 15, 2026" />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <input type="checkbox" name="is_featured" value="true" />
                  Set as Featured Charity
                </label>
                <button id="add-charity-btn" className="btn btn-primary btn-sm" type="submit">Add Charity</button>
              </div>
            </form>
          </div>

          {/* Charities Table */}
          <div className="card">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Featured</th><th>Active</th><th>Events</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {charities?.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                    <td>{c.is_featured ? <span className="badge badge-active">⭐ Yes</span> : '—'}</td>
                    <td>{c.is_active ? <span className="badge badge-active">Yes</span> : <span className="badge badge-inactive">No</span>}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.upcoming_events || '—'}</td>
                    <td>
                      <form action={`/api/admin/charities/${c.id}/toggle`} method="POST" style={{ display: 'inline' }}>
                        <button className="btn btn-secondary btn-sm" type="submit" style={{ fontSize: '0.75rem' }}>
                          {c.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
