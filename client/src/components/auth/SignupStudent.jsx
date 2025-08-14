import { useForm } from '../../hooks/useForm'
import { validateForm } from '../../utils/validation'
import { usePasswordToggle } from '../../hooks/usePasswordToggle'

function SignupStudent({ onBackClick, onSuccess, showMessage }) {
    const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
        name: '',
        age: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordType, passwordIcon, togglePassword] = usePasswordToggle()
    const [confirmPasswordType, confirmPasswordIcon, toggleConfirmPassword] = usePasswordToggle()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationErrors = validateForm(values, 'student')
        setErrors(validationErrors)

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true)

            try {
                const studentData = {
                    name: values.name,
                    age: values.age,
                    email: values.email,
                    password: values.password,
                }

                const response = await fetch('http://localhost:1024/auth/student/signup/', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(studentData),
                })

                const data = await response.json()

                if (response.ok) {
                    console.log('Student signed up successfully:', data)
                    onSuccess()
                } else {
                    console.error('Error signing up student:', data)
                    showMessage('error', data.message || 'Signup failed')
                }
            } catch (error) {
            console.error('Error signing up student:', error)
            showMessage('error', error.message || 'Signup failed')
            } finally {
            setIsSubmitting(false)
            }
        }
}

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="header-nav">
                        <button onClick={onBackClick} className="back-btn">
                            <i data-lucide="arrow-left"></i>
                        </button>
                        <div className="role-icon student-icon">
                            <i data-lucide="users"></i>
                        </div>
                    </div>
                    <div className="header-content">
                        <h1 className="card-title">Create Student Account</h1>
                        <p className="card-description">Join as a learner on vDeskconnect</p>
                    </div>
                </div>
                <div className="card-content">
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label htmlFor="name" className="label">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`input ${errors.name ? 'error' : ''}`}
                                value={values.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="age" className="label">Age</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                className={`input ${errors.age ? 'error' : ''}`}
                                value={values.age}
                                onChange={handleChange}
                                placeholder="Enter your age"
                                min="1"
                                max="120"
                            />
                            {errors.age && <div className="error-message">{errors.age}</div>}
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
                                    placeholder="Create a password"
                                    minLength="6"
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

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={confirmPasswordType}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className={`input password-input ${errors.confirmPassword ? 'error' : ''}`}
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={toggleConfirmPassword}
                                >
                                    <i data-lucide={confirmPasswordIcon}></i>
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <div className="error-message">{errors.confirmPassword}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-student-gradient"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="footer-link">
                        <button
                            onClick={onBackClick}
                            className="link-btn"
                        >
                            Already have an account? Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignupStudent