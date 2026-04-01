'use client'

export default function MarkPaidButton({ id }: { id: string }) {
  async function handle() {
    const res = await fetch(`/api/admin/winners/${id}/verify`, { method: 'PATCH' })
    if (res.ok) window.location.reload()
    else {
      const data = await res.json()
      alert('Error: ' + (data.error || 'Failed'))
    }
  }

  return (
    <button id={`mark-paid-${id}`} className="btn btn-gold btn-sm" style={{ fontSize: '0.75rem' }} onClick={handle}>
      💰 Mark Paid
    </button>
  )
}
