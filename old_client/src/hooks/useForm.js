// src/hooks/useForm.js
import { useState } from 'react';

export function useForm(initialValues) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value
        });
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        setErrors,
        setIsSubmitting
    };
}