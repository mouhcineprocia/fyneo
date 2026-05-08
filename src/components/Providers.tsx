'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LangProvider } from '../contexts/LangContext';
import Header from './Header';
import NavMenu from './NavMenu';
import Footer from './Footer';

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === '/' || pathname === '/login';

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <NavMenu />
      <main style={{ paddingTop: '90px', padding: '90px 16px 20px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>
        <AppShell>{children}</AppShell>
      </LangProvider>
    </ThemeProvider>
  );
}
