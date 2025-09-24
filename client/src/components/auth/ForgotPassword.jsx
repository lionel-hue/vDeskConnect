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
        <div className={styles.app}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.logo}>
                            <span>vD</span>
                        </div>
                        <div className={styles.headerContent}>
                            <h1 className={styles.cardTitle}>Forgot Password</h1>
                            <p className={styles.cardDescription}>
                                {messageSent
                                    ? "Check your inbox for a reset link."
                                    : "Enter your email to receive a password reset link."}
                            </p>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        {/* Server error message - auto dismisses after 5 seconds */}
                        {serverError && (
                            <div className={`${styles.errorMessage} ${styles.serverError}`}>
                                {serverError}
                            </div>
                        )}

                        {messageSent ? (
                            <div className={styles.successMessage}>
                                <div className={styles.successIcon}>
                                    <Mail size={24} />
                                </div>
                                <div className={styles.successContent}>
                                    <h3>Reset Link Sent</h3>
                                    <p>
                                        If an account with the email <strong>{values.email}</strong> exists,
                                        a password reset link has been sent. Please check your spam folder
                                        if you don't see it.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className={`${styles.input} ${fieldErrors.email ? styles.error : ''}`}
                                        value={values.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your registered email"
                                        required
                                    />
                                    {/* Inline error message - auto dismisses after 3 seconds */}
                                    {fieldErrors.email && (
                                        <div className={styles.errorMessage}>
                                            {fieldErrors.email}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className={styles.loadingSpinner}></span>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        )}

                        <div className={styles.footerLink} style={{ marginTop: '1rem' }}>
                            <Link to="/" className={styles.linkBtn}>
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