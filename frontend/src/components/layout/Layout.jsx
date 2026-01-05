import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Layout component - Wraps all pages with Header and Footer
 * Provides consistent layout structure with min-height 100vh and flex layout
 */
export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Header />
      <main className="flex-1 pt-[70px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}

