import { useState } from 'react';
import { validateStep, validateForm } from '../../utils/validation';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';
import { ArrowLeft, ArrowRight, GraduationCap, Eye, EyeOff } from 'lucide-react';

function SignupStudent({ onBackClick, onSuccess, showMessage }) {
    const [values, setValues] = useState({
        name: '',
        age: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: '',
        studentType: 'junior',
        grade: '',
        department: '',
        role: '',
        dateOfBirth: '',
        stateOfOrigin: '',
        sex: '',
        previousAddress: '',
        currentAddress: '',
        bloodGroup: '',
        genotype: '',
        height: '',
        weight: '',
        disability: 'none',
        parentGuardianType: 'parent',
        parentGuardianPhone: '',
        parentGuardianEmail: '',
        parentGuardianAddress: '',
        parentGuardianAddressDifferent: false,
        invitationCode: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordType, IconPassword, togglePassword] = usePasswordToggle();
    const [confirmPasswordType, IconConfirmPassword, toggleConfirmPassword] = usePasswordToggle();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;

    const nigerianStates = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
        'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
        'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
        'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ];

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genotypes = ['AA', 'AS', 'AC', 'SS', 'SC', 'CC'];
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(values, 'student');
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);
            try {
                const studentData = {
                    name: values.name,
                    age: parseInt(values.age),
                    email: values.email,
                    telephone: values.telephone,
                    password: values.password,
                    studentType: values.studentType,
                    grade: values.grade,
                    department: values.studentType === 'senior' ? values.department : null,
                    role: values.studentType === 'senior' ? values.role || null : null,
                    dateOfBirth: values.dateOfBirth,
                    stateOfOrigin: values.stateOfOrigin,
                    sex: values.sex,
                    previousAddress: values.previousAddress || null,
                    currentAddress: values.currentAddress,
                    bloodGroup: values.bloodGroup,
                    genotype: values.genotype,
                    height: parseFloat(values.height),
                    weight: parseFloat(values.weight),
                    disability: values.disability === 'none' ? null : values.disability,
                    parentGuardianType: values.parentGuardianType,
                    parentGuardianPhone: values.parentGuardianPhone,
                    parentGuardianEmail: values.parentGuardianEmail || null,
                    parentGuardianAddress: values.parentGuardianAddressDifferent ? values.parentGuardianAddress : values.currentAddress,
                    invitationCode: values.invitationCode
                };

                const response = await fetch(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/auth/signup/student`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(studentData),
                });

                const data = await response.json();

                if (response.ok) {
                    onSuccess();
                } else {
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
        const stepErrors = validateStep(currentStep, values);
        if (Object.keys(stepErrors).length === 0) {
            setCurrentStep(Math.min(currentStep + 1, totalSteps));
            setErrors({});
        } else {
            setErrors(stepErrors);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrors({});
    };

    const handleStudentTypeChange = (e) => {
        const newStudentType = e.target.value;
        setValues(prev => ({
            ...prev,
            studentType: newStudentType,
            grade: '',
            department: '',
            role: ''
        }));
    };

    const StepIndicator = () => (
        <div className="step-indicator">
            {Array.from({ length: totalSteps }, (_, index) => (
                <div
                    key={index + 1}
                    className={`step-dot ${currentStep === index + 1 ? 'active' : ''} ${currentStep > index + 1 ? 'completed' : ''}`}
                />
            ))}
        </div>
    );

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
                    <StepIndicator />
                    <div className="step-progress">
                        Step {currentStep} of {totalSteps}
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
                                    min="5"
                                    max="25"
                                    required
                                />
                                {errors.age && <div className="error-message">{errors.age}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`input ${errors.email ? 'error' : ''}`}
                                    value={values.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    required
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="telephone" className="label">Telephone</label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    className={`input ${errors.telephone ? 'error' : ''}`}
                                    value={values.telephone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    required
                                />
                                {errors.telephone && <div className="error-message">{errors.telephone}</div>}
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
                                        {passwordType === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
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
                                        {confirmPasswordType === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <div className="error-message">{errors.confirmPassword}</div>
                                )}
                            </div>
                            <div className="form-navigation">
                                <div></div>
                                <button
                                    type="button"
                                    className="btn btn-nav btn-next"
                                    onClick={nextStep}
                                >
                                    Next <ArrowRight size={14} />
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
                                    className="btn btn-nav btn-prev"
                                    onClick={prevStep}
                                >
                                    <ArrowLeft size={14} /> Previous
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-nav btn-next"
                                    onClick={nextStep}
                                >
                                    Next <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Step 3: Personal Details */}
                        <div className={`form-step ${currentStep === 3 ? 'active' : 'inactive'}`}>
                            <div className="form-group">
                                <label htmlFor="dateOfBirth" className="label">Date of Birth</label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    className={`input ${errors.dateOfBirth ? 'error' : ''}`}
                                    value={values.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.dateOfBirth && <div className="error-message">{errors.dateOfBirth}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="sex" className="label">Sex</label>
                                <select
                                    id="sex"
                                    name="sex"
                                    className={`input ${errors.sex ? 'error' : ''}`}
                                    value={values.sex}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select your sex</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {errors.sex && <div className="error-message">{errors.sex}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="stateOfOrigin" className="label">State of Origin</label>
                                <select
                                    id="stateOfOrigin"
                                    name="stateOfOrigin"
                                    className={`input ${errors.stateOfOrigin ? 'error' : ''}`}
                                    value={values.stateOfOrigin}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select your state of origin</option>
                                    {nigerianStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                {errors.stateOfOrigin && <div className="error-message">{errors.stateOfOrigin}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="currentAddress" className="label">Current Address</label>
                                <textarea
                                    id="currentAddress"
                                    name="currentAddress"
                                    className={`input ${errors.currentAddress ? 'error' : ''}`}
                                    value={values.currentAddress}
                                    onChange={handleChange}
                                    placeholder="Enter your current address"
                                    rows="3"
                                    required
                                />
                                {errors.currentAddress && <div className="error-message">{errors.currentAddress}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="previousAddress" className="label">Previous Address (Optional)</label>
                                <textarea
                                    id="previousAddress"
                                    name="previousAddress"
                                    className={`input ${errors.previousAddress ? 'error' : ''}`}
                                    value={values.previousAddress}
                                    onChange={handleChange}
                                    placeholder="Enter your previous address"
                                    rows="3"
                                />
                                {errors.previousAddress && <div className="error-message">{errors.previousAddress}</div>}
                            </div>
                            <div className="form-navigation">
                                <button
                                    type="button"
                                    className="btn btn-nav btn-prev"
                                    onClick={prevStep}
                                >
                                    <ArrowLeft size={14} /> Previous
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-nav btn-next"
                                    onClick={nextStep}
                                >
                                    Next <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Step 4: Medical Information */}
                        <div className={`form-step ${currentStep === 4 ? 'active' : 'inactive'}`}>
                            <div className="form-group">
                                <label htmlFor="bloodGroup" className="label">Blood Group</label>
                                <select
                                    id="bloodGroup"
                                    name="bloodGroup"
                                    className={`input ${errors.bloodGroup ? 'error' : ''}`}
                                    value={values.bloodGroup}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select your blood group</option>
                                    {bloodGroups.map(group => (
                                        <option key={group} value={group}>{group}</option>
                                    ))}
                                </select>
                                {errors.bloodGroup && <div className="error-message">{errors.bloodGroup}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="genotype" className="label">Genotype</label>
                                <select
                                    id="genotype"
                                    name="genotype"
                                    className={`input ${errors.genotype ? 'error' : ''}`}
                                    value={values.genotype}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select your genotype</option>
                                    {genotypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                {errors.genotype && <div className="error-message">{errors.genotype}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="height" className="label">Height (cm)</label>
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    className={`input ${errors.height ? 'error' : ''}`}
                                    value={values.height}
                                    onChange={handleChange}
                                    placeholder="Enter your height in centimeters"
                                    min="50"
                                    max="250"
                                    required
                                />
                                {errors.height && <div className="error-message">{errors.height}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="weight" className="label">Weight (kg)</label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    className={`input ${errors.weight ? 'error' : ''}`}
                                    value={values.weight}
                                    onChange={handleChange}
                                    placeholder="Enter your weight in kilograms"
                                    min="10"
                                    max="200"
                                    step="0.1"
                                    required
                                />
                                {errors.weight && <div className="error-message">{errors.weight}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="disability" className="label">Disability Status</label>
                                <select
                                    id="disability"
                                    name="disability"
                                    className={`input ${errors.disability ? 'error' : ''}`}
                                    value={values.disability}
                                    onChange={handleChange}
                                >
                                    <option value="none">None</option>
                                    <option value="visual">Visual Impairment</option>
                                    <option value="hearing">Hearing Impairment</option>
                                    <option value="physical">Physical Disability</option>
                                    <option value="learning">Learning Disability</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.disability && <div className="error-message">{errors.disability}</div>}
                            </div>
                            <div className="form-navigation">
                                <button
                                    type="button"
                                    className="btn btn-nav btn-prev"
                                    onClick={prevStep}
                                >
                                    <ArrowLeft size={14} /> Previous
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-nav btn-next"
                                    onClick={nextStep}
                                >
                                    Next <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Step 5: Parent/Guardian Information */}
                        <div className={`form-step ${currentStep === 5 ? 'active' : 'inactive'}`}>
                            <div className="form-group">
                                <label htmlFor="parentGuardianType" className="label">Parent/Guardian</label>
                                <select
                                    id="parentGuardianType"
                                    name="parentGuardianType"
                                    className={`input ${errors.parentGuardianType ? 'error' : ''}`}
                                    value={values.parentGuardianType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="parent">Parent</option>
                                    <option value="guardian">Guardian</option>
                                </select>
                                {errors.parentGuardianType && <div className="error-message">{errors.parentGuardianType}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="parentGuardianPhone" className="label">
                                    {values.parentGuardianType === 'parent' ? 'Parent' : 'Guardian'} Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="parentGuardianPhone"
                                    name="parentGuardianPhone"
                                    className={`input ${errors.parentGuardianPhone ? 'error' : ''}`}
                                    value={values.parentGuardianPhone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                />
                                {errors.parentGuardianPhone && <div className="error-message">{errors.parentGuardianPhone}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="parentGuardianEmail" className="label">
                                    {values.parentGuardianType === 'parent' ? 'Parent' : 'Guardian'} Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    id="parentGuardianEmail"
                                    name="parentGuardianEmail"
                                    className={`input ${errors.parentGuardianEmail ? 'error' : ''}`}
                                    value={values.parentGuardianEmail}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                />
                                {errors.parentGuardianEmail && <div className="error-message">{errors.parentGuardianEmail}</div>}
                            </div>
                            <div className="form-group">
                                <div className="subject-option">
                                    <input
                                        type="checkbox"
                                        id="parentGuardianAddressDifferent"
                                        name="parentGuardianAddressDifferent"
                                        checked={values.parentGuardianAddressDifferent}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="parentGuardianAddressDifferent">
                                        {values.parentGuardianType === 'parent' ? 'Parent' : 'Guardian'} address is different from student's address
                                    </label>
                                </div>
                            </div>
                            {values.parentGuardianAddressDifferent && (
                                <div className="form-group">
                                    <label htmlFor="parentGuardianAddress" className="label">
                                        {values.parentGuardianType === 'parent' ? 'Parent' : 'Guardian'} Address
                                    </label>
                                    <textarea
                                        id="parentGuardianAddress"
                                        name="parentGuardianAddress"
                                        className={`input ${errors.parentGuardianAddress ? 'error' : ''}`}
                                        value={values.parentGuardianAddress}
                                        onChange={handleChange}
                                        placeholder="Enter address"
                                        rows="3"
                                        required
                                    />
                                    {errors.parentGuardianAddress && <div className="error-message">{errors.parentGuardianAddress}</div>}
                                </div>
                            )}
                            <div className="form-navigation">
                                <button
                                    type="button"
                                    className="btn btn-nav btn-prev"
                                    onClick={prevStep}
                                >
                                    <ArrowLeft size={14} /> Previous
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-nav btn-next"
                                    onClick={nextStep}
                                >
                                    Next <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Step 6: Invitation Code */}
                        <div className={`form-step ${currentStep === 6 ? 'active' : 'inactive'}`}>
                            <div className="form-group">
                                <label htmlFor="invitationCode" className="label">Invitation Code</label>
                                <input
                                    type="text"
                                    id="invitationCode"
                                    name="invitationCode"
                                    className={`input ${errors.invitationCode ? 'error' : ''}`}
                                    value={values.invitationCode}
                                    onChange={handleChange}
                                    placeholder="Enter the invitation code provided by your admin"
                                    required
                                />
                                {errors.invitationCode && <div className="error-message">{errors.invitationCode}</div>}
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                    This code is provided by your school administrator to verify your enrollment eligibility.
                                </div>
                            </div>
                            <div className="form-navigation">
                                <button
                                    type="button"
                                    className="btn btn-nav btn-prev"
                                    onClick={prevStep}
                                >
                                    <ArrowLeft size={14} /> Previous
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