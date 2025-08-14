// SignupTeacher.jsx
import { useForm } from '../../hooks/useForm';
import { validateForm } from '../../utils/validation';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';

function SignupTeacher({ onBackClick, onSuccess, showMessage }) {
    const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
        name: '',
        age: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [passwordType, passwordIcon, togglePassword] = usePasswordToggle();
    const [confirmPasswordType, confirmPasswordIcon, toggleConfirmPassword] = usePasswordToggle();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(values, 'teacher');
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);

            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log('Teacher signup submitted:', values);
                onSuccess();
            } catch (error) {
                showMessage('error', error.message || 'Signup failed');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="header-nav">
                        <button onClick={onBackClick} className="back-btn">
                            <i data-lucide="arrow-left"></i>
                        </button>
                        <div className="role-icon teacher-icon">
                            <i data-lucide="graduation-cap"></i>
                        </div>
                    </div>
                    <div className="header-content">
                        <h1 className="card-title">Create Teacher Account</h1>
                        <p className="card-description">Join as an educator on vDeskconnect</p>
                    </div>
                </div>
                <div className="card-content">
                    <form onSubmit={handleSubmit} className="form">
                        {/* Form fields same as before */}
                        {/* ... */}

                        <button
                            type="submit"
                            className="btn btn-primary btn-teacher-gradient"
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
    );
}

export default SignupTeacher;