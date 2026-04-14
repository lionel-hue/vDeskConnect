'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, School, Users, BookOpen, TrendingUp, Shield, Zap } from 'lucide-react';
import IllustrationDisplay from '@/components/ui/IllustrationDisplay';
import ThemeToggle from '@/components/ui/ThemeToggle';

const FEATURES = [
  {
    icon: School,
    title: 'School Management',
    description: 'Complete admin dashboard with customizable academic settings for any country.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Granular permissions from Super Admin to Students with secure hierarchy.',
  },
  {
    icon: BookOpen,
    title: 'Exam Engine',
    description: 'Create MCQ, Theory, and Mixed exams with AI-powered question generation.',
  },
  {
    icon: TrendingUp,
    title: 'Results & Reports',
    description: 'Auto-generated report cards with configurable grading scales.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with email verification and session management.',
  },
  {
    icon: Zap,
    title: 'AI Builder Suite',
    description: 'Generate schemes of work, lesson notes, and exams with smart tools.',
  },
];

export default function WelcomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [resolvedDark, setResolvedDark] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setResolvedDark(document.documentElement.classList.contains('dark'));
  }, []);

  return (
    <div className="relative min-h-screen bg-bg-main overflow-hidden transition-colors duration-300">
      {/* Background Image Layer (Glassmorphic) */}
      <div className="fixed inset-0 -z-10">
        <IllustrationDisplay
          name="welcome_hero_background"
          alt=""
          className="w-full h-full"
          mode="background"
          fallback={
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-bg-main to-primary-light/20" />
          }
        />
        {/* Color overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary-dark/20 to-bg-main/40" />
      </div>

      {/* Floating Theme Toggle - Bottom-right always, out of the way of nav */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle w-64 h-64 bg-primary/10 top-1/4 -left-32 animate-float" />
        <div className="particle w-96 h-96 bg-primary-light/10 -top-24 right-1/4 animate-float-delayed" />
        <div className="particle w-48 h-48 bg-primary/5 bottom-1/4 right-1/3 animate-float" />
        <div className="particle w-72 h-72 bg-primary-light/5 bottom-0 left-1/3 animate-float-delayed" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className={`px-6 lg:px-12 py-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
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
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium hidden sm:inline">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className={`space-y-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-primary text-xs font-semibold">Now accepting schools worldwide</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-text-primary leading-tight">
                  The Complete{' '}
                  <span className="gradient-text">School Management</span>{' '}
                  Platform
                </h1>
                <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
                  A modern, configurable SMS & LMS designed for schools across the globe.
                  From Nigeria to France, manage your entire institution from one beautiful dashboard.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="btn-primary btn-lg group">
                  Start Free Trial
                  <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link href="/login" className="btn-secondary btn-lg">
                  Sign In to Dashboard
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <Shield size={16} className="text-success" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <Zap size={16} className="text-warning" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className={`relative transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary-light/10 rounded-full blur-3xl" />

                {/* Main illustration with glassmorphic panel */}
                <div className={`
                  relative
                  backdrop-blur-xl
                  bg-white/10
                  border border-white/20
                  rounded-hero
                  shadow-elevated
                  p-8
                  animate-bounce-subtle
                  ${resolvedDark ? 'bg-gray-900/40 border-white/10' : 'bg-white/30 border-white/40'}
                `}>
                  <IllustrationDisplay
                    name="welcome_hero"
                    alt="vDeskconnect platform overview"
                    className="w-full"
                    fallback={
                      <div className={`aspect-[4/3] rounded-panel flex items-center justify-center ${
                        resolvedDark
                          ? 'bg-gradient-to-br from-primary/20 to-primary-light/10'
                          : 'bg-gradient-to-br from-primary/5 to-primary-light/10'
                      }`}>
                        <div className="text-center space-y-4">
                          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                            <School size={48} className="text-primary" />
                          </div>
                          <p className="text-text-secondary font-medium">Your School Management Hub</p>
                        </div>
                      </div>
                    }
                  />
                </div>

                {/* Floating stats cards - Glassmorphic */}
                <div className={`absolute -left-12 top-1/4 backdrop-blur-lg rounded-card shadow-soft p-4 animate-float card-hover-lift border ${
                  resolvedDark ? 'bg-gray-900/50 border-white/10' : 'bg-white/60 border-white/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Active Schools</p>
                      <p className="text-lg font-bold text-text-primary">500+</p>
                    </div>
                  </div>
                </div>

                <div className={`absolute -right-8 bottom-1/4 backdrop-blur-lg rounded-card shadow-soft p-4 animate-float-delayed card-hover-lift border ${
                  resolvedDark ? 'bg-gray-900/50 border-white/10' : 'bg-white/60 border-white/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <TrendingUp size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Satisfaction</p>
                      <p className="text-lg font-bold text-text-primary">98%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              Everything Your School Needs
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Powerful features designed to streamline every aspect of school administration,
              teaching, and student management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className={`bg-bg-card rounded-card shadow-soft p-6 transition-all duration-500 hover:shadow-elevated hover:-translate-y-1 group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${800 + index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                  resolvedDark ? 'bg-primary/20 group-hover:bg-primary/30' : 'bg-primary/10 group-hover:bg-primary/20'
                }`}>
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="relative bg-gradient-to-br from-primary to-primary-dark rounded-hero p-12 lg:p-16 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Transform Your School?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Join hundreds of schools already using vDeskconnect to streamline their operations.
                Start your free 14-day trial today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 rounded-btn transition-all duration-300 hover:shadow-lg hover:scale-105">
                  Start Free Trial
                </Link>
                <Link href="/login" className="bg-white/10 text-white hover:bg-white/20 font-semibold px-8 py-3 rounded-btn transition-all duration-300 border border-white/20">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7C6BC4" />
                  <path d="M2 17L12 22L22 17" stroke="#7C6BC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm text-text-secondary">© 2026 vDeskconnect. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">Privacy</a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">Terms</a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
