'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function StudentSignup () {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    invitationCode: '',
    grade: 'jss1',
    type: 'junior'
  })
  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value })
  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)
  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/student`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      )
      const data = await res.json()
      if (res.ok) {
        router.push('/verify?email=' + formData.email)
      } else {
        setError(data.message)
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
          <h1 className='card-title'>Create Student Account</h1>
          <div className='step-indicator'>
            <div className={`step-dot${step >= 1 ? ' active' : ''}`}></div>
            <div className={`step-dot${step >= 2 ? ' active' : ''}`}></div>
            <div className={`step-dot${step >= 3 ? ' active' : ''}`}></div>
          </div>
        </div>
        <div className='card-content'>
          <form onSubmit={handleSubmit} className='form'>
            {error && <div className='error-message'>{error}</div>}
            {step === 1 && (
              <>
                {' '}
                <div className='form-group'>
                  <label className='label'>Full Name</label>
                  <input
                    name='name'
                    className='input'
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='form-group'>
                  <label className='label'>Email</label>
                  <input
                    name='email'
                    type='email'
                    className='input'
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='form-group'>
                  <label className='label'>Password</label>
                  <div className='input-wrapper'>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className='input'
                      value={formData.password}
                      onChange={handleChange}
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
                <div className='form-navigation'>
                  <div></div>
                  <button
                    type='button'
                    className='btn btn-nav btn-next'
                    onClick={nextStep}
                  >
                    Next
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                {' '}
                <div className='form-group'>
                  <label className='label'>Student Type</label>
                  <select
                    name='type'
                    className='input'
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value='junior'>Junior</option>
                    <option value='senior'>Senior</option>
                  </select>
                </div>
                <div className='form-group'>
                  <label className='label'>Grade</label>
                  <select
                    name='grade'
                    className='input'
                    value={formData.grade}
                    onChange={handleChange}
                  >
                    <option value='jss1'>JSS 1</option>
                    <option value='jss2'>JSS 2</option>
                    <option value='jss3'>JSS 3</option>
                    <option value='sss1'>SSS 1</option>
                    <option value='sss2'>SSS 2</option>
                    <option value='sss3'>SSS 3</option>
                  </select>
                </div>
                <div className='form-navigation'>
                  <button
                    type='button'
                    className='btn btn-nav btn-prev'
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <button
                    type='button'
                    className='btn btn-nav btn-next'
                    onClick={nextStep}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                {' '}
                <div className='form-group'>
                  <label className='label'>Invitation Code</label>
                  <input
                    name='invitationCode'
                    className='input'
                    value={formData.invitationCode}
                    onChange={handleChange}
                    placeholder='Required by Admin'
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Provided by your school administrator
                  </div>
                </div>
                <div className='form-navigation'>
                  <button
                    type='button'
                    className='btn btn-nav btn-prev'
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>
          <div className='footer-link'>
            <button onClick={() => router.push('/')} className='link-btn'>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
