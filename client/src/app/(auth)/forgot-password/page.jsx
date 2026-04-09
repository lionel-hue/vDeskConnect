'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
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
            <div className="w-20 h-20 bg-info/20 rounded-full flex items-center justify-center animate-scale-in">
              <Send size={40} className="text-info" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Check your inbox</h2>
            <p className="text-text-secondary text-center text-sm max-w-xs">
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card text-center">
            <p className="text-text-secondary text-sm">
              Didn't receive the email?{' '}
              <button onClick={() => setSent(false)} className="auth-link">Try again</button>
            </p>
            <div className="mt-4">
              <Link href="/login" className="auth-link">← Back to login</Link>
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
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <Link href="/login" className="inline-flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors duration-200 text-sm mb-4">
            <ArrowLeft size={16} /> Back to login
          </Link>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">No worries. Enter your email and we'll send you a reset link.</p>

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
        </div>
      </div>
    </>
  );
}
