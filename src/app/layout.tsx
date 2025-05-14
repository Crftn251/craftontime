
import type { Metadata } from 'next';
// Geist fonts are fine, but prompt asked for Inter in globals.css so ensuring consistency.
// For this case, I'll keep Geist as specified in original, but note the globals.css addition.
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Ensure Toaster is available globally if needed, or per-layout

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Crafton Zeiterfassung',
  description: 'Zeiterfassungsanwendung für Crafton Mitarbeiter',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning={true}><body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster /> {/* Global Toaster */}
      </body></html>
  );
}
