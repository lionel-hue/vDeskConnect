'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Building2, MapPin, Globe, DollarSign, Clock, Check, ArrowRight, ArrowLeft, School } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';

const STEPS = ['School Info', 'Admin Details', 'Set Password'];

const COUNTRIES = [
  { value: 'NG', label: 'Nigeria' },
  { value: 'BJ', label: 'Benin' },
  { value: 'FR', label: 'France' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'GH', label: 'Ghana' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
];

const TIMEZONES = [
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
  { value: 'Africa/Porto-Novo', label: 'Africa/Porto-Novo (WAT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)' },
];

const CURRENCIES = [
  { value: 'NGN', label: '₦ NGN - Nigerian Naira' },
  { value: 'XOF', label: 'CFA XOF - West African CFA' },
  { value: 'EUR', label: '€ EUR - Euro' },
  { value: 'USD', label: '$ USD - US Dollar' },
  { value: 'GBP', label: '£ GBP - British Pound' },
  { value: 'KES', label: 'KSh KES - Kenyan Shilling' },
  { value: 'ZAR', label: 'R ZAR - South African Rand' },
];

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    schoolName: '',
    country: 'NG',
    timezone: 'Africa/Lagos',
    currency: 'NGN',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStep = (s) => {
    const newErrors = {};

    if (s === 1) {
      if (!form.schoolName.trim()) newErrors.schoolName = 'School name is required';
    }
    if (s === 2) {
      if (!form.adminFirstName.trim()) newErrors.adminFirstName = 'First name is required';
      if (!form.adminLastName.trim()) newErrors.adminLastName = 'Last name is required';
      if (!form.adminEmail.trim()) newErrors.adminEmail = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) newErrors.adminEmail = 'Invalid email address';
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
      await api.post('/auth/register-admin', {
        school_name: form.schoolName,
        country: form.country,
        timezone: form.timezone,
        currency: form.currency,
        admin_first_name: form.adminFirstName,
        admin_last_name: form.adminLastName,
        admin_email: form.adminEmail,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      });
      setRegistered(true);
      toast.success('School registered! Your 14-day free trial has started.');
    } catch (err) {
      toast.error(err.data?.message || 'Registration failed.');
      if (err.status === 422) {
        const fieldMap = { admin_email: 'adminEmail', admin_first_name: 'adminFirstName', admin_last_name: 'adminLastName', password_confirmation: 'passwordConfirmation', school_name: 'schoolName' };
        const mapped = {};
        Object.entries(err.data?.errors || {}).forEach(([k, v]) => { mapped[fieldMap[k] || k] = v[0]; });
        setErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  const illustrationKeys = ['signup_school', 'signup_admin', 'signup_password'];
  const defaultIll = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23E5E4F0' width='400' height='300' rx='16'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%239B9BB4' font-size='16'%3EIllustration%3C/text%3E%3C/svg%3E";

  // Success state after registration
  if (registered) {
    return (
      <>
        <div className="auth-left">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-bg-main to-success/5" />
          <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center animate-scale-in">
              <Check size={40} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">School Registered!</h2>
            <div className="bg-success/10 border border-success/20 rounded-panel p-4 text-center max-w-sm">
              <p className="text-success text-sm font-semibold">14-Day Free Trial Started</p>
              <p className="text-success/80 text-xs mt-1">You now have full access to vDeskconnect.</p>
            </div>
            <p className="text-text-secondary text-center text-sm max-w-xs">
              Sign in with your admin credentials to start configuring your school and explore subscription plans.
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
            alt={`Step ${step} of school registration`}
            className="max-w-md"
            fallback={defaultIll}
          />

          <p className="text-text-secondary text-center text-sm max-w-xs">
            {step === 1 && 'Tell us about your school'}
            {step === 2 && 'Admin account details'}
            {step === 3 && 'Set a secure password'}
          </p>

          {/* Trial badge */}
          {step === 1 && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-btn px-4 py-2">
              <Clock size={16} className="text-primary" />
              <span className="text-primary text-xs font-semibold">14-Day Free Trial included</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Register your school</h1>
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
            {/* Step 1: School Info */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-2 mb-2 text-primary/80">
                  <School size={16} />
                  <span className="text-xs font-medium">School Information</span>
                </div>
                <Input
                  label="School name"
                  name="schoolName"
                  placeholder="e.g., Greenfield Academy"
                  value={form.schoolName}
                  onChange={handleChange}
                  error={errors.schoolName}
                  icon={<Building2 size={18} className="text-text-muted" />}
                />
                <div>
                  <label className="form-label">Country</label>
                  <div className="relative">
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="form-input appearance-none pr-10"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Timezone</label>
                  <div className="relative">
                    <select
                      name="timezone"
                      value={form.timezone}
                      onChange={handleChange}
                      className="form-input appearance-none pr-10"
                    >
                      {TIMEZONES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Currency</label>
                  <div className="relative">
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="form-input appearance-none pr-10"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <DollarSign size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Admin Details */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-2 mb-2 text-primary/80">
                  <Globe size={16} />
                  <span className="text-xs font-medium">School Administrator (Director)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First name" name="adminFirstName" placeholder="John" value={form.adminFirstName} onChange={handleChange} error={errors.adminFirstName} />
                  <Input label="Last name" name="adminLastName" placeholder="Doe" value={form.adminLastName} onChange={handleChange} error={errors.adminLastName} />
                </div>
                <Input
                  label="Admin email"
                  name="adminEmail"
                  type="email"
                  placeholder="admin@school.edu"
                  value={form.adminEmail}
                  onChange={handleChange}
                  error={errors.adminEmail}
                  icon={<Mail size={18} className="text-text-muted" />}
                />
                <div className="bg-info/10 border border-info/20 rounded-btn p-3">
                  <p className="text-info text-xs">
                    <strong>Note:</strong> As the School Admin, you'll be able to create Principal, Admin Staff, Teachers, and Students from inside the app.
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <>
                <div className="flex items-center gap-2 mb-2 text-primary/80">
                  <Lock size={16} />
                  <span className="text-xs font-medium">Secure your account</span>
                </div>
                <Input label="Password" name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} error={errors.password} icon={<Lock size={18} className="text-text-muted" />} />
                <Input label="Confirm password" name="passwordConfirmation" type="password" placeholder="Re-enter your password" value={form.passwordConfirmation} onChange={handleChange} error={errors.passwordConfirmation} />
                {form.password && form.password.length >= 8 && (
                  <div className="flex items-center gap-2 text-xs text-success animate-fade-in">
                    <Check size={14} /><span>Password meets requirements</span>
                  </div>
                )}
                <div className="bg-primary/5 border border-primary/10 rounded-btn p-3">
                  <p className="text-text-secondary text-xs">
                    You'll receive a <strong>14-day free trial</strong> with full access. After signup, you can explore our subscription plans.
                  </p>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={prevStep}><ArrowLeft size={16} /> Back</Button>
              )}
              <Button type="submit" variant="primary" fullWidth={step === 1} loading={loading}>
                {step < 3 ? (<>Next <ArrowRight size={16} /></>) : (<>Register School</>)}
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
