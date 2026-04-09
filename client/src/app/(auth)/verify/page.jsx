'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyPage () {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email] = useState(searchParams.get('email') || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const handleSubmit = async e => {
    
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        }
      )
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/'), 2000)
      } else {
        const d = await res.json()
        setError(d.message)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }
  
  
  return (
    <div className='container'>
      <div className='card'>
        <div className='card-header'>
          <div className='logo'>
            <span>vD</span>
          </div>
          <h1 className='card-title'>Verify Account</h1>
          <p className='card-description'>
            Enter the 6-digit code sent to {email}
          </p>
        </div>
        <div className='card-content'>
          {success ? (
            <div className='success-message'>✓ Verified! Redirecting...</div>
          ) : (
            <form onSubmit={handleSubmit} className='form'>
              {error && <div className='error-message'>{error}</div>}
              <div className='form-group'>
                <label className='label'>Verification Code</label>
                <input
                  type='text'
                  maxLength={6}
                  className='input'
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
              </div>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
