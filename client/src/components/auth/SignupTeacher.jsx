import { useState } from 'react';
import { validateStep, validateForm } from '../../utils/validation';
import { usePasswordToggle } from '../../hooks/usePasswordToggle';
import { ArrowLeft, ArrowRight, BookOpen, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

function SignupTeacher({ onBackClick, onSuccess, showMessage }) {
// Enhanced form state with all new fields
const [values, setValues] = useState({
    // Step 1: Basic Information
    name: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',

    // Step 2: Personal Details
    dateOfBirth: '',
    stateOfOrigin: '',
    sex: '',
    maritalStatus: 'single',

    // Step 3: Address Information
    currentAddress: '',
    previousAddress: '',

    // Step 4: Medical Information
    bloodGroup: '',
    genotype: '',
    height: '',
    weight: '',
    disability: 'none',

    // Step 5: Professional Information
    qualification: '',
    // Modified: Separate subject tracking for JSS and SSS
    juniorSubjects: [],
    seniorSubjects: [],
    // English language disciplines
    englishDisciplines: {
        junior: [],
        senior: []
    },

    // Step 6: Invitation Code
    invitationCode: ''
});

const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [passwordType, IconPassword, togglePassword] = usePasswordToggle();
const [confirmPasswordType, IconConfirmPassword, toggleConfirmPassword] = usePasswordToggle();
const [currentStep, setCurrentStep] = useState(1);
const [showEnglishDisciplines, setShowEnglishDisciplines] = useState({
    junior: false,
    senior: false
});
const totalSteps = 6; // Updated for teacher form

// Nigerian States
const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Blood Groups
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Genotypes
const genotypes = ['AA', 'AS', 'AC', 'SS', 'SC', 'CC'];

// Marital Status Options
const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed'];

// English Language Disciplines
const englishDisciplines = [
    'Structure',
    'Comprehension',
    'Composition',
    'Register',
    'Phonetics'
];

// Subject lists (including English Language)
const juniorSubjects = [
    'English Language',
    'Mathematics',
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
    'English Language',
    'Mathematics',
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

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
        setValues(prev => ({
            ...prev,
            [name]: checked
        }));
    } else {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    }
};

const handleEnglishDisciplineChange = (discipline, level) => {
    setValues(prev => {
        const currentDisciplines = prev.englishDisciplines[level] || [];
        const isCurrentlySelected = currentDisciplines.includes(discipline);

        let updatedDisciplines;
        if (isCurrentlySelected) {
            updatedDisciplines = currentDisciplines.filter(d => d !== discipline);
        } else {
            updatedDisciplines = [...currentDisciplines, discipline];
        }

        return {
            ...prev,
            englishDisciplines: {
                ...prev.englishDisciplines,
                [level]: updatedDisciplines
            }
        };
    });
};

const toggleEnglishDisciplines = (level) => {
    setShowEnglishDisciplines(prev => ({
        ...prev,
        [level]: !prev[level]
    }));
};

const handleSubjectChange = (subject, level) => {
    const isJunior = level === 'junior';
    const currentLevelSubjects = isJunior ? values.juniorSubjects : values.seniorSubjects;

    // Check if subject is currently selected in this level
    const isCurrentlySelected = currentLevelSubjects.includes(subject);

    if (isCurrentlySelected) {
        // Remove subject
        const updatedCurrentLevel = currentLevelSubjects.filter(s => s !== subject);
        setValues(prev => ({
            ...prev,
            [isJunior ? 'juniorSubjects' : 'seniorSubjects']: updatedCurrentLevel
        }));

        // If it's English Language, clear the disciplines
        if (subject === 'English Language') {
            setValues(prev => ({
                ...prev,
                englishDisciplines: {
                    ...prev.englishDisciplines,
                    [level]: []
                }
            }));
        }
    } else {
        // Add subject
        const updatedCurrentLevel = [...currentLevelSubjects, subject];
        setValues(prev => ({
            ...prev,
            [isJunior ? 'juniorSubjects' : 'seniorSubjects']: updatedCurrentLevel
        }));
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();

    // Combine subjects for validation and submission
    const allSubjects = [
        ...new Set([
            ...values.juniorSubjects,
            ...values.seniorSubjects
        ])
    ];

    const formDataForValidation = {
        ...values,
        subjects: allSubjects
    };

    // Validate all fields before submission
    const validationErrors = validateForm(formDataForValidation, 'teacher');
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
        setIsSubmitting(true);

        try {
            const teacherData = {
                // Basic Information
                name: values.name,
                email: values.email,
                telephone: values.telephone,
                password: values.password,

                // Personal Details
                dateOfBirth: values.dateOfBirth,
                stateOfOrigin: values.stateOfOrigin,
                sex: values.sex,
                maritalStatus: values.maritalStatus,

                // Address Information
                previousAddress: values.previousAddress || null,
                currentAddress: values.currentAddress,

                // Medical Information
                bloodGroup: values.bloodGroup,
                genotype: values.genotype,
                height: parseFloat(values.height),
                weight: parseFloat(values.weight),
                disability: values.disability === 'none' ? null : values.disability,

                // Professional Information
                qualification: values.qualification,
                // Send detailed subject information
                subjects: allSubjects,
                juniorSubjects: values.juniorSubjects,
                seniorSubjects: values.seniorSubjects,
                englishDisciplines: values.englishDisciplines,

                // Invitation Code
                invitationCode: values.invitationCode
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
            console.error('Error signing up teacher:', error);
            showMessage('error', error.message || 'Signup failed');
        } finally {
            setIsSubmitting(false);
        }
    }
};

const nextStep = () => {
    // For step 5 (Professional Information), we need to validate subjects differently
    let formDataForValidation = { ...values };
    if (currentStep === 5) {
        // Combine subjects for validation
        const allSubjects = [
            ...new Set([
                ...values.juniorSubjects,
                ...values.seniorSubjects
            ])
        ];
        formDataForValidation.subjects = allSubjects;
    }

    // Validate current step before proceeding - specify teacher type
    const stepErrors = validateStep(currentStep, formDataForValidation, 'teacher');

    if (Object.keys(stepErrors).length === 0) {
        const newStep = Math.min(currentStep + 1, totalSteps);
        setCurrentStep(newStep);
        setErrors({}); // Clear any previous errors
    } else {
        setErrors(stepErrors);
    }
};

const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({}); // Clear errors when going back
};

// Step indicator component
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
                    <div className="role-icon teacher-icon">
                        <BookOpen size={20} />
                    </div>
                </div>
                <div className="header-content">
                    <h1 className="card-title">Create Teacher Account</h1>
                    <p className="card-description">Join as an educator on vDeskconnect</p>
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
                            <label htmlFor="email" className="label">Email Address</label>
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
                            <label htmlFor="telephone" className="label">Phone Number</label>
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

                    {/* Step 2: Personal Details */}
                    <div className={`form-step ${currentStep === 2 ? 'active' : 'inactive'}`}>
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
                            <label htmlFor="maritalStatus" className="label">Marital Status</label>
                            <select
                                id="maritalStatus"
                                name="maritalStatus"
                                className={`input ${errors.maritalStatus ? 'error' : ''}`}
                                value={values.maritalStatus}
                                onChange={handleChange}
                                required
                            >
                                {maritalStatusOptions.map(status => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.maritalStatus && <div className="error-message">{errors.maritalStatus}</div>}
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

                    {/* Step 3: Address Information */}
                    <div className={`form-step ${currentStep === 3 ? 'active' : 'inactive'}`}>
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
                                min="100"
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
                                min="30"
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

                    {/* Step 5: Professional Information */}
                    <div className={`form-step ${currentStep === 5 ? 'active' : 'inactive'}`}>
                        <div className="form-group">
                            <label htmlFor="qualification" className="label">Qualification</label>
                            <input
                                type="text"
                                id="qualification"
                                name="qualification"
                                className={`input ${errors.qualification ? 'error' : ''}`}
                                value={values.qualification}
                                onChange={handleChange}
                                placeholder="Enter your qualification (e.g., B.Ed, M.Ed, PhD)"
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
                                        <div key={`junior-${subject}`}>
                                            {subject === 'English Language' ? (
                                                <div className="english-language-option">
                                                    <div className="subject-option">
                                                        <input
                                                            type="checkbox"
                                                            id={`junior-english`}
                                                            checked={values.juniorSubjects.includes('English Language')}
                                                            onChange={() => handleSubjectChange('English Language', 'junior')}
                                                        />
                                                        <label htmlFor={`junior-english`}>English Language</label>
                                                        <button
                                                            type="button"
                                                            className="toggle-disciplines"
                                                            onClick={() => toggleEnglishDisciplines('junior')}
                                                        >
                                                            {showEnglishDisciplines.junior ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                    {showEnglishDisciplines.junior && values.juniorSubjects.includes('English Language') && (
                                                        <div className="english-disciplines">
                                                            {englishDisciplines.map(discipline => (
                                                                <div key={`junior-${discipline}`} className="discipline-option">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`junior-${discipline}`}
                                                                        checked={values.englishDisciplines.junior.includes(discipline)}
                                                                        onChange={() => handleEnglishDisciplineChange(discipline, 'junior')}
                                                                    />
                                                                    <label htmlFor={`junior-${discipline}`}>{discipline}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="subject-option">
                                                    <input
                                                        type="checkbox"
                                                        id={`junior-${subject}`}
                                                        checked={values.juniorSubjects.includes(subject)}
                                                        onChange={() => handleSubjectChange(subject, 'junior')}
                                                    />
                                                    <label htmlFor={`junior-${subject}`}>{subject}</label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <h4 className="subject-category">Senior Secondary Subjects</h4>
                                <div className="subject-options">
                                    {seniorSubjects.map(subject => (
                                        <div key={`senior-${subject}`}>
                                            {subject === 'English Language' ? (
                                                <div className="english-language-option">
                                                    <div className="subject-option">
                                                        <input
                                                            type="checkbox"
                                                            id={`senior-english`}
                                                            checked={values.seniorSubjects.includes('English Language')}
                                                            onChange={() => handleSubjectChange('English Language', 'senior')}
                                                        />
                                                        <label htmlFor={`senior-english`}>English Language</label>
                                                        <button
                                                            type="button"
                                                            className="toggle-disciplines"
                                                            onClick={() => toggleEnglishDisciplines('senior')}
                                                        >
                                                            {showEnglishDisciplines.senior ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                    {showEnglishDisciplines.senior && values.seniorSubjects.includes('English Language') && (
                                                        <div className="english-disciplines">
                                                            {englishDisciplines.map(discipline => (
                                                                <div key={`senior-${discipline}`} className="discipline-option">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`senior-${discipline}`}
                                                                        checked={values.englishDisciplines.senior.includes(discipline)}
                                                                        onChange={() => handleEnglishDisciplineChange(discipline, 'senior')}
                                                                    />
                                                                    <label htmlFor={`senior-${discipline}`}>{discipline}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="subject-option">
                                                    <input
                                                        type="checkbox"
                                                        id={`senior-${subject}`}
                                                        checked={values.seniorSubjects.includes(subject)}
                                                        onChange={() => handleSubjectChange(subject, 'senior')}
                                                    />
                                                    <label htmlFor={`senior-${subject}`}>{subject}</label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {errors.subjects && <div className="error-message">{errors.subjects}</div>}
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
                                This code is provided by your school administrator to verify your employment eligibility.
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