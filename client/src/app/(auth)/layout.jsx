import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AuthLayout({ children }) {
  return (
    <main className="auth-page relative">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 bg-primary/5 rounded-full -top-32 -left-32 animate-float" />
        <div className="absolute w-96 h-96 bg-primary-light/5 rounded-full -bottom-48 -right-48 animate-float-delayed" />
        <div className="absolute w-48 h-48 bg-primary/5 rounded-full top-1/4 right-1/4 animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      {/* Theme Toggle - Bottom-right to avoid blocking content */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {children}
    </main>
  );
}
