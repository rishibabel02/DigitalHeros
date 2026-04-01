'use client'

export default function SubscribeButton({ plan, label }: { plan: string; label: string }) {
  async function handleClick() {
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert('Failed to start checkout: ' + (data.error || 'Unknown error'))
  }

  return (
    <button id={`subscribe-${plan}-btn`} className="btn btn-primary" style={{ width: '100%' }} onClick={handleClick}>
      {label}
    </button>
  )
}
