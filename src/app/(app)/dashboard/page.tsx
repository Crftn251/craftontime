
"use client"; 

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { TimeTracker } from '@/components/features/TimeTracker';
import { ManualEntryTile } from '@/components/features/ManualEntryTile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react'; 
import type { Branch, TimeEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

const useCurrentBranchAndUser = (): { branch: Branch | undefined; userId: string | null } => {
  const [branch, setBranch] = useState<Branch | undefined>();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast(); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranch = localStorage.getItem('selectedBranch') as Branch | null;
      const storedUserId = localStorage.getItem('loggedInUserId');

      if (storedBranch) {
        setBranch(storedBranch);
      } else {
        toast({ title: "Filialfehler", description: "Keine Filiale ausgewählt. Bitte erneut anmelden.", variant: "destructive" });
        router.push('/login');
      }

      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        toast({ title: "Benutzerfehler", description: "Benutzer nicht identifiziert. Bitte erneut anmelden.", variant: "destructive" });
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
  }, [router, toast]); 
  return { branch, userId };
};


const DashboardPage: NextPage = () => {
  const { branch: currentBranch, userId: currentUserId } = useCurrentBranchAndUser();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && currentUserId) {
      const storedEntriesKey = `timeEntries_${currentUserId}`;
      const storedEntries = localStorage.getItem(storedEntriesKey);
      if (storedEntries) {
        setTimeEntries(JSON.parse(storedEntries));
      } else {
        setTimeEntries([]); 
      }
    } else if (typeof window !== 'undefined' && !currentUserId) {
        setTimeEntries([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentUserId) {
      const storedEntriesKey = `timeEntries_${currentUserId}`;
      localStorage.setItem(storedEntriesKey, JSON.stringify(timeEntries));
    }
  }, [timeEntries, currentUserId]);

  const handleTimeEntryCreate = (newEntry: Partial<TimeEntry>) => {
    if (!currentUserId) {
      toast({ title: "Authentifizierungsfehler", description: "Benutzer nicht identifiziert. Bitte anmelden.", variant: "destructive" });
      router.push('/login');
      return;
    }
    if (!currentBranch) {
        toast({ title: "Filialfehler", description: "Keine Filiale ausgewählt. Bitte wählen Sie eine Filiale im Header aus.", variant: "destructive" });
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


  if (!currentUserId || !currentBranch) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-semibold">Benutzerdaten werden geladen...</h2>
        <p className="text-muted-foreground">
          Wenn diese Nachricht bestehen bleibt, versuchen Sie bitte, sich erneut anzumelden.
        </p>
        <Button onClick={() => router.push('/login')} variant="outline">
          Zum Login
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Zeiterfassung <span className="text-lg text-muted-foreground">({currentBranch})</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeTracker 
            currentBranch={currentBranch} 
            onTimeEntryCreate={handleTimeEntryCreate} 
            currentUserId={currentUserId} 
        />
        <ManualEntryTile currentBranch={currentBranch} onTimeEntryCreate={handleTimeEntryCreate} />
      </div>
    </div>
  );
};

export default DashboardPage;
