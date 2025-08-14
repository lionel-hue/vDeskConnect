export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

export const validateEmailOrPhone = (value) => {
    return emailRegex.test(value) || phoneRegex.test(value.replace(/\s/g, ''));
};

export const validateForm = (values, formType) => {
    const errors = {};

    if (!values.email) {
        errors.email = 'Email or phone is required';
    } else if (!validateEmailOrPhone(values.email)) {
        errors.email = 'Invalid email or phone format';
    }

    if (formType !== 'login') {
        if (!values.name) errors.name = 'Name is required';
        if (!values.age) errors.age = 'Age is required';
        if (values.age < 1 || values.age > 120) errors.age = 'Invalid age';
    }

    if (!values.password) {
        errors.password = 'Password is required';
    } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (formType !== 'login' && values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
};