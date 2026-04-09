'use client';

import { useRef, useState, useEffect } from 'react';

export default function EmailCodeInput({ length = 6, onChange, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newValues = [...values];
    newValues[index] = val.slice(-1);
    setValues(newValues);
    onChange?.(newValues.join(''));

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newValues.join('');
    if (code.length === length && newValues.every((v) => v)) {
      onComplete?.(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newValues = Array(length).fill('');
    pasted.split('').forEach((char, i) => {
      newValues[i] = char;
    });
    setValues(newValues);
    onChange?.(newValues.join(''));

    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === length) {
      onComplete?.(pasted);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold rounded-btn border-2 border-border bg-bg-main text-text-primary outline-none transition-all duration-250 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:scale-105"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
