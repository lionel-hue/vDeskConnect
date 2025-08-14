// src/hooks/usePasswordToggle.js
import { useState } from 'react';

export function usePasswordToggle() {
    const [visible, setVisible] = useState(false);

    const toggleVisibility = () => {
        setVisible(!visible);
    };

    const inputType = visible ? 'text' : 'password';
    const icon = visible ? 'eye-off' : 'eye';

    return [inputType, icon, toggleVisibility];
}