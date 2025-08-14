import { useForm } from '../../hooks/useForm';
import { validateForm } from '../../utils/validation';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';

function Login({ onSignupClick, formMessage, showMessage }) {
const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
    email: '',
    password: ''
});

const [passwordType, passwordIcon, togglePassword] = usePasswordToggle();

const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(values, 'login');
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
    setIsSubmitting(true);
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Login submitted:', values);
        showMessage('success', 'Login successful!');
    } catch (error) {
        showMessage('error', error.message || 'Login failed');
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
            <h1 className="card-title">Welcome Back</h1>
            <p className="card-description">Sign in to vDeskconnect</p>
            </div>
        </div>
        <div className="card-content">
            {formMessage && (
            <div className={`${formMessage.type}-message`}>
                {formMessage.text}
            </div>
            )}
            
            <form onSubmit={handleSubmit} className="form">
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
);
}

export default Login;