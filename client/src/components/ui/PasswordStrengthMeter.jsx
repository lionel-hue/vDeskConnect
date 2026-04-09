'use client';

import { Check, X, Shield } from 'lucide-react';

const REQUIREMENTS = [
  { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character (!@#$...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function PasswordStrengthMeter({ password }) {
  const metCount = REQUIREMENTS.filter((r) => r.test(password)).length;
  const strength = password.length === 0 ? 0 : metCount / REQUIREMENTS.length;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: '', color: 'text-text-muted' };
    if (strength <= 0.2) return { label: 'Weak', color: 'text-error' };
    if (strength <= 0.4) return { label: 'Fair', color: 'text-warning' };
    if (strength <= 0.7) return { label: 'Good', color: 'text-info' };
    return { label: 'Strong', color: 'text-success' };
  };

  const getBarColor = () => {
    if (strength <= 0.2) return 'bg-error';
    if (strength <= 0.4) return 'bg-warning';
    if (strength <= 0.7) return 'bg-info';
    return 'bg-success';
  };

  const { label, color } = getStrengthLabel();

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Strength Bar */}
      <div className="flex items-center gap-3">
        <Shield size={16} className={color} />
        <div className="flex-1">
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor()}`}
              style={{ width: `${strength * 100}%` }}
            />
          </div>
        </div>
        <span className={`text-xs font-semibold ${color} min-w-[40px] text-right`}>
          {label}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-1 gap-1.5">
        {REQUIREMENTS.map((req, i) => {
          const isMet = req.test(password);
          const isPending = password.length > 0 && !isMet;
          return (
            <div
              key={req.key}
              className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                password.length === 0
                  ? 'opacity-40'
                  : isMet
                  ? 'opacity-100 text-success'
                  : 'opacity-80 text-text-muted'
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isMet ? 'bg-success/20 scale-110' : isPending ? 'bg-text-muted/10' : 'bg-transparent'
                }`}
              >
                {isMet ? (
                  <Check size={12} className="text-success animate-scale-in" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted/40" />
                )}
              </span>
              <span className={isMet ? 'font-medium' : ''}>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
