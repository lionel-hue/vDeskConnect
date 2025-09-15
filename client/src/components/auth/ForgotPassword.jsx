import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { validateForgotPassword } from '../../utils/validation'; // Updated Import
import { Mail } from 'lucide-react';

// The inline validation function has been removed from here.

function ForgotPassword() {
    const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
        email: '',
    });

    const [messageSent, setMessageSent] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        // Now using the imported validation function
        const validationErrors = validateForgotPassword(values);
        setErrors(validationErrors);

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
                setServerError('Could not connect to the server. Please check your network.');
            } finally {
                setIsSubmitting(false);
            }
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
                        {messageSent ? (
                            <div className="success-message-container">
                                <div className="role-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', margin: '0 auto 1rem' }}>
                                     <Mail size={24} />
                                </div>
                                <p className="card-description" style={{ textAlign: 'center' }}>
                                    If an account with the email <strong>{values.email}</strong> exists, a password reset link has been sent. Please check your spam folder if you don't see it.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="form">
                                <div className="form-group">
                                    <label htmlFor="email" className="label">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className={`input ${errors.email ? 'error' : ''}`}
                                        value={values.email}
                                        onChange={handleChange}
                                        placeholder="Enter your registered email"
                                        required
                                    />
                                    {errors.email && <div className="error-message">{errors.email}</div>}
                                </div>

                                {serverError && <div className="error-message server-error">{serverError}</div>}

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