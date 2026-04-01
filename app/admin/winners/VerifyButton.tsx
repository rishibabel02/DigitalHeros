'use client'

export default function VerifyButton({ id, action }: { id: string, action: 'approve' | 'reject' }) {
  async function handle() {
    const note = action === 'reject' ? prompt('Rejection reason (optional):') || '' : ''
    const res = await fetch(`/api/admin/winners/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminNote: note }),
    })
    if (res.ok) window.location.reload()
    else {
      const data = await res.json()
      alert('Error: ' + (data.error || 'Failed'))
    }
  }

  return (
    <button
      id={`winner-${action}-${id}`}
      className={`btn btn-sm ${action === 'approve' ? 'btn-primary' : 'btn-danger'}`}
      style={{ fontSize: '0.75rem' }}
      onClick={handle}
    >
      {action === 'approve' ? '✅ Approve' : '❌ Reject'}
    </button>
  )
}
