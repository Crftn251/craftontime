
"use client"; 

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { TimeTracker } from '@/components/features/TimeTracker';
import { ManualEntryTile } from '@/components/features/ManualEntryTile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Briefcase, Edit3, Loader2 } from 'lucide-react'; 
import type { Branch, TimeEntry, ActivityType } from '@/lib/types';
import { PREDEFINED_ACTIVITIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TimeSummaryCharts } from '@/components/features/TimeSummaryCharts';
import { timeEntryService } from '@/services/timeEntryService';

// This hook remains the same as it handles user session from localStorage
const useCurrentBranchAndUser = (): { branch: Branch | undefined; userId: string | null; isLoading: boolean } => {
  const [branch, setBranch] = useState<Branch | undefined>();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedBranch = localStorage.getItem('selectedBranch') as Branch | null;
    const storedUserId = localStorage.getItem('loggedInUserId');
    if (storedBranch && storedUserId) {
      setBranch(storedBranch);
      setUserId(storedUserId);
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  return { branch, userId, isLoading };
};


const DashboardPage: NextPage = () => {
  const { branch: currentBranch, userId: currentUserId, isLoading: isUserLoading } = useCurrentBranchAndUser();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [selectedActivity, setSelectedActivity] = useState<ActivityType | undefined>();
  const [customActivityDescription, setCustomActivityDescription] = useState<string>("");
  const [isCustomActivityDialogOpen, setIsCustomActivityDialogOpen] = useState<boolean>(false);
  const [tempCustomActivity, setTempCustomActivity] = useState<string>("");
  
  // Effect to fetch time entries from Firestore
  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUserId) return;
      setIsEntriesLoading(true);
      try {
        const entries = await timeEntryService.getTimeEntries(currentUserId);
        setTimeEntries(entries);
      } catch (error) {
        toast({
          title: "Fehler beim Laden der Zeiteinträge",
          description: "Ihre Einträge konnten nicht von der Datenbank geladen werden.",
          variant: "destructive",
        });
      } finally {
        setIsEntriesLoading(false);
      }
    };

    fetchEntries();
  }, [currentUserId, toast]);

  const handleActivitySelect = (activity: ActivityType) => {
    setSelectedActivity(activity);
    if (activity !== "Eigenes") setCustomActivityDescription("");
    toast({ title: "Tätigkeit ausgewählt", description: `${activity} wurde als aktuelle Tätigkeit festgelegt.` });
  };

  const handleOpenCustomActivityDialog = () => {
    setSelectedActivity("Eigenes");
    setTempCustomActivity(customActivityDescription);
    setIsCustomActivityDialogOpen(true);
  };

  const handleSaveCustomActivity = () => {
    setCustomActivityDescription(tempCustomActivity);
    setIsCustomActivityDialogOpen(false);
    toast({ title: "Eigene Tätigkeit gespeichert" });
  };

  const handleTimeEntryCreate = async (newEntry: Partial<TimeEntry>) => {
    if (!currentUserId || !currentBranch) {
      toast({ title: "Fehler", description: "Benutzer oder Filiale nicht gefunden.", variant: "destructive" });
      return;
    }

    const entryToSave: Omit<TimeEntry, 'id'> = {
      userId: currentUserId,
      branch: currentBranch,
      activityType: selectedActivity,
      customActivityDescription: selectedActivity === "Eigenes" ? customActivityDescription : undefined,
      ...newEntry,
      startTime: newEntry.startTime || Date.now(),
      manual: newEntry.manual || false,
    };

    try {
      const createdEntry = await timeEntryService.addTimeEntry(entryToSave);
      // Add the new entry to the top of the list for immediate UI feedback
      setTimeEntries(prev => [createdEntry, ...prev]);
      toast({ title: "Eintrag erstellt", description: "Ihr Zeiteintrag wurde gespeichert." });
    } catch (error) {
       toast({ title: "Fehler", description: "Eintrag konnte nicht gespeichert werden.", variant: "destructive" });
    }
  };

  const onTimeEntryUpdate = (updatedEntry: TimeEntry) => {
    setTimeEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
     toast({ title: "Eintrag aktualisiert", description: "Ihr Zeiteintrag wurde aktualisiert." });
  }

  // Loading state for user session
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <h2 className="text-2xl font-semibold">Benutzersitzung wird geladen...</h2>
      </div>
    );
  }

  // If user session fails
  if (!currentUserId || !currentBranch) {
    // The hook already redirects, but this is a fallback UI
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-semibold">Anmeldung erforderlich</h2>
        <Button onClick={() => router.push('/login')} variant="outline">Zum Login</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Zeiterfassung <span className="text-lg text-muted-foreground">({currentBranch})</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeTracker 
            onTimeEntryCreate={handleTimeEntryCreate} 
            onTimeEntryUpdate={onTimeEntryUpdate}
            currentUserId={currentUserId}
            currentBranch={currentBranch}
        />
        <ManualEntryTile 
            onTimeEntryCreate={handleTimeEntryCreate} 
            currentBranch={currentBranch} 
        />
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Tätigkeit für nächsten Eintrag auswählen
          </CardTitle>
          <CardDescription>
            Wählen Sie eine Tätigkeit, die mit dem nächsten Zeiteintrag gespeichert wird.
            {selectedActivity && (
              <span className="block mt-1 font-semibold">
                Aktuell ausgewählt: {selectedActivity}
                {selectedActivity === "Eigenes" && customActivityDescription && `: ${customActivityDescription}`}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {PREDEFINED_ACTIVITIES.map(activity => (
            <Button 
              key={activity} 
              variant={selectedActivity === activity ? "default" : "outline"}
              onClick={() => handleActivitySelect(activity)}
              className="w-full h-16 text-sm"
            >
              {activity}
            </Button>
          ))}
          <Button 
            variant={selectedActivity === "Eigenes" ? "default" : "outline"}
            onClick={handleOpenCustomActivityDialog}
            className="w-full h-16 text-sm"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Eigene Tätigkeit
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isCustomActivityDialogOpen} onOpenChange={setIsCustomActivityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eigene Tätigkeit beschreiben</DialogTitle>
            <DialogDescription>Geben Sie eine kurze Beschreibung Ihrer Tätigkeit ein.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="custom-activity-desc">Beschreibung</Label>
            <Textarea
              id="custom-activity-desc"
              value={tempCustomActivity}
              onChange={(e) => setTempCustomActivity(e.target.value)}
              placeholder="z.B. Vorbereitung Event X"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Abbrechen</Button></DialogClose>
            <Button type="button" onClick={handleSaveCustomActivity}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isEntriesLoading ? (
         <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
      ) : (
        <TimeSummaryCharts timeEntries={timeEntries} />
      )}

    </div>
  );
};

export default DashboardPage;
