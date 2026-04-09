'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Check, ArrowLeft, AlertCircle, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Min. 8 characters';
    if (form.password !== form.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token, email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to reset password');
      if (err.status === 422) setErrors(err.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-page items-center justify-center">
        <div className="auth-card max-w-md text-center animate-scale-in">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-error" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Invalid Reset Link</h1>
          <p className="text-text-secondary text-sm mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn bg-primary text-white hover:bg-primary-dark transition-all duration-300 text-sm font-semibold">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <>
        <div className="auth-left">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-bg-main to-success/5" />
          <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
            {/* Brand */}
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

            <div className="relative">
              <div className="absolute -inset-4 bg-success/5 rounded-hero blur-2xl" />
              <IllustrationDisplay
                name="password_reset_success"
                alt="Password reset successful"
                className="max-w-md relative"
                fallback={
                  <div className="max-w-md aspect-[4/3] bg-gradient-to-br from-success/10 to-success/5 rounded-hero flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
                        <Check size={40} className="text-success" />
                      </div>
                      <p className="text-text-secondary font-medium">Password updated!</p>
                    </div>
                  </div>
                }
              />
            </div>

            <p className="text-text-secondary text-center text-sm max-w-xs">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card text-center animate-scale-in">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="48" height="48" viewBox="0 0 52 52" className="stroke-success">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" strokeWidth="2" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" strokeWidth="2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Password Reset!</h2>
            <p className="text-text-secondary text-sm mb-6">
              Your password has been reset successfully. Redirecting to login...
            </p>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div className="bg-success h-full rounded-full animate-shimmer" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="auth-left">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/10" />
        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
          {/* Brand */}
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

          {/* Illustration */}
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-hero blur-2xl" />
            <IllustrationDisplay
              name="set_new_password"
              alt="Set new password"
              className="max-w-md relative"
              fallback={
                <div className="max-w-md aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-hero flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
                      <Shield size={40} className="text-primary" />
                    </div>
                    <p className="text-text-secondary font-medium">Create a strong password</p>
                  </div>
                </div>
              }
            />
          </div>

          <p className="text-text-secondary text-center text-sm max-w-xs">
            Create a strong password to keep your account secure. Use a mix of letters, numbers, and symbols.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm">Back to login</span>
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <Lock size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Set new password</h1>
            <p className="text-text-secondary text-sm">
              Create a strong password for <strong className="text-text-primary">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="New password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock size={18} className="text-text-muted" />}
            />
            <PasswordStrengthMeter password={form.password} />
            <Input
              label="Confirm new password"
              name="password_confirmation"
              type="password"
              placeholder="Re-enter your password"
              value={form.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation}
            />
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              <Shield size={18} /> Reset Password
            </Button>
          </form>

          <div className="bg-primary/5 border border-primary/10 rounded-btn p-3 mt-4">
            <p className="text-text-secondary text-xs">
              <strong>Tip:</strong> Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-page items-center justify-center"><div className="spinner" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
