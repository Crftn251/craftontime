
'use client';

import type { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCircle, Download, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserProfile, TimeEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProfileOverviewTile } from '@/components/features/ProfileOverviewTile';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { timeEntryService } from '@/services/timeEntryService';
import { userService } from '@/services/userService';

const ProfilePage: NextPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfileData = async () => {
      if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('loggedInUserId');
        if (!userId) {
          setIsLoading(false);
          return;
        }

        try {
          const userPromise = userService.getUsers().then(users => users.find(u => u.id === userId));
          const entriesPromise = timeEntryService.getTimeEntries(userId);

          const [foundUser, fetchedEntries] = await Promise.all([userPromise, entriesPromise]);

          setUser(foundUser || null);
          setTimeEntries(fetchedEntries);

        } catch (error) {
          toast({
            title: "Fehler beim Laden des Profils",
            description: "Ihre Profildaten konnten nicht geladen werden.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfileData();
  }, [toast]);

  const formatDurationFromSeconds = (totalSeconds: number | undefined): string => {
    if (totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) return '';
    let stringField = String(field);
    if (stringField.search(/("|,|
)/g) >= 0) { // Corrected: 
 for newline
        stringField = `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const handleExportData = () => {
    if (!user || timeEntries.length === 0) {
      toast({ title: "Keine Daten zum Exportieren", variant: "default" });
      return;
    }

    const headers = ["Filiale", "Datum", "Gesamtdauer (HH:MM:SS)", "Produktive Dauer (HH:MM:SS)", "Pausendauer (HH:MM:SS)", "Tätigkeit", "Notiz"];
    const csvRows = [headers.join(',')];

    timeEntries.forEach(entry => {
      const productiveDuration = (entry.duration || 0) - (entry.totalPauseDuration || 0);
      const row = [
        escapeCsvField(entry.branch),
        escapeCsvField(format(new Date(entry.startTime), "yyyy-MM-dd")),
        escapeCsvField(formatDurationFromSeconds(entry.duration)),
        escapeCsvField(formatDurationFromSeconds(productiveDuration > 0 ? productiveDuration : 0)),
        escapeCsvField(formatDurationFromSeconds(entry.totalPauseDuration)),
        escapeCsvField(entry.activityType),
        escapeCsvField(entry.customActivityDescription),
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('
'); // Corrected: 
 for literal newline
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `zeiteintraege_${user.id}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Daten exportiert" });
  };

  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 py-8 space-y-8 w-full max-w-4xl mx-auto">
             <h1 className="text-3xl font-bold tracking-tight text-center">Mein Profil</h1>
             <Card className="shadow-xl w-full">
                <CardHeader className="items-center text-center">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-full max-w-sm mx-auto" />
                </CardContent>
            </Card>
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground mt-2">Lade Profildaten...</p>
            </div>
        </div>
      );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-8">
        <Card className="max-w-md mx-auto mt-10 shadow-lg">
          <CardHeader><CardTitle>Profil nicht gefunden</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4">Bitte versuchen Sie erneut, sich anzumelden.</p>
            <Button asChild className="w-full"><Link href="/login">Zum Login</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-8">
      <div className="space-y-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-center">Mein Profil</h1>
        
        <Card className="shadow-xl">
            <CardHeader className="items-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <UserCircle className="w-16 h-16" />
                </div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>Mitarbeiterprofil & Datenübersicht</CardDescription>
            </CardHeader>
        </Card>

        <ProfileOverviewTile timeEntries={timeEntries} />
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="w-6 h-6" />Datenexport</CardTitle>
            <CardDescription>Laden Sie Ihre Zeiterfassungsdaten als CSV-Datei herunter.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Exportieren Sie alle Ihre erfassten Zeiteinträge als CSV-Datei, die mit Programmen wie Excel kompatibel ist.
            </p>
            <Button 
              className="w-full" 
              onClick={handleExportData} 
              disabled={timeEntries.length === 0}
            >
              Als CSV exportieren
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
