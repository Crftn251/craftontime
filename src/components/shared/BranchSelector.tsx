"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Branch } from '@/lib/types';
import { BRANCHES } from '@/lib/types';

interface BranchSelectorProps {
  defaultBranch?: Branch; // Can be used as a fallback if nothing in localStorage
  onBranchChange?: (branch: Branch) => void;
}

export const BranchSelector: FC<BranchSelectorProps> = ({ defaultBranch, onBranchChange }) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(() => {
    if (typeof window !== 'undefined') {
      const storedBranch = localStorage.getItem('selectedBranch') as Branch | null;
      if (storedBranch && BRANCHES.includes(storedBranch)) {
        return storedBranch;
      }
    }
    return defaultBranch || (BRANCHES.length > 0 ? BRANCHES[0] : undefined);
  });

  useEffect(() => {
    // Effect to handle initial onBranchChange call and localStorage updates
    // This ensures that the parent component is notified of the initial branch
    // and that localStorage reflects the state if it wasn't set initially.
    if (selectedBranch) {
      if (onBranchChange) {
        onBranchChange(selectedBranch);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedBranch', selectedBranch);
      }
    }
  }, [selectedBranch, onBranchChange]);


  // Listen for external changes to selectedBranch in localStorage (e.g., from login page)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'selectedBranch' && event.newValue && BRANCHES.includes(event.newValue as Branch)) {
        const newBranch = event.newValue as Branch;
        if (newBranch !== selectedBranch) { // Only update if it's different
            setSelectedBranch(newBranch);
             // onBranchChange is handled by the main useEffect for selectedBranch
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedBranch]);


  const handleLocalBranchChange = (value: string) => {
    const newBranch = value as Branch;
    setSelectedBranch(newBranch); // This will trigger the useEffect above
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="w-[150px] justify-between">
          {selectedBranch || "Select Branch"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px]">
        <DropdownMenuRadioGroup value={selectedBranch} onValueChange={handleLocalBranchChange}>
          {BRANCHES.map((branch) => (
            <DropdownMenuRadioItem key={branch} value={branch}>
              {branch}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
