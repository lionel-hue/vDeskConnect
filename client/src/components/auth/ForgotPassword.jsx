import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { validateForgotPassword } from '../../utils/validation';
import { Mail } from 'lucide-react';
import '../../style/auth.css';

function ForgotPassword() {
    const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
        email: '',
    });

    const [messageSent, setMessageSent] = useState(false);
    const [serverError, setServerError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        // Update field errors when errors change
        setFieldErrors(errors);
    }, [errors]);

    useEffect(() => {
        // Auto-dismiss server errors after 5 seconds
        if (serverError) {
            const timer = setTimeout(() => {
                setServerError('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [serverError]);

    useEffect(() => {
        // Auto-dismiss field errors after 3 seconds when user starts typing
        if (Object.keys(fieldErrors).length > 0) {
            const timer = setTimeout(() => {
                setFieldErrors({});
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [fieldErrors]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        const validationErrors = validateForgotPassword(values);
        setErrors(validationErrors);
        setFieldErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/auth/forgot-password/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: values.email }),
                });

                if (response.ok) {
                    setMessageSent(true);
                } else {
                    const data = await response.json();
                    setServerError(data.message || 'An error occurred. Please try again later.');
                }
            } catch (error) {
                console.error('Network error:', error);
                setServerError('Server temporarily down, Please try again later.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleInputChange = (e) => {
        handleChange(e);
        // Clear specific field error when user starts typing
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({
                ...prev,
                [e.target.name]: ''
            }));
        }
    };

    return (
        <div className="app">
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="logo">
                            <span>vD</span>
                        </div>
                        <div className="header-content">
                            <h1 className="card-title">Forgot Password</h1>
                            <p className="card-description">
                                {messageSent
                                    ? "Check your inbox for a reset link."
                                    : "Enter your email to receive a password reset link."}
                            </p>
                        </div>
                    </div>
                    <div className="card-content">
                        {/* Server error message - auto dismisses after 5 seconds */}
                        {serverError && (
                            <div className="error-message server-error">
                                {serverError}
                            </div>
                        )}

                        {messageSent ? (
                            <div className="success-message">
                                <div className="success-icon">
                                    <Mail size={24} />
                                </div>
                                <div className="success-content">
                                    <h3>Reset Link Sent</h3>
                                    <p>
                                        If an account with the email <strong>{values.email}</strong> exists,
                                        a password reset link has been sent. Please check your spam folder
                                        if you don't see it.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="form">
                                <div className="form-group">
                                    <label htmlFor="email" className="label">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className={`input ${fieldErrors.email ? 'error' : ''}`}
                                        value={values.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your registered email"
                                        required
                                    />
                                    {/* Inline error message - auto dismisses after 3 seconds */}
                                    {fieldErrors.email && (
                                        <div className="error-message">
                                            {fieldErrors.email}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="footer-link" style={{ marginTop: '1rem' }}>
                            <Link to="/" className="link-btn">
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;