"use client";
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";
import type { Branch } from '@/lib/types';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch | undefined>();

  const handleBranchChange = (branch: Branch) => {
    setCurrentBranch(branch);
    // Potentially pass this down or use context if deeply needed
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/50">
      <Header onBranchChange={handleBranchChange} />
      <main className="flex-1 container py-8">
        {/* Pass currentBranch to children if they need it directly, or use context */}
        {children}
      </main>
      <Toaster />
    </div>
  );
}
