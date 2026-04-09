'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import EmailCodeInput from '@/components/ui/EmailCodeInput';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Start countdown on mount
  useEffect(() => {
    setCountdown(60);
  }, []);

  const handleVerify = async (verificationCode) => {
    if (!email) {
      setError('Email is required. Please go back and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify', {
        email: email,
        code: verificationCode,
      });
      setVerified(true);
      toast.success('Email verified successfully!');

      // Redirect to signup after short delay
      setTimeout(() => {
        router.push(`/signup?verified=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      setError(err.data?.message || 'Invalid verification code. Please try again.');
      setCode('');
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;

    setResendLoading(true);
    setError('');

    try {
      await api.post('/auth/send-verification', { email });
      setCountdown(60);
      toast.success('New verification code sent!');
    } catch (err) {
      setError(err.data?.message || 'Failed to resend code.');
      toast.error('Resend failed');
    } finally {
      setResendLoading(false);
    }
  };

  // Success state
  if (verified) {
    return (
      <div className="auth-page items-center justify-center">
        <div className="auth-card max-w-md text-center animate-scale-in">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Email Verified!</h1>
          <p className="text-text-secondary mb-6">
            Your email has been successfully verified. Redirecting to complete your registration...
          </p>
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div className="bg-success h-full rounded-full animate-shimmer" style={{ width: '100%' }} />
          </div>
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
              name="email_verification"
              alt="Verify your email"
              className="max-w-md relative"
              fallback={
                <div className="max-w-md aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-hero flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
                      <MailCheck size={40} className="text-primary" />
                    </div>
                    <p className="text-text-secondary font-medium">Check your inbox</p>
                  </div>
                </div>
              }
            />
          </div>

          <p className="text-text-secondary text-center text-sm max-w-xs">
            We sent a verification code to your email. Enter it below to verify your account.
          </p>
        </div>
      </div>

      {/* Right side - Verification Form */}
      <div className="auth-right">
        <div className="auth-card">
          <button
            onClick={() => router.push('/signup')}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm">Back to signup</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <MailCheck size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Verify your email</h1>
            <p className="text-text-secondary text-sm">
              {email ? (
                <>We sent a 6-digit code to <strong className="text-text-primary">{email}</strong></>
              ) : (
                'Enter the 6-digit code we sent to your email'
              )}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-btn animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-error mt-0.5 flex-shrink-0" />
                <p className="text-error text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <EmailCodeInput
              length={6}
              onChange={setCode}
              onComplete={handleVerify}
            />

            {loading && (
              <div className="flex items-center justify-center gap-2 text-primary text-sm animate-fade-in">
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying your code...</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resendLoading}
              className="w-full text-sm text-text-muted hover:text-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0
                ? `Resend code in ${countdown}s`
                : resendLoading
                ? 'Sending...'
                : "Didn't receive a code? Resend"}
            </button>

            <div className="bg-info/10 border border-info/20 rounded-btn p-3">
              <p className="text-info text-xs">
                <strong>Tip:</strong> Check your spam folder if you don't see the email in your inbox.
              </p>
            </div>
          </div>

          <div className="auth-divider">or</div>

          <p className="text-center text-sm text-text-secondary">
            Wrong email?{' '}
            <Link href="/signup" className="auth-link group">
              <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">Go back</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="auth-page items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
