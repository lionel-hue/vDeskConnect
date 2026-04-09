'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Check, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

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
      <div className="auth-page">
        <div className="auth-right w-full">
          <div className="auth-card text-center">
            <h1 className="auth-title text-error">Invalid Reset Link</h1>
            <p className="auth-subtitle">This password reset link is invalid or has expired.</p>
            <Link href="/forgot-password" className="auth-link">Request a new reset link</Link>
          </div>
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
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center animate-scale-in">
              <Check size={40} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Password Reset!</h2>
            <p className="text-text-secondary text-center text-sm max-w-xs">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        </div>
        <div className="auth-right" />
      </>
    );
  }

  return (
    <>
      <div className="auth-left">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/10" />
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <Link href="/login" className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors duration-200 text-sm mb-4">
            <ArrowLeft size={16} /> Back to login
          </Link>
          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">Create a strong password for your account</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input label="New password" name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} error={errors.password} icon={<Lock size={18} className="text-text-muted" />} />
            <Input label="Confirm new password" name="password_confirmation" type="password" placeholder="Re-enter your password" value={form.password_confirmation} onChange={handleChange} error={errors.password_confirmation} />
            <Button type="submit" variant="primary" fullWidth loading={loading}><Lock size={18} /> Reset Password</Button>
          </form>
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
