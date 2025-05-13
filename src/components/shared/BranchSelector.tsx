"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
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
  defaultBranch?: Branch;
  onBranchChange?: (branch: Branch) => void;
}

export const BranchSelector: FC<BranchSelectorProps> = ({ defaultBranch, onBranchChange }) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(defaultBranch);

  useEffect(() => {
    const storedBranch = localStorage.getItem('selectedBranch') as Branch | null;
    if (storedBranch && BRANCHES.includes(storedBranch)) {
      setSelectedBranch(storedBranch);
      if (onBranchChange) onBranchChange(storedBranch);
    } else if (defaultBranch) {
      setSelectedBranch(defaultBranch);
    } else if (BRANCHES.length > 0) {
      setSelectedBranch(BRANCHES[0]); // Default to the first branch if nothing else is set
       if (onBranchChange) onBranchChange(BRANCHES[0]);
    }
  }, [defaultBranch, onBranchChange]);

  const handleBranchChange = (value: string) => {
    const newBranch = value as Branch;
    setSelectedBranch(newBranch);
    localStorage.setItem('selectedBranch', newBranch);
    if (onBranchChange) {
      onBranchChange(newBranch);
    }
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
        <DropdownMenuRadioGroup value={selectedBranch} onValueChange={handleBranchChange}>
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
