import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../style/auth.css';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get token from URL parameters
    const token = searchParams.get('token');

    useEffect(() => {
        // Validate that we have token
        if (!token) {
            setServerError('Invalid reset link. Please check your email for the correct link.');
        }
    }, [token]);

    // Auto-dismiss errors after 5 seconds
    useEffect(() => {
        if (Object.keys(errors).length > 0 || serverError) {
            const timer = setTimeout(() => {
                setErrors({});
                setServerError('');
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [errors, serverError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setServerError('');

        // Validate passwords
        const validationErrors = {};

        if (newPassword.length < 6) {
            validationErrors.newPassword = 'Password must be at least 6 characters long';
        }

        if (newPassword !== confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/auth/reset-password/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setServerError(data.message || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            setServerError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // If email or token is missing, show error
    if (!token) {
        return (
            <div className="reset-password-container">
                <div className="container">
                    <div className="card">
                        <div className="card-header">
                            <div className="logo">
                                <span>vD</span>
                            </div>
                            <h1 className="card-title">Invalid Reset Link</h1>
                            <p className="card-description">This password reset link is invalid or has expired</p>
                        </div>

                        <div className="card-content">
                            <div className="error-message login-style" style={{ display: 'block' }}>
                                {serverError || 'Please check your email for the correct reset link.'}
                            </div>

                            <div className="footer">
                                <p>vDeskconnect &copy; 2024. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-container">
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="logo">
                            <span>vD</span>
                        </div>
                        <h1 className="card-title">Reset Your Password</h1>
                        <p className="card-description">Create a new password for your vDeskconnect account</p>
                    </div>

                    <div className="card-content">
                        {isSuccess && (
                            <div className="success-message">
                                ✓ Password reset successfully! Redirecting to login...
                            </div>
                        )}

                        {serverError && (
                            <div className="error-message login-style" style={{ display: 'block' }}>
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="newPassword" className="label">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        className={`input ${errors.newPassword ? 'error' : ''}`}
                                        placeholder="Enter your new password"
                                        minLength="6"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    {errors.newPassword && (
                                        <div className="error-message login-style" style={{ display: 'block' }}>
                                            {errors.newPassword}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className={`input ${errors.confirmPassword ? 'error' : ''}`}
                                        placeholder="Confirm your new password"
                                        minLength="6"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    {errors.confirmPassword && (
                                        <div className="error-message login-style" style={{ display: 'block' }}>
                                            {errors.confirmPassword}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>

                        <div className="security-note">
                            <strong>Security Note:</strong> This link will expire in 10 mins for your security.
                            If you didn't request this reset, please ignore this email.
                        </div>

                        <div className="footer">
                            <p>vDeskconnect &copy; 2024. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;