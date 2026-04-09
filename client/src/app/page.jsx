'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'


export default function LoginPage () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      })
      const data = await res.json()
      if (res.ok) {
        login(data.data)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='app'>
      <div className='container'>
        <div className='card'>
          <div className='card-header'>
            <div className='logo'>
              <span>vD</span>
            </div>
            <h1 className='card-title'>Welcome Back</h1>
            <p className='card-description'>Sign in to vDeskconnect</p>
          </div>
          <div className='card-content'>
            <form onSubmit={handleSubmit} className='form'>
              {error && <div className='error-message'>{error}</div>}
              <div className='form-group'>
                <label className='label'>I am a</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className='input'
                >
                  <option value='student'>Student</option>
                  <option value='teacher'>Teacher</option>
                  <option value='admin'>Administrator</option>
                </select>
              </div>
              <div className='form-group'>
                <label className='label'>Email</label>
                <input
                  type='email'
                  className='input'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <label className='label'>Password</label>
                <div className='input-wrapper'>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className='input password-input'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type='button'
                    className='password-toggle'
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <div className='footer-link'>
              <button
                onClick={() => router.push('/signup')}
                className='link-btn'
              >
                Don't have an account? Create new account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
