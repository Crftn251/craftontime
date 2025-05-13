"use client";
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";
import type { Branch, UserProfile } from '@/lib/types';
import { MOCK_USERS } from '@/lib/types'; // For fetching user name based on ID

export default function AppLayout({ children }: { children: ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch | undefined>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const userId = localStorage.getItem('loggedInUserId');
      const userName = localStorage.getItem('loggedInUserName'); // Get stored user name

      if (isAuthenticated === 'true' && userId) {
        // Use stored name if available, otherwise try to find in MOCK_USERS
        // This is a simplified approach. In a real app, user details might be fetched or come from a context.
        const userDetails = userName ? { id: userId, name: userName, email: `${userName.toLowerCase().replace(' ','.')}@crafton.com` } : MOCK_USERS.find(u => u.id === userId);
        
        if (userDetails) {
          setCurrentUser(userDetails);
        } else {
          // If user details can't be confirmed, invalidate session
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('loggedInUserId');
          localStorage.removeItem('loggedInUserName');
          router.replace('/login');
          return; // Exit early before setting auth check complete
        }
      } else {
        router.replace('/login');
        return; // Exit early
      }
      setIsAuthCheckComplete(true);
    }
  }, [router]);

  const handleBranchChange = (branch: Branch) => {
    setCurrentBranch(branch);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedBranch', branch);
    }
  };

  if (!isAuthCheckComplete) {
    // Optional: Render a loading spinner or a blank page while auth check is in progress
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/50">
            <p>Loading application...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/50">
      <Header onBranchChange={handleBranchChange} currentUser={currentUser} />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
