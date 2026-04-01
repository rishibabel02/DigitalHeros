'use client'

export default function CancelButton() {
  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel? You retain access until your billing period ends.')) return
    const res = await fetch('/api/subscription/cancel', { method: 'POST' })
    if (res.ok) {
      alert('Subscription cancelled. You retain access until the end of your billing period.')
      window.location.reload()
    } else {
      const data = await res.json()
      alert('Error: ' + (data.error || 'Could not cancel subscription'))
    }
  }

  return (
    <button id="cancel-subscription-btn" className="btn btn-danger btn-sm" onClick={handleCancel}>
      Cancel Subscription
    </button>
  )
}
