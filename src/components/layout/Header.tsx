
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { PanelLeft, Briefcase } from 'lucide-react'; 
import { BranchSelector } from '@/components/shared/BranchSelector';
import { Button } from '@/components/ui/button';
import type { Branch, UserProfile } from '@/lib/types';
import { useSidebar } from '@/components/ui/sidebar';

interface HeaderProps {
  onBranchChange?: (branch: Branch) => void;
  currentUser: UserProfile | null;
}

export const Header: FC<HeaderProps> = ({ onBranchChange, currentUser }) => {
  const { toggleSidebar, isMobile, state: sidebarState } = useSidebar();

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          {/* Show app title in header if sidebar is collapsed on desktop, or always on mobile */}
          { (isMobile || (!isMobile && sidebarState === 'collapsed')) && (
             <Link href="/dashboard" className="flex items-center gap-2 ml-1">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold tracking-tight text-primary">Crafton</span>
             </Link>
           )}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <BranchSelector onBranchChange={onBranchChange} />
          {/* User profile dropdown moved to sidebar footer */}
        </div>
      </div>
    </header>
  );
};
