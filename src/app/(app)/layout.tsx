
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import type { Branch, UserProfile } from '@/lib/types';
import { MOCK_USERS } from '@/lib/types';
import { Toaster } from '@/components/ui/toaster';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userId = localStorage.getItem('loggedInUserId');

      if (!isAuthenticated || !userId) {
        router.replace('/login');
      } else {
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
          setCurrentUser(user);
        } else {
          // User ID from storage is invalid, clear auth and redirect
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('loggedInUserId');
          router.replace('/login');
        }
        setIsLoading(false);
      }
    }
  }, [router]);

  const handleBranchChange = (branch: Branch) => {
    console.log("Filiale gewechselt zu:", branch);
  };

  return (
      <div className="flex min-h-screen flex-col bg-muted/40">
        <Header 
            currentUser={currentUser}
            onBranchChange={handleBranchChange} 
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 lg:p-10 container mx-auto">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <p>Benutzersitzung wird geladen...</p>
            </div>
          ) : (
            children
          )}
        </main>
        <Toaster />
      </div>
  );
}
