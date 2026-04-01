'use client'
import { useState, useRef } from 'react'

interface Props {
  verificationId: string
  currentStatus: string
}

export default function WinnerProofUpload({ verificationId, currentStatus }: Props) {
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)) {
      setError('Only JPEG, PNG, WebP, or PDF files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('verification_id', verificationId)

    const res = await fetch('/api/winner/upload-proof', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Upload failed. Please try again.')
    } else {
      setSuccess(true)
    }
    setUploading(false)
  }

  if (currentStatus === 'approved') return null

  return (
    <div style={{ marginTop: '1rem' }}>
      {success ? (
        <div className="alert alert-success">✅ Proof uploaded successfully! Our team will review it shortly.</div>
      ) : (
        <>
          {error && <div className="alert alert-error">{error}</div>}
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⏳ Uploading...' : '📎 Upload Proof'}
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            JPEG, PNG, WebP or PDF · Max 5MB
          </p>
        </>
      )}
    </div>
  )
}
