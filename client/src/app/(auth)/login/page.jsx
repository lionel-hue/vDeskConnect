'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await api.post('/auth/login', form);
      api.setToken(data.token);
      toast.success('Welcome back! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err) {
      toast.error(err.data?.message || 'Login failed. Please try again.');
      if (err.status === 422) setErrors(err.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Left side - Illustration */}
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
          <IllustrationDisplay
            name="login_hero"
            alt="Welcome to vDeskconnect"
            className="max-w-md"
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23E5E4F0' width='400' height='300' rx='16'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%239B9BB4' font-size='16'%3EIllustration%3C/text%3E%3C/svg%3E"
          />

          <p className="text-text-secondary text-center text-sm max-w-xs">
            Your complete school management solution — configurable, global, and always evolving.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@school.edu"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              icon={<Mail size={18} className="text-text-muted" />}
            />

            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              <LogIn size={18} />
              Sign In
            </Button>
          </form>

          <div className="auth-divider">or</div>

          <p className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link href="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
