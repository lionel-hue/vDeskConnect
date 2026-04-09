'use client';
import { Check, X } from 'lucide-react';

export default function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 chars', valid: password.length >= 8 },
    { label: 'Contains a number', valid: /\d/.test(password) },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Special char (!@#$...)', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const validCount = checks.filter(c => c.valid).length;
  const progressPercent = (validCount / checks.length) * 100;
  
  let pColor = 'bg-error';
  if (validCount === checks.length) {
      pColor = 'bg-success';
  } else if (validCount >= 2) {
      pColor = 'bg-warning';
  }

  return (
    <div className="mt-3 animate-fade-in">
      <div className="h-1.5 w-full bg-text-muted/20 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full ${pColor} transition-all duration-500 ease-out`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs font-medium">
        {checks.map((check, idx) => (
          <div key={idx} className={`flex items-center gap-2 transition-colors duration-300 ${check.valid ? 'text-success' : 'text-text-muted'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${check.valid ? 'bg-success/20 scale-100' : 'bg-text-muted/10 scale-90'}`}>
              {check.valid ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
            </div>
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
