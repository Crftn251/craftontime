
"use client"; 

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { TimeTracker } from '@/components/features/TimeTracker';
import { ManualEntryTile } from '@/components/features/ManualEntryTile';
import { ProfileOverviewTile } from '@/components/features/ProfileOverviewTile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Download, AlertTriangle } from 'lucide-react';
import type { Branch, TimeEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

const useCurrentBranchAndUser = (): { branch: Branch | undefined; userId: string | null } => {
  const [branch, setBranch] = useState<Branch | undefined>();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranch = localStorage.getItem('selectedBranch') as Branch | null;
      const storedUserId = localStorage.getItem('loggedInUserId');

      if (storedBranch) {
        setBranch(storedBranch);
      } else {
        // This case should ideally be handled by AppLayout redirecting to login if not set
        toast({ title: "Branch Error", description: "No branch selected. Please re-login.", variant: "destructive" });
        router.push('/login');
      }

      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        // This case should also be handled by AppLayout
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
  }, [router]);
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
      branch: currentBranch, // Ensure currentBranch is part of the entry
      ...newEntry,
    } as TimeEntry; 
    setTimeEntries(prevEntries => [...prevEntries, entryWithDetails]);
  };

  const handleExportData = () => {
    if (timeEntries.length === 0) {
      toast({ title: "No Data", description: "There are no time entries to export.", variant: "default" });
      return;
    }
    const header = "ID,User ID,Branch,Start Time,End Time,Duration (s),Manual,Reason,Notes\n";
    const csvRows = timeEntries.map(entry => 
      [
        entry.id,
        entry.userId,
        entry.branch,
        entry.startTime ? new Date(entry.startTime).toISOString() : '',
        entry.endTime ? new Date(entry.endTime).toISOString() : '',
        entry.duration || '',
        entry.manual ? 'Yes' : 'No',
        entry.reason || '',
        entry.notes || ''
      ].join(',')
    ).join('\n');
    
    const csvContent = header + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `time_entries_${currentUserId}_${currentBranch}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Export Successful", description: "Time entries exported as CSV." });
    } else {
      toast({ title: "Export Failed", description: "Your browser doesn't support direct CSV download.", variant: "destructive" });
    }
  };

  if (!currentUserId || !currentBranch) {
    // This state should ideally be brief as AppLayout handles redirection
    // or the hook itself redirects.
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
      <h1 className="text-3xl font-bold tracking-tight">Dashboard <span className="text-lg text-muted-foreground">({currentBranch})</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TimeTracker currentBranch={currentBranch} onTimeEntryCreate={handleTimeEntryCreate} />
        <ManualEntryTile currentBranch={currentBranch} onTimeEntryCreate={handleTimeEntryCreate} />
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              Employee Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Admins can add and manage employees. (Feature not yet implemented)
            </p>
            <Button className="w-full" variant="outline" disabled>Manage Employees</Button>
          </CardContent>
        </Card>

         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-6 h-6" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all time tracking data for analysis and payroll.
            </p>
            <Button className="w-full" variant="outline" onClick={handleExportData} disabled={timeEntries.length === 0}>
              Export All Data (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>

      <ProfileOverviewTile timeEntries={timeEntries} />
      
    </div>
  );
};

export default DashboardPage;
