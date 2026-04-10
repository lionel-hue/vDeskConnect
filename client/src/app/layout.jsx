import './globals.css';
import { IllustrationProvider } from '@/contexts/IllustrationProvider';
import { ToastProvider } from '@/contexts/ToastProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';

export const metadata = {
  title: 'vDeskconnect',
  description: 'School Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased transition-colors duration-300">
        <ThemeProvider>
          <IllustrationProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </IllustrationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
