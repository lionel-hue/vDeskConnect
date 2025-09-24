import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm'
import { validateLogin } from '../../utils/validation'
import { usePasswordToggle } from '../../hooks/usePasswordToggle'
import styles from '../../style/auth.module.css';

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
    <div className={styles.app}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logo}>
              <span>vD</span>
            </div>
            <div className={styles.headerContent}>
              <h1 className={styles.cardTitle}>Welcome Back</h1>
              <p className={styles.cardDescription}>Sign in to vDeskconnect</p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Server error message */}
              {visibleErrors.server && (
                <div className={`${styles.errorMessage} ${styles.loginStyle}`} style={{ display: 'block' }}>
                  {visibleErrors.server}
                </div>
              )}

              {/* Role Selection Dropdown */}
              <div className={styles.formGroup}>
                <label htmlFor="role" className={styles.label}>I am a</label>
                <select
                  id="role"
                  name="role"
                  className={`${styles.input} ${visibleErrors.role ? styles.error : ''}`}
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
                  <div className={`${styles.errorMessage} ${styles.loginStyle}`} style={{ display: 'block' }}>
                    {visibleErrors.role}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email or Phone</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className={`${styles.input} ${visibleErrors.email ? styles.error : ''}`}
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Enter your email or phone number"
                  required
                />
                {visibleErrors.email && (
                  <div className={`${styles.errorMessage} ${styles.loginStyle}`} style={{ display: 'block' }}>
                    {visibleErrors.email}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={passwordType}
                    id="password"
                    name="password"
                    className={`${styles.input} ${styles.passwordInput} ${visibleErrors.password ? styles.error : ''}`}
                    value={values.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={togglePassword}
                  >
                    <i data-lucide={passwordIcon}></i>
                  </button>
                </div>
                {visibleErrors.password && (
                  <div className={`${styles.errorMessage} ${styles.loginStyle}`} style={{ display: 'block' }}>
                    {visibleErrors.password}
                  </div>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className={styles.formOptions}>
                <Link to="/forgot-password" className={styles.linkBtn}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className={styles.footerLink}>
              <button
                onClick={onSignupClick}
                className={styles.linkBtn}
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