import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm'
import { validateLogin } from '../../utils/validation'
import { usePasswordToggle } from '../../hooks/usePasswordToggle'

function Login({ onSignupClick }) {
  const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
    email: '',
    password: '',
    role: 'junior-student' // Default role
  })

  const navigate = useNavigate();
  const [passwordType, passwordIcon, togglePassword] = usePasswordToggle()

  // Role options
  const roleOptions = [
    { value: 'junior-student', label: 'Junior Student' },
    { value: 'senior-student', label: 'Senior Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Administrator' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateLogin(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true)

      try {
        const userData = {
          email: values.email,
          password: values.password,
          role: values.role
        }

        const response = await fetch(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/auth/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        const data = await response.json()

        // Handle 403 status (unverified account) specifically
        if (response.status === 403 && data.message.includes('not verified')) {
          // Account is not verified - navigate to verification page
          navigate('/verify-account', {
            state: {
              fromLogin: true,
              email: values.email,
              role: values.role,
            }
          });
        }
        // Handle successful login
        else if (response.ok) {
          console.log('User logged in successfully:', data)
          // Here you would typically set authentication state and redirect
        }
        // Handle other errors
        else {
          console.error('Error logging in user:', data)
        }
      } catch (error) {
        console.error('Network error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="app">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div className="logo">
              <span>vD</span>
            </div>
            <div className="header-content">
              <h1 className="card-title">Welcome Back</h1>
              <p className="card-description">Sign in to vDeskconnect</p>
            </div>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="form">
              {/* Role Selection Dropdown */}
              <div className="form-group">
                <label htmlFor="role" className="label">I am a</label>
                <select
                  id="role"
                  name="role"
                  className={`input ${errors.role ? 'error' : ''}`}
                  value={values.role}
                  onChange={handleChange}
                  required
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.role && <div className="error-message">{errors.role}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="label">Email or Phone</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className={`input ${errors.email ? 'error' : ''}`}
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Enter your email or phone number"
                  required
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={passwordType}
                    id="password"
                    name="password"
                    className={`input password-input ${errors.password ? 'error' : ''}`}
                    value={values.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePassword}
                  >
                    <i data-lucide={passwordIcon}></i>
                  </button>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="footer-link">
              <button
                onClick={onSignupClick}
                className="link-btn"
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

export default Login