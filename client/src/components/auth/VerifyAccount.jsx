import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Mail, Smartphone } from 'lucide-react';
import '../../style/auth.module.css';

function VerifyAccount({ userType, email, phone, verificationCode, onBackClick }) {
    const [enteredCode, setEnteredCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [remainingTime, setRemainingTime] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [showCodeInput, setShowCodeInput] = useState(true); // Control which section to show
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we're coming from login (should skip code input)
    useEffect(() => {
        // Check if we have a flag indicating this is from login
        const fromLogin = location.state?.fromLogin;
        if (fromLogin) {
            setShowCodeInput(false); // Skip code input for login flow
        }
    }, [location]);

    useEffect(() => {
        if (remainingTime > 0) {
            const timer = setTimeout(() => {
                setRemainingTime(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [remainingTime]);

    const handleChange = (e) => {
        const { value } = e.target;
        if (/^\d{0,6}$/.test(value)) {
            setEnteredCode(value);
            if (errors.verificationCode) {
                setErrors(prev => ({ ...prev, verificationCode: '' }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate code
        if (!enteredCode || enteredCode.length !== 6) {
            setErrors({ verificationCode: 'Please enter a valid 6-digit code' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Compare the entered code with the code received from server
            if (enteredCode === verificationCode) {
                setIsVerified(true);
                setShowCodeInput(false); // Hide code input after successful verification

                // In a real app, you might want to make an API call here
                // to update the user's verification status in your backend
                console.log('Verification successful for:', email);
            } else {
                setErrors({ verificationCode: 'Invalid verification code. Please try again.' });
            }
        } catch (error) {
            setErrors({ verificationCode: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = () => {
        if (canResend) {
            // In a real app, you would call your backend API to resend the code
            // For now, we'll just reset the timer
            setRemainingTime(60);
            setCanResend(false);
            setErrors({});

            // Show success message (you might want to integrate with your message system)
            console.log('Verification code resent to:', email);
        }
    };

    const handleGoToLogin = () => {
        navigate('/');
    };

    // Show verification in progress (for both login flow and after code verification)
    if (!showCodeInput) {
        return (
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="header-nav">
                            <button onClick={onBackClick} className="back-btn">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="role-icon">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <div className="header-content">
                            <h1 className="card-title">Account Verification</h1>
                            <p className="card-description">Your account is being verified</p>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="verification-status">
                            <div className="verification-animation">
                                <div className="pulse-ring"></div>
                                <div className="pulse-ring delay-1"></div>
                                <div className="pulse-ring delay-2"></div>
                                <Clock size={48} className="clock-icon" />
                            </div>
                            <div className="verification-message">
                                <h3>Your account is undergoing verification</h3>
                                <p>Please come back later when the verification is complete!</p>
                            </div>
                            <button
                                onClick={handleGoToLogin}
                                className="btn btn-primary"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show code input (only for signup flow)
    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="header-nav">
                        <button onClick={onBackClick} className="back-btn">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="role-icon">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div className="header-content">
                        <h1 className="card-title">Verify Your Account</h1>
                        <p className="card-description">Enter the verification code sent to you</p>
                    </div>
                </div>
                <div className="card-content">
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label htmlFor="verificationCode" className="label">Verification Code</label>
                            <input
                                type="text"
                                id="verificationCode"
                                name="verificationCode"
                                className={`input ${errors.verificationCode ? 'error' : ''}`}
                                value={enteredCode}
                                onChange={handleChange}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                required
                            />
                            {errors.verificationCode && (
                                <div className="error-message">{errors.verificationCode}</div>
                            )}
                        </div>

                        <div className="verification-info">
                            <p>We've sent a 6-digit verification code to:</p>
                            <div className="contact-methods">
                                {email && (
                                    <div className="contact-method">
                                        <Mail size={16} />
                                        <span>{email}</span>
                                    </div>
                                )}
                                {phone && (
                                    <div className="contact-method">
                                        <Smartphone size={16} />
                                        <span>{phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || enteredCode.length !== 6}
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify Account'}
                        </button>

                        <div className="resend-code">
                            <p>Didn't receive the code?</p>
                            {canResend ? (
                                <button
                                    type="button"
                                    className="link-btn"
                                    onClick={handleResendCode}
                                    disabled={isSubmitting}
                                >
                                    Resend code
                                </button>
                            ) : (
                                <p className="countdown">Resend in {remainingTime}s</p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default VerifyAccount;