'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Key, UserPlus, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';

const STEPS = ['Role & Invite', 'Personal Info', 'Create Password'];

const ROLES = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'Access classes, exams, and results' },
  { value: 'teacher', label: 'Teacher', icon: '📚', desc: 'Manage lectures, exams, and grades' },
];

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: '',
    inviteCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [verified, setVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!form.role) newErrors.role = 'Please select a role';
      if (!form.inviteCode.trim()) newErrors.inviteCode = 'Invitation code is required';
    }
    if (s === 2) {
      if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!form.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    }
    if (s === 3) {
      if (!form.password) newErrors.password = 'Password is required';
      else if (form.password.length < 8) newErrors.password = 'Min. 8 characters';
      if (form.password !== form.passwordConfirmation) newErrors.passwordConfirmation = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < 3) setStep(step + 1);
      else handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        role: form.role,
        invite_code: form.inviteCode,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      });
      setVerified(true);
      toast.success('Account created! Check your email to verify.');
    } catch (err) {
      toast.error(err.data?.message || 'Registration failed.');
      if (err.status === 422) {
        const fieldMap = { invite_code: 'inviteCode', first_name: 'firstName', last_name: 'lastName', password_confirmation: 'passwordConfirmation' };
        const mapped = {};
        Object.entries(err.data?.errors || {}).forEach(([k, v]) => { mapped[fieldMap[k] || k] = v[0]; });
        setErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  const illustrationKeys = ['signup_welcome', 'signup_personal', 'signup_password'];
  const defaultIll = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23E5E4F0' width='400' height='300' rx='16'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%239B9BB4' font-size='16'%3EIllustration%3C/text%3E%3C/svg%3E";

  if (verified) {
    return (
      <>
        <div className="auth-left">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-bg-main to-success/5" />
          <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center animate-scale-in">
              <Check size={40} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Account Created!</h2>
            <p className="text-text-secondary text-center text-sm max-w-xs">
              Please check your email to verify your account before signing in.
            </p>
            <Button onClick={() => router.push('/login')} variant="primary">Go to Login</Button>
          </div>
        </div>
        <div className="auth-right" />
      </>
    );
  }

  return (
    <>
      {/* Left side - Illustration */}
      <div className="auth-left">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/10" />
        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold text-text-primary">vDeskconnect</span>
          </div>

          <IllustrationDisplay
            name={illustrationKeys[step - 1]}
            alt={`Step ${step} of signup`}
            className="max-w-md"
            fallback={defaultIll}
          />

          <p className="text-text-secondary text-center text-sm max-w-xs">
            {step === 1 && 'Enter your invitation code to get started'}
            {step === 2 && 'Tell us a bit about yourself'}
            {step === 3 && 'Create a strong password for your account'}
          </p>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Step {step} of 3 — {STEPS[step - 1]}</p>

          {/* Step Indicator */}
          <div className="step-indicator">
            {STEPS.map((_, i) => {
              const n = i + 1;
              const dotClass = n === step ? 'step-dot-active' : n < step ? 'step-dot-completed' : 'step-dot-inactive';
              return <div key={i} className={dotClass} />;
            })}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4" noValidate>
            {step === 1 && (
              <>
                <div>
                  <label className="form-label">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => { setForm((p) => ({ ...p, role: role.value })); if (errors.role) setErrors((p) => ({ ...p, role: '' })); }}
                        className={`p-4 rounded-btn border-2 text-left transition-all duration-250 hover:scale-[1.02] ${
                          form.role === role.value ? 'border-primary bg-primary/5 shadow-soft' : 'border-border bg-bg-main hover:border-primary-light'
                        }`}
                      >
                        <span className="text-2xl">{role.icon}</span>
                        <p className="font-semibold text-text-primary text-sm mt-1">{role.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{role.desc}</p>
                      </button>
                    ))}
                  </div>
                  {errors.role && <p className="form-error">{errors.role}</p>}
                </div>
                <Input
                  label="Invitation Code"
                  name="inviteCode"
                  placeholder="Enter your invite code"
                  value={form.inviteCode}
                  onChange={handleChange}
                  error={errors.inviteCode}
                  icon={<Key size={18} className="text-text-muted" />}
                />
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First name" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} error={errors.firstName} />
                  <Input label="Last name" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} error={errors.lastName} />
                </div>
                <Input label="Email address" name="email" type="email" placeholder="you@school.edu" value={form.email} onChange={handleChange} error={errors.email} icon={<Mail size={18} className="text-text-muted" />} />
              </>
            )}

            {step === 3 && (
              <>
                <Input label="Password" name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} error={errors.password} icon={<Lock size={18} className="text-text-muted" />} />
                <Input label="Confirm password" name="passwordConfirmation" type="password" placeholder="Re-enter your password" value={form.passwordConfirmation} onChange={handleChange} error={errors.passwordConfirmation} />
                {form.password && form.password.length >= 8 && (
                  <div className="flex items-center gap-2 text-xs text-success animate-fade-in">
                    <Check size={14} /><span>Password meets requirements</span>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={prevStep}><ArrowLeft size={16} /> Back</Button>
              )}
              <Button type="submit" variant="primary" fullWidth={step === 1} loading={loading}>
                {step < 3 ? (<><>Next</> <ArrowRight size={16} /></>) : (<><UserPlus size={18} /> Create Account</>)}
              </Button>
            </div>
          </form>

          <div className="auth-divider">or</div>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
