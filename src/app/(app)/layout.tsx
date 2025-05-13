
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import type { Branch, UserProfile } from '@/lib/types';
import { MOCK_USERS } from '@/lib/types';
import { Toaster } from '@/components/ui/toaster';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userId = localStorage.getItem('loggedInUserId');

      if (!isAuthenticated) {
        router.replace('/login');
      } else if (userId) {
        const user = MOCK_USERS.find(u => u.id === userId);
        setCurrentUser(user || null);
        setIsLoading(false);
      } else {
        // Should not happen if authenticated, but as a fallback
        router.replace('/login');
      }
    }
  }, [router, pathname]);


  const handleBranchChange = (branch: Branch) => {
    // Logic for branch change if needed, e.g., re-fetch data specific to branch
    // For now, it's mostly handled by BranchSelector itself updating localStorage
    console.log("Branch changed to:", branch);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading user session...</p>
      </div>
    );
  }
  
  if (!currentUser && pathname !== '/login') {
     // This case should ideally be caught by the useEffect redirecting to /login
     // but it's a safeguard.
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting to login...</p>
        </div>
    );
  }


  return (
      <div className="flex min-h-screen flex-col bg-muted/40">
        <Header 
            currentUser={currentUser}
            onBranchChange={handleBranchChange} 
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 lg:p-10 container mx-auto">
          {children}
        </main>
        <Toaster />
      </div>
  );
}
