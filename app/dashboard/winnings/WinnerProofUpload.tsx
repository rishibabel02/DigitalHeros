'use client'
import { useState } from 'react'

export default function WinnerProofUpload({ verificationId }: { verificationId: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('proof', file)
    formData.append('verificationId', verificationId)

    const res = await fetch('/api/winner', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Upload failed')
    } else {
      setSuccess(true)
      // Reload to show updated state
      setTimeout(() => window.location.reload(), 1500)
    }
    setUploading(false)
  }

  if (success) return <div className="alert alert-success">✅ Proof uploaded! We'll review it shortly.</div>

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.5rem' }}>
        {uploading ? <><span className="spinner" /> Uploading...</> : '📎 Upload Proof'}
        <input
          id="proof-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleUpload}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </label>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>JPEG, PNG, WebP or PDF · Max 5MB</p>
    </div>
  )
}
