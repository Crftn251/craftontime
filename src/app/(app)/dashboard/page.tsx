"use client"; // This page uses hooks and state, so it's a Client Component

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { TimeTracker } from '@/components/features/TimeTracker';
import { ManualEntryTile } from '@/components/features/ManualEntryTile';
import { ProfileOverviewTile } from '@/components/features/ProfileOverviewTile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Download } from 'lucide-react';
import type { Branch, TimeEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

// Mock function to simulate fetching current branch, would come from context or user profile
const useCurrentBranch = (): Branch | undefined => {
  const [branch, setBranch] = useState<Branch | undefined>();
  useEffect(() => {
    const storedBranch = localStorage.getItem('selectedBranch') as Branch | null;
    if (storedBranch) {
      setBranch(storedBranch);
    } else {
      setBranch("SPZ"); // Default or first available
    }
    // Listen for storage changes to update if branch changes in header
    const handleStorageChange = () => {
      const newStoredBranch = localStorage.getItem('selectedBranch') as Branch | null;
      if (newStoredBranch) setBranch(newStoredBranch);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return branch;
};


const DashboardPage: NextPage = () => {
  const currentBranch = useCurrentBranch();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { toast } = useToast();

  // Load time entries from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEntries = localStorage.getItem('timeEntries');
      if (storedEntries) {
        setTimeEntries(JSON.parse(storedEntries));
      }
    }
  }, []);

  // Save time entries to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
    }
  }, [timeEntries]);

  const handleTimeEntryCreate = (newEntry: Partial<TimeEntry>) => {
    const entryWithId: TimeEntry = {
      id: crypto.randomUUID(),
      userId: "currentUser", // Placeholder
      ...newEntry,
    } as TimeEntry; // Cast needed because newEntry is partial
    setTimeEntries(prevEntries => [...prevEntries, entryWithId]);
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
      link.setAttribute("download", "time_entries.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Export Successful", description: "Time entries exported as CSV." });
    } else {
      toast({ title: "Export Failed", description: "Your browser doesn't support direct CSV download.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TimeTracker currentBranch={currentBranch} onTimeEntryCreate={handleTimeEntryCreate} />
        <ManualEntryTile currentBranch={currentBranch} onTimeEntryCreate={handleTimeEntryCreate} />
        
        {/* Placeholder for Employee Management */}
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

        {/* Placeholder for Data Export */}
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
