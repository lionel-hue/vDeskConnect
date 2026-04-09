'use client'
import { useRouter } from 'next/navigation'


export default function SignupSelection () {
  const router = useRouter()
  return (
    <div className='container'>
      <div className='card'>
        <div className='card-header'>
          <div className='logo'>
            <span>vD</span>
          </div>
          <h1 className='card-title'>Join vDeskconnect</h1>
          <p className='card-description'>Choose your account type</p>
        </div>
        <div className='card-content'>
          <div className='selection-buttons'>
            <button
              onClick={() => router.push('/signup/teacher')}
              className='btn btn-selection btn-teacher'
            >
              <div className='btn-content'>
                <div className='btn-title'>Sign up as Teacher</div>
                <div className='btn-subtitle'>Create and manage classes</div>
              </div>
            </button>
            <button
              onClick={() => router.push('/signup/student')}
              className='btn btn-selection btn-student'
            >
              <div className='btn-content'>
                <div className='btn-title'>Sign up as Student</div>
                <div className='btn-subtitle'>Join classes and learn</div>
              </div>
            </button>
          </div>
          <div className='footer-link'>
            <button onClick={() => router.push('/')} className='link-btn'>
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
