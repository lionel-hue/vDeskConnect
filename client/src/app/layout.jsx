import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'


export const metadata = {
  title: 'vDeskconnect',
  description: 'School Management System'
}


export default function RootLayout ({ children }) {
  return (
    <html lang='en'>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
