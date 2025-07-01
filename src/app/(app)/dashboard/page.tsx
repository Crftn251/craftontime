
"use client"; 

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { TimeTracker } from '@/components/features/TimeTracker';
import { ManualEntryTile } from '@/components/features/ManualEntryTile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Briefcase, Edit3, PlusCircle, Bell } from 'lucide-react'; 
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

  const [selectedActivity, setSelectedActivity] = useState<ActivityType | undefined>();
  const [customActivityDescription, setCustomActivityDescription] = useState<string>("");
  const [isCustomActivityDialogOpen, setIsCustomActivityDialogOpen] = useState<boolean>(false);
  const [tempCustomActivity, setTempCustomActivity] = useState<string>("");

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

  const handleActivitySelect = (activity: ActivityType) => {
    setSelectedActivity(activity);
    if (activity !== "Eigenes") {
      setCustomActivityDescription(""); // Clear custom if a predefined is selected
    }
    toast({ title: "Tätigkeit ausgewählt", description: `${activity} wurde als aktuelle Tätigkeit festgelegt.` });
  };

  const handleOpenCustomActivityDialog = () => {
    setSelectedActivity("Eigenes");
    setTempCustomActivity(customActivityDescription); // Load current custom desc into dialog
    setIsCustomActivityDialogOpen(true);
  };

  const handleSaveCustomActivity = () => {
    setCustomActivityDescription(tempCustomActivity);
    setIsCustomActivityDialogOpen(false);
    toast({ title: "Eigene Tätigkeit gespeichert", description: `"${tempCustomActivity}" wurde als Tätigkeit festgelegt.`});
  };


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
      activityType: selectedActivity,
      customActivityDescription: selectedActivity === "Eigenes" ? customActivityDescription : undefined,
      ...newEntry,
    } as TimeEntry; 
    setTimeEntries(prevEntries => [...prevEntries, entryWithDetails]);
    // Optionally reset activity after entry
    // setSelectedActivity(undefined);
    // setCustomActivityDescription("");
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

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Tätigkeit für nächsten Eintrag auswählen
          </CardTitle>
          <CardDescription>
            Wählen Sie eine Tätigkeit aus, die mit dem nächsten Zeiteintrag gespeichert wird.
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
      
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Erinnerungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bitte denkt daran, eure Pausenzeiten korrekt zu erfassen und nach Arbeitsende auszustempeln.
          </p>
        </CardContent>
      </Card>

      <Dialog open={isCustomActivityDialogOpen} onOpenChange={setIsCustomActivityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eigene Tätigkeit beschreiben</DialogTitle>
            <DialogDescription>
              Geben Sie eine kurze Beschreibung Ihrer aktuellen Tätigkeit ein.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-activity-desc" className="text-right col-span-1">
                Beschreibung
              </Label>
              <Textarea
                id="custom-activity-desc"
                value={tempCustomActivity}
                onChange={(e) => setTempCustomActivity(e.target.value)}
                className="col-span-3"
                placeholder="z.B. Vorbereitung Event X"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveCustomActivity}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DashboardPage;
