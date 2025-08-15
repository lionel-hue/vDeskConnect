import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { validateForm } from '../../utils/validation';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';
import { ArrowLeft, ArrowRight, BookOpen, Eye, EyeOff } from 'lucide-react';

function SignupTeacher({ onBackClick, onSuccess, showMessage }) {
    const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
        name: '',
        age: '',
        email: '',
        password: '',
        confirmPassword: '',
        qualification: '',
        subjects: []
    });

    const [passwordType, passwordIcon, togglePassword] = usePasswordToggle();
    const [confirmPasswordType, confirmPasswordIcon, toggleConfirmPassword] = usePasswordToggle();
    const [currentStep, setCurrentStep] = useState(1);

    const juniorSubjects = [
        'Mathematics',
        'English Language',
        'French',
        'Yoruba',
        'Basic Technology',
        'Basic Science',
        'Agricultural Science',
        'Social Studies',
        'Literature',
        'Security Education',
        'Civic Education',
        'Business Studies',
        'Cultural and Creative Arts',
        'Physical and Health Education',
        'Home Economics',
        'Christian Religious Studies'
    ];

    const seniorSubjects = [
        'Mathematics',
        'English Language',
        'Civic Education',
        'Data Processing',
        'Physics',
        'Chemistry',
        'Biology',
        'Further Mathematics',
        'Agricultural Science',
        'Technical Drawing',
        'Account',
        'Commerce',
        'Economics',
        'Government',
        'Creative Arts',
        'Literature',
        'Christian Religious Knowledge',
        'Islamic Religious Knowledge',
        'Yoruba',
        'French'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(values, 'teacher');
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);

            try {
                const teacherData = {
                    name: values.name,
                    age: values.age,
                    email: values.email,
                    password: values.password,
                    qualification: values.qualification,
                    subjects: values.subjects
                };

                const response = await fetch(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/auth/signup/teacher`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(teacherData),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Teacher signed up successfully:', data);
                    onSuccess();
                } else {
                    console.error('Error signing up teacher:', data);
                    showMessage('error', data.message || 'Signup failed');
                }
            } catch (error) {
                showMessage('error', error.message || 'Signup failed');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            const validationErrors = validateForm({
                name: values.name,
                age: values.age,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword
            }, 'teacher');

            if (Object.keys(validationErrors).length === 0) {
                setCurrentStep(2);
            } else {
                setErrors(validationErrors);
            }
        }
    };

    const prevStep = () => {
        setCurrentStep(1);
    };

    const handleSubjectChange = (subject) => {
        const updatedSubjects = [...values.subjects];
        if (updatedSubjects.includes(subject)) {
            const index = updatedSubjects.indexOf(subject);
            updatedSubjects.splice(index, 1);
        } else {
            updatedSubjects.push(subject);
        }
        handleChange({ target: { name: 'subjects', value: updatedSubjects } });
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="header-nav">
                        <button onClick={onBackClick} className="back-btn">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="role-icon teacher-icon">
                            <BookOpen size={20} />
                        </div>
                    </div>
                    <div className="header-content">
                        <h1 className="card-title">Create Teacher Account</h1>
                        <p className="card-description">Join as an educator on vDeskconnect</p>
                    </div>
                </div>
                <div className="card-content">
                    <form onSubmit={handleSubmit} className="form">
                        {/* Step 1: Basic Information */}
                        <div className={`form-step ${currentStep === 1 ? 'active' : 'inactive'}`}>
                            <div className="form-group">
                                <label htmlFor="name" className="label">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={`input ${errors.name ? 'error' : ''}`}
                                    value={values.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
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
                                    required
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
                                        placeholder="Create a password"
                                        minLength="6"
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
                                        required
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

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    className="btn btn-next"
                                    onClick={nextStep}
                                >
                                    Next <i data-lucide="arrow-right"></i>
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Professional Information */}
                        <div className={`form-step ${currentStep === 2 ? 'active' : 'inactive'}`}>
                            <div className="form-group">
                                <label htmlFor="qualification" className="label">Qualification</label>
                                <input
                                    type="text"
                                    id="qualification"
                                    name="qualification"
                                    className={`input ${errors.qualification ? 'error' : ''}`}
                                    value={values.qualification}
                                    onChange={handleChange}
                                    placeholder="Enter your qualification"
                                    required
                                />
                                {errors.qualification && <div className="error-message">{errors.qualification}</div>}
                            </div>

                            <div className="form-group">
                                <label className="label">Subjects (Select all that apply)</label>
                                <div className="subjects-container">
                                    <h4 className="subject-category">Junior Secondary Subjects</h4>
                                    <div className="subject-options">
                                        {juniorSubjects.map(subject => (
                                            <div key={`junior-${subject}`} className="subject-option">
                                                <input
                                                    type="checkbox"
                                                    id={`junior-${subject}`}
                                                    checked={values.subjects.includes(subject)}
                                                    onChange={() => handleSubjectChange(subject)}
                                                />
                                                <label htmlFor={`junior-${subject}`}>{subject}</label>
                                            </div>
                                        ))}
                                    </div>

                                    <h4 className="subject-category">Senior Secondary Subjects</h4>
                                    <div className="subject-options">
                                        {seniorSubjects.map(subject => (
                                            <div key={`senior-${subject}`} className="subject-option">
                                                <input
                                                    type="checkbox"
                                                    id={`senior-${subject}`}
                                                    checked={values.subjects.includes(subject)}
                                                    onChange={() => handleSubjectChange(subject)}
                                                />
                                                <label htmlFor={`senior-${subject}`}>{subject}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {errors.subjects && <div className="error-message">{errors.subjects}</div>}
                            </div>

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    className="btn btn-prev"
                                    onClick={prevStep}
                                >
                                    <i data-lucide="arrow-left"></i> Previous
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-teacher-gradient"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </div>
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