// Enhanced validation function for student signup form

export const validateForm = (values, type = 'student') => {
    const errors = {};

    // Basic Information Validation
    if (!values.name || values.name.trim().length < 2) {
        errors.name = 'Full name must be at least 2 characters long';
    }

    if (!values.age || values.age < 5 || values.age > 25) {
        errors.age = 'Age must be between 5 and 25 years';
    }

    if (!values.email || values.email.trim().length === 0) {
        errors.email = 'Email or phone number is required';
    } else {
        // Basic email or phone validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[0-9]{10,15}$/;

        if (!emailRegex.test(values.email) && !phoneRegex.test(values.email.replace(/\s/g, ''))) {
            errors.email = 'Please enter a valid email address or phone number';
        }
    }

    if (!values.password || values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }

    if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    // Academic Information Validation
    if (!values.studentType) {
        errors.studentType = 'Student type is required';
    }

    if (!values.grade) {
        errors.grade = 'Grade/Class is required';
    }

    if (values.studentType === 'senior' && !values.department) {
        errors.department = 'Department is required for senior students';
    }

    // Personal Details Validation
    if (values.dateOfBirth) {
        const birthDate = new Date(values.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 5 || age > 25) {
            errors.dateOfBirth = 'Date of birth must correspond to age between 5 and 25 years';
        }

        if (birthDate > today) {
            errors.dateOfBirth = 'Date of birth cannot be in the future';
        }
    } else if (values.dateOfBirth !== undefined) {
        errors.dateOfBirth = 'Date of birth is required';
    }

    if (values.sex !== undefined && !values.sex) {
        errors.sex = 'Sex is required';
    }

    if (values.stateOfOrigin !== undefined && !values.stateOfOrigin) {
        errors.stateOfOrigin = 'State of origin is required';
    }

    if (values.currentAddress !== undefined) {
        if (!values.currentAddress || values.currentAddress.trim().length < 10) {
            errors.currentAddress = 'Current address must be at least 10 characters long';
        }
    }

    if (values.previousAddress && values.previousAddress.trim().length > 0 && values.previousAddress.trim().length < 10) {
        errors.previousAddress = 'Previous address must be at least 10 characters long if provided';
    }

    // Medical Information Validation
    if (values.bloodGroup !== undefined && !values.bloodGroup) {
        errors.bloodGroup = 'Blood group is required';
    }

    if (values.genotype !== undefined && !values.genotype) {
        errors.genotype = 'Genotype is required';
    }

    if (values.height !== undefined) {
        if (!values.height || values.height < 50 || values.height > 250) {
            errors.height = 'Height must be between 50 and 250 cm';
        }
    }

    if (values.weight !== undefined) {
        if (!values.weight || values.weight < 10 || values.weight > 200) {
            errors.weight = 'Weight must be between 10 and 200 kg';
        }
    }

    // Parent/Guardian Information Validation
    if (values.parentGuardianPhone !== undefined) {
        if (!values.parentGuardianPhone) {
            errors.parentGuardianPhone = 'Parent/Guardian phone number is required';
        } else {
            const phoneRegex = /^[\+]?[0-9]{10,15}$/;
            if (!phoneRegex.test(values.parentGuardianPhone.replace(/\s/g, ''))) {
                errors.parentGuardianPhone = 'Please enter a valid phone number';
            }
        }
    }

    if (values.parentGuardianEmail && values.parentGuardianEmail.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values.parentGuardianEmail)) {
            errors.parentGuardianEmail = 'Please enter a valid email address';
        }
    }

    if (values.parentGuardianAddressDifferent && values.parentGuardianAddress !== undefined) {
        if (!values.parentGuardianAddress || values.parentGuardianAddress.trim().length < 10) {
            errors.parentGuardianAddress = 'Parent/Guardian address must be at least 10 characters long';
        }
    }

    // Invitation Code Validation (NEW)
    if (values.invitationCode !== undefined) {
        if (!values.invitationCode || values.invitationCode.trim().length === 0) {
            errors.invitationCode = 'Invitation code is required';
        } else if (values.invitationCode.trim().length < 6) {
            errors.invitationCode = 'Invitation code must be at least 6 characters long';
        }
    }

    return errors;
};

// Helper function to validate specific steps - CORRECTED VERSION
export const validateStep = (stepNumber, values) => {
    const errors = {};

    switch (stepNumber) {
        case 1:
            // Step 1: Basic Information
            if (!values.name || values.name.trim().length < 2) {
                errors.name = 'Full name must be at least 2 characters long';
            }
            if (!values.age || values.age < 5 || values.age > 25) {
                errors.age = 'Age must be between 5 and 25 years';
            }
            if (!values.email || values.email.trim().length === 0) {
                errors.email = 'Email or phone number is required';
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phoneRegex = /^[\+]?[0-9]{10,15}$/;
                if (!emailRegex.test(values.email) && !phoneRegex.test(values.email.replace(/\s/g, ''))) {
                    errors.email = 'Please enter a valid email address or phone number';
                }
            }
            if (!values.password || values.password.length < 6) {
                errors.password = 'Password must be at least 6 characters long';
            }
            if (values.password !== values.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
            break;

        case 2:
            // Step 2: Academic Information
            if (!values.studentType) {
                errors.studentType = 'Student type is required';
            }
            if (!values.grade) {
                errors.grade = 'Grade/Class is required';
            }
            if (values.studentType === 'senior' && !values.department) {
                errors.department = 'Department is required for senior students';
            }
            break;

        case 3:
            // Step 3: Personal Details
            if (!values.dateOfBirth) {
                errors.dateOfBirth = 'Date of birth is required';
            } else {
                const birthDate = new Date(values.dateOfBirth);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 5 || age > 25) {
                    errors.dateOfBirth = 'Date of birth must correspond to age between 5 and 25 years';
                }
                if (birthDate > today) {
                    errors.dateOfBirth = 'Date of birth cannot be in the future';
                }
            }
            if (!values.sex) {
                errors.sex = 'Sex is required';
            }
            if (!values.stateOfOrigin) {
                errors.stateOfOrigin = 'State of origin is required';
            }
            if (!values.currentAddress || values.currentAddress.trim().length < 10) {
                errors.currentAddress = 'Current address must be at least 10 characters long';
            }
            if (values.previousAddress && values.previousAddress.trim().length > 0 && values.previousAddress.trim().length < 10) {
                errors.previousAddress = 'Previous address must be at least 10 characters long if provided';
            }
            break;

        case 4:
            // Step 4: Medical Information
            if (!values.bloodGroup) {
                errors.bloodGroup = 'Blood group is required';
            }
            if (!values.genotype) {
                errors.genotype = 'Genotype is required';
            }
            if (!values.height || values.height < 50 || values.height > 250) {
                errors.height = 'Height must be between 50 and 250 cm';
            }
            if (!values.weight || values.weight < 10 || values.weight > 200) {
                errors.weight = 'Weight must be between 10 and 200 kg';
            }
            break;

        case 5:
            // Step 5: Parent/Guardian Information
            if (!values.parentGuardianPhone) {
                errors.parentGuardianPhone = 'Parent/Guardian phone number is required';
            } else {
                const phoneRegex = /^[\+]?[0-9]{10,15}$/;
                if (!phoneRegex.test(values.parentGuardianPhone.replace(/\s/g, ''))) {
                    errors.parentGuardianPhone = 'Please enter a valid phone number';
                }
            }
            if (values.parentGuardianEmail && values.parentGuardianEmail.trim().length > 0) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(values.parentGuardianEmail)) {
                    errors.parentGuardianEmail = 'Please enter a valid email address';
                }
            }
            if (values.parentGuardianAddressDifferent && (!values.parentGuardianAddress || values.parentGuardianAddress.trim().length < 10)) {
                errors.parentGuardianAddress = 'Parent/Guardian address must be at least 10 characters long';
            }
            break;

        case 6:
            // Step 6: Invitation Code
            if (!values.invitationCode || values.invitationCode.trim().length === 0) {
                errors.invitationCode = 'Invitation code is required';
            } else if (values.invitationCode.trim().length < 6) {
                errors.invitationCode = 'Invitation code must be at least 6 characters long';
            }
            break;

        default:
            return {};
    }

    return errors;
};

// Additional validation helpers
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 5 && age <= 25;
};

// NEW: Invitation code validation helper
export const validateInvitationCode = (code) => {
    if (!code || code.trim().length === 0) {
        return 'Invitation code is required';
    }
    if (code.trim().length < 6) {
        return 'Invitation code must be at least 6 characters long';
    }
    // Add more specific validation rules here if needed
    // For example: check format, check against a pattern, etc.
    return null; // No error
};

