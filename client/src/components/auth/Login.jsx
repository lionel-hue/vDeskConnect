import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm'
import { validateLogin } from '../../utils/validation'
import { usePasswordToggle } from '../../hooks/usePasswordToggle'
import '../../style/auth.css';

function Login({ onSignupClick, onLoginSuccess }) {
  const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
    email: '',
    password: '',
    role: 'junior-student' // Default role
  })

  const navigate = useNavigate();
  const [passwordType, passwordIcon, togglePassword] = usePasswordToggle()
  const [visibleErrors, setVisibleErrors] = useState({});

  // Role options
  const roleOptions = [
    { value: 'junior-student', label: 'Junior Student' },
    { value: 'senior-student', label: 'Senior Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Administrator' }
  ]

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setVisibleErrors(errors);

      const timer = setTimeout(() => {
        setVisibleErrors({});
        setErrors({});
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errors, setErrors]);

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
          // Account is not verified - navigate to verification page (show animation)
          navigate('/verify-account', {
            state: {
              fromLogin: true, // This flag will show the animation
              email: values.email,
              role: values.role,
            }
          });
        }
        // Handle successful login (account is verified)
        else if (response.ok) {
          console.log('User logged in successfully:', data)

          // Call the onLoginSuccess prop to update authentication state
          if (onLoginSuccess) {
            onLoginSuccess();
          }

          // Navigate directly to dashboard
          navigate('/dashboard');
        }
        // Handle other errors
        else {
          console.error('Error logging in user:', data)
          // Set server error that will also auto-dismiss
          setErrors({ server: data.message || 'Login failed. Please try again.' });
        }
      } catch (error) {
        console.error('Network error:', error)
        setErrors({ server: 'Network error. Please check your connection.' });
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
              {/* Server error message */}
              {visibleErrors.server && (
                <div className="error-message login-style" style={{ display: 'block' }}>
                  {visibleErrors.server}
                </div>
              )}

              {/* Role Selection Dropdown */}
              <div className="form-group">
                <label htmlFor="role" className="label">I am a</label>
                <select
                  id="role"
                  name="role"
                  className={`input ${visibleErrors.role ? 'error' : ''}`}
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
                {visibleErrors.role && (
                  <div className="error-message login-style" style={{ display: 'block' }}>
                    {visibleErrors.role}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="label">Email or Phone</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className={`input ${visibleErrors.email ? 'error' : ''}`}
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Enter your email or phone number"
                  required
                />
                {visibleErrors.email && (
                  <div className="error-message login-style" style={{ display: 'block' }}>
                    {visibleErrors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={passwordType}
                    id="password"
                    name="password"
                    className={`input password-input ${visibleErrors.password ? 'error' : ''}`}
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
                {visibleErrors.password && (
                  <div className="error-message login-style" style={{ display: 'block' }}>
                    {visibleErrors.password}
                  </div>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="form-options">
                <Link to="/forgot-password" className="link-btn">
                  Forgot password?
                </Link>
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