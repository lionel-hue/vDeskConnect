'use client';

import { useState } from 'react';

export default function DashboardRootLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {children}
    </>
  );
}
