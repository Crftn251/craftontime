
"use client"; 

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { TimeTracker } from '@/components/features/TimeTracker';
import { ManualEntryTile } from '@/components/features/ManualEntryTile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react'; // Removed Users, Download
import type { Branch, TimeEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

const useCurrentBranchAndUser = (): { branch: Branch | undefined; userId: string | null } => {
  const [branch, setBranch] = useState<Branch | undefined>();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast(); // Moved toast from DashboardPage to here if it's only used here now

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranch = localStorage.getItem('selectedBranch') as Branch | null;
      const storedUserId = localStorage.getItem('loggedInUserId');

      if (storedBranch) {
        setBranch(storedBranch);
      } else {
        toast({ title: "Branch Error", description: "No branch selected. Please re-login.", variant: "destructive" });
        router.push('/login');
      }

      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        toast({ title: "User Error", description: "User not identified. Please re-login.", variant: "destructive" });
        router.push('/login');
      }

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'selectedBranch') {
          const newStoredBranch = event.newValue as Branch | null;
          if (newStoredBranch) setBranch(newStoredBranch);
        }
        if (event.key === 'loggedInUserId') {
           setUserId(event.newValue);
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [router, toast]); // Added toast to dependency array
  return { branch, userId };
};


const DashboardPage: NextPage = () => {
  const { branch: currentBranch, userId: currentUserId } = useCurrentBranchAndUser();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Load time entries from localStorage on mount, specific to the current user
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUserId) {
      const storedEntriesKey = `timeEntries_${currentUserId}`;
      const storedEntries = localStorage.getItem(storedEntriesKey);
      if (storedEntries) {
        setTimeEntries(JSON.parse(storedEntries));
      } else {
        setTimeEntries([]); // Ensure it's an empty array if nothing stored
      }
    } else if (typeof window !== 'undefined' && !currentUserId) {
        // If currentUserId becomes null (e.g. after logout from another tab), clear entries
        setTimeEntries([]);
    }
  }, [currentUserId]);

  // Save time entries to localStorage whenever they change, specific to the current user
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUserId) {
      const storedEntriesKey = `timeEntries_${currentUserId}`;
      localStorage.setItem(storedEntriesKey, JSON.stringify(timeEntries));
    }
  }, [timeEntries, currentUserId]);

  const handleTimeEntryCreate = (newEntry: Partial<TimeEntry>) => {
    if (!currentUserId) {
      toast({ title: "Authentication Error", description: "User not identified. Please log in.", variant: "destructive" });
      router.push('/login');
      return;
    }
    if (!currentBranch) {
        toast({ title: "Branch Error", description: "No branch selected. Please select a branch in the header.", variant: "destructive" });
        return;
    }

    const entryWithDetails: TimeEntry = {
      id: crypto.randomUUID(),
      userId: currentUserId,
      branch: currentBranch, 
      ...newEntry,
    } as TimeEntry; 
    setTimeEntries(prevEntries => [...prevEntries, entryWithDetails]);
  };

  // handleExportData function removed as the export tile is removed from this page.

  if (!currentUserId || !currentBranch) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-semibold">Loading User Data...</h2>
        <p className="text-muted-foreground">
          If this message persists, please try logging in again.
        </p>
        <Button onClick={() => router.push('/login')} variant="outline">
          Go to Login
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Time Tracking <span className="text-lg text-muted-foreground">({currentBranch})</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeTracker currentBranch={currentBranch} onTimeEntryCreate={handleTimeEntryCreate} />
        <ManualEntryTile currentBranch={currentBranch} onTimeEntryCreate={handleTimeEntryCreate} />
        
        {/* Employee Management Card Removed */}
        {/* Data Export Card Removed */}
      </div>

      {/* ProfileOverviewTile Removed */}
      
    </div>
  );
};

export default DashboardPage;
