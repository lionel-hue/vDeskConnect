'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Send, MailCheck, AlertCircle, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email address'); return; }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to send reset link');
      setError(err.data?.errors?.email?.[0] || '');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <div className="auth-left">
          <div className="absolute inset-0 bg-gradient-to-br from-info/10 via-bg-main to-info/5" />
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

            <div className="relative">
              <div className="absolute -inset-4 bg-info/5 rounded-hero blur-2xl" />
              <IllustrationDisplay
                name="password_reset_sent"
                alt="Check your inbox"
                className="max-w-md relative"
                fallback={
                  <div className="max-w-md aspect-[4/3] bg-gradient-to-br from-info/10 to-info/5 rounded-hero flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <div className="w-20 h-20 bg-info/20 rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
                        <MailCheck size={40} className="text-info" />
                      </div>
                      <p className="text-text-secondary font-medium">Check your inbox</p>
                    </div>
                  </div>
                }
              />
            </div>

            <p className="text-text-secondary text-center text-sm max-w-xs">
              We've sent a password reset link to your email. Click it to set a new password.
            </p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card text-center animate-scale-in">
            <div className="w-16 h-16 bg-info/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
              <Send size={32} className="text-info" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Check your inbox</h2>
            <p className="text-text-secondary text-sm mb-6">
              We've sent a password reset link to <strong className="text-text-primary">{email}</strong>.
            </p>

            <div className="bg-info/10 border border-info/20 rounded-btn p-4 mb-6">
              <p className="text-info text-xs">
                <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setSent(false)}
                className="w-full text-sm text-text-muted hover:text-primary transition-colors duration-200"
              >
                Didn't receive the email? Try again
              </button>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-btn bg-primary text-white hover:bg-primary-dark transition-all duration-300 text-sm font-semibold"
              >
                <ArrowLeft size={16} /> Back to login
              </Link>
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
              name="forgot_password"
              alt="Forgot password"
              className="max-w-md relative"
              fallback={
                <div className="max-w-md aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-hero flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
                      <Lock size={40} className="text-primary" />
                    </div>
                    <p className="text-text-secondary font-medium">Reset your password</p>
                  </div>
                </div>
              }
            />
          </div>

          <p className="text-text-secondary text-center text-sm max-w-xs">
            Forgot your password? No worries — enter your email and we'll send you a reset link.
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
            <h1 className="text-2xl font-bold text-text-primary mb-2">Forgot password?</h1>
            <p className="text-text-secondary text-sm">
              No worries. Enter your email and we'll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-btn animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-error mt-0.5 flex-shrink-0" />
                <p className="text-error text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              error={error}
              icon={<Mail size={18} className="text-text-muted" />}
            />
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              <Send size={18} /> Send Reset Link
            </Button>
          </form>

          <div className="auth-divider">or</div>

          <p className="text-center text-sm text-text-secondary">
            Remember your password?{' '}
            <Link href="/login" className="auth-link group">
              <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">Sign in</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
