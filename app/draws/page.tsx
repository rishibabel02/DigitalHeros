import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Draw Results — GolfGive',
  description: 'View all published monthly draw results, winning numbers, and prize pool breakdowns.',
}

export default async function DrawsPage() {
  const supabase = await createClient()

  const { data: draws } = await supabase
    .from('draws')
    .select('*, draw_results(*), prize_pool(*)')
    .eq('status', 'published')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '4rem', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <div className="orb orb-purple" style={{ width: 500, height: 500, top: -150, right: -100 }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div className="section-tag">Transparency First</div>
          <h1 style={{ marginBottom: '1rem' }}>Draw <span className="gradient-text">Results</span></h1>
          <p style={{ maxWidth: 520, margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            Every monthly draw result is published here. Winning numbers, prize pools, and match counts — all fully transparent.
          </p>
        </div>
      </section>

      {/* Results */}
      <section>
        <div className="container">
          {draws && draws.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {draws.map((draw: any) => {
                const pool = draw.prize_pool?.[0]
                const results = draw.draw_results || []
                const jackpotResult = results.find((r: any) => r.match_type === 'five')
                const fourResult = results.find((r: any) => r.match_type === 'four')
                const threeResult = results.find((r: any) => r.match_type === 'three')

                return (
                  <div key={draw.id} className="card" style={{ padding: '2.5rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                          {months[draw.month - 1]} {draw.year} Draw
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-published">Published</span>
                          {draw.jackpot_rolled_over && <span className="badge badge-pending">🔄 Jackpot Rolled Over</span>}
                          <span className="badge badge-draft" style={{ textTransform: 'capitalize' }}>{draw.draw_logic} draw</span>
                        </div>
                      </div>
                      {pool && (
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Prize Pool</p>
                          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--gold)' }}>
                            £{(pool.total_pool / 100).toFixed(0)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Winning Numbers */}
                    {draw.winning_numbers && draw.winning_numbers.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.75rem' }}>
                          Winning Numbers
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {draw.winning_numbers.map((num: number) => (
                            <div key={num} style={{
                              width: '52px', height: '52px',
                              borderRadius: '50%',
                              background: 'var(--gradient-brand)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: 'white',
                              boxShadow: '0 0 20px rgba(168,85,247,0.4)',
                            }}>
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match Results */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {[
                        { label: '5-Match (Jackpot)', result: jackpotResult, icon: '🏆', color: 'var(--gold)', pool: pool?.jackpot_pool },
                        { label: '4-Match', result: fourResult, icon: '🥈', color: 'var(--purple-light)', pool: pool?.four_match_pool },
                        { label: '3-Match', result: threeResult, icon: '🥉', color: 'var(--blue)', pool: pool?.three_match_pool },
                      ].map(tier => (
                        <div key={tier.label} style={{
                          padding: '1.25rem',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          textAlign: 'center',
                        }}>
                          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{tier.icon}</div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>{tier.label}</p>
                          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: tier.color, lineHeight: 1 }}>
                            {tier.result?.winner_user_ids?.length || 0}
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.3rem' }}>winners</span>
                          </p>
                          {tier.pool && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                              Pool: £{(tier.pool / 100).toFixed(0)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎰</div>
              <h2 style={{ marginBottom: '1rem' }}>No Draws Published Yet</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                The first monthly draw will be published here once it's complete. Subscribe now to be in the next one!
              </p>
              <Link href="/signup" className="btn btn-primary btn-lg">Subscribe & Enter First Draw</Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
