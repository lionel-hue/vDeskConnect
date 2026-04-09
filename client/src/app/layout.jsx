import './globals.css';
import { IllustrationProvider } from '@/contexts/IllustrationProvider';
import { ToastProvider } from '@/contexts/ToastProvider';

export const metadata = {
  title: 'vDeskconnect',
  description: 'School Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <IllustrationProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </IllustrationProvider>
      </body>
    </html>
  );
}
