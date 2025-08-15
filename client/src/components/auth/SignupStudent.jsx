import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { validateForm } from '../../utils/validation';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';
import { ArrowLeft, ArrowRight, GraduationCap, Eye, EyeOff } from 'lucide-react';

function SignupStudent({ onBackClick, onSuccess, showMessage }) {
    const { values, errors, isSubmitting, handleChange, setErrors, setIsSubmitting } = useForm({
        name: '',
        age: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentType: 'junior',
        grade: '',
        department: '',
        role: ''
    });

    const [passwordType, IconPassword, togglePassword] = usePasswordToggle();
    const [confirmPasswordType, IconConfirmPassword, toggleConfirmPassword] = usePasswordToggle();
    const [currentStep, setCurrentStep] = useState(1);

    const juniorGrades = [
        { value: 'jss1', label: 'JSS 1' },
        { value: 'jss2', label: 'JSS 2' },
        { value: 'jss3', label: 'JSS 3' }
    ];

    const seniorGrades = [
        { value: 'sss1', label: 'SSS 1' },
        { value: 'sss2', label: 'SSS 2' },
        { value: 'sss3', label: 'SSS 3' }
    ];

    const departments = ['Science', 'Arts', 'Commercial'];

    const roles = [
        { value: '', label: 'No role' },
        { value: 'head_boy', label: 'Head Boy' },
        { value: 'head_girl', label: 'Head Girl' },
        { value: 'assistant_head_boy', label: 'Assistant Head Boy' },
        { value: 'assistant_head_girl', label: 'Assistant Head Girl' },
        { value: 'attendance_prefect', label: 'Attendance Prefect' },
        { value: 'assistant_attendance_prefect', label: 'Assistant Attendance Prefect' },
        { value: 'sport_prefect', label: 'Sport Prefect' },
        { value: 'assistant_sport_prefect', label: 'Assistant Sport Prefect' },
        { value: 'lab_prefect', label: 'Lab Prefect' },
        { value: 'assistant_lab_prefect', label: 'Assistant Lab Prefect' },
        { value: 'timekeeper', label: 'Timekeeper' },
        { value: 'assistant_timekeeper', label: 'Assistant Timekeeper' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(values, 'student');
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);

            try {
                const studentData = {
                    name: values.name,
                    age: values.age,
                    email: values.email,
                    password: values.password,
                    studentType: values.studentType,
                    grade: values.grade,
                    department: values.studentType === 'senior' ? values.department : null,
                    role: values.studentType === 'senior' ? values.role || null : null
                };

                const response = await fetch(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/auth/signup/student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(studentData),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Student signed up successfully:', data);
                    onSuccess();
                } else {
                    console.error('Error signing up student:', data);
                    showMessage('error', data.message || 'Signup failed');
                }
            } catch (error) {
                console.error('Error signing up student:', error);
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
            }, 'student');

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

    const handleStudentTypeChange = (e) => {
        handleChange(e);
        // Reset grade and department when student type changes
        handleChange({ target: { name: 'grade', value: '' } });
        if (e.target.value === 'junior') {
            handleChange({ target: { name: 'department', value: '' } });
            handleChange({ target: { name: 'role', value: '' } });
        }
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="header-nav">
                        <button onClick={onBackClick} className="back-btn">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="role-icon student-icon">
                            <GraduationCap size={20} />
                        </div>
                    </div>
                    <div className="header-content">
                        <h1 className="card-title">Create Student Account</h1>
                        <p className="card-description">Join as a learner on vDeskconnect</p>
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
                                        <IconPassword size={16} />
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
                                        <IconConfirmPassword size={16} />
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
                                    Next <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Academic Information */}
                        <div className={`form-step ${currentStep === 2 ? 'active' : 'inactive'}`}>
                            <div className="form-group">
                                <label htmlFor="studentType" className="label">Student Type</label>
                                <select
                                    id="studentType"
                                    name="studentType"
                                    className={`input ${errors.studentType ? 'error' : ''}`}
                                    value={values.studentType}
                                    onChange={handleStudentTypeChange}
                                    required
                                >
                                    <option value="junior">Junior Student</option>
                                    <option value="senior">Senior Student</option>
                                </select>
                                {errors.studentType && <div className="error-message">{errors.studentType}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="grade" className="label">Grade/Class</label>
                                <select
                                    id="grade"
                                    name="grade"
                                    className={`input ${errors.grade ? 'error' : ''}`}
                                    value={values.grade}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select your grade</option>
                                    {values.studentType === 'junior' ? (
                                        juniorGrades.map(grade => (
                                            <option key={grade.value} value={grade.value}>{grade.label}</option>
                                        ))
                                    ) : (
                                        seniorGrades.map(grade => (
                                            <option key={grade.value} value={grade.value}>{grade.label}</option>
                                        ))
                                    )}
                                </select>
                                {errors.grade && <div className="error-message">{errors.grade}</div>}
                            </div>

                            {values.studentType === 'senior' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="department" className="label">Department</label>
                                        <select
                                            id="department"
                                            name="department"
                                            className={`input ${errors.department ? 'error' : ''}`}
                                            value={values.department}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select your department</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                        {errors.department && <div className="error-message">{errors.department}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="role" className="label">Student Role (Optional)</label>
                                        <select
                                            id="role"
                                            name="role"
                                            className={`input ${errors.role ? 'error' : ''}`}
                                            value={values.role}
                                            onChange={handleChange}
                                        >
                                            {roles.map(role => (
                                                <option key={role.value} value={role.value}>{role.label}</option>
                                            ))}
                                        </select>
                                        {errors.role && <div className="error-message">{errors.role}</div>}
                                    </div>
                                </>
                            )}

                            <div className="form-navigation">
                                <button
                                    type="button"
                                    className="btn btn-prev"
                                    onClick={prevStep}
                                >
                                    <ArrowLeft size={16} /> Previous
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-student-gradient"
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

export default SignupStudent;