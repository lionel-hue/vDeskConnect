'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Globe, MapPin, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';
import GoogleAuthButton from '@/components/ui/GoogleAuthButton';
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [banError, setBanError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setBanError('');
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

      // Check if user must change password on first login
      if (data.user?.must_change_password) {
        setShowChangePassword(true);
      } else {
        toast.success('Welcome back! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 800);
      }
    } catch (err) {
      // Check for ban error
      if (err.status === 403 && err.data?.banned) {
        setBanError(err.data.reason || 'Your account has been banned.');
        return;
      }
      if (err.status === 401) {
        toast.error('Invalid email or password.');
      } else {
        toast.error(err.data?.message || 'Login failed. Please try again.');
      }
      if (err.status === 422) setErrors(err.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        current_password: form.password,
        new_password: newPassword,
      });
      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleGoogleAuth = () => {
    setGoogleLoading(true);
    // TODO: Implement Google OAuth flow
    // window.location.href = `${API_BASE}/auth/google`;
    setTimeout(() => {
      setGoogleLoading(false);
      toast.info('Google authentication coming soon!');
    }, 1000);
  };

  // Forced password change modal
  if (showChangePassword) {
    return (
      <div className="auth-page items-center justify-center">
        <div className="auth-card max-w-md animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <Lock size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Change Your Password</h2>
            <p className="text-text-secondary text-sm mt-1">
              For security, you must change your password before continuing.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordStrengthMeter password={newPassword} />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" fullWidth loading={changingPassword}>
              <Lock size={18} />
              Change Password & Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Left side - Illustration */}
      <div className="auth-left">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/10" />
        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
          {/* Brand */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
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
              name="login_hero"
              alt="Welcome to vDeskconnect"
              className="max-w-md relative"
              fallback={
                <div className="max-w-md aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-hero flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
                      <LogIn size={40} className="text-primary" />
                    </div>
                    <p className="text-text-secondary font-medium">Welcome Back!</p>
                  </div>
                </div>
              }
            />
          </div>

          <p className="text-text-secondary text-center text-sm max-w-xs animate-slide-up">
            Your complete school management solution — configurable, global, and always evolving.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="auth-right">
        <div className="auth-card">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm">Back to home</span>
          </button>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          {/* Ban Error Display */}
          {banError && (
            <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-btn animate-fade-in">
              <p className="text-error text-sm font-medium">Account Banned</p>
              <p className="text-error/80 text-xs mt-1">{banError}</p>
              <p className="text-error/60 text-xs mt-2">Contact your school administrator for more information.</p>
            </div>
          )}

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
                <Link href="/forgot-password" className="auth-link group">
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">Forgot password?</span>
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              <LogIn size={18} />
              Sign In
            </Button>
          </form>

          {/* Divider with "or continue with" */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-bg-card text-text-muted">or continue with</span>
            </div>
          </div>

          {/* Google Auth Button */}
          <GoogleAuthButton onClick={handleGoogleAuth} loading={googleLoading} />

          <p className="text-center text-sm text-text-secondary mt-6">
            Register your school?{' '}
            <Link href="/signup" className="auth-link group">
              <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">Get started</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
