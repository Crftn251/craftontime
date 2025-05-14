
'use client';

import type { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCircle, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserProfile, TimeEntry, PauseInterval } from '@/lib/types';
import { MOCK_USERS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProfileOverviewTile } from '@/components/features/ProfileOverviewTile';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

const ProfilePage: NextPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('loggedInUserId');
      if (userId) {
        const foundUser = MOCK_USERS.find(u => u.id === userId);
        setUser(foundUser || null);

        const storedEntriesKey = `timeEntries_${userId}`;
        const storedEntries = localStorage.getItem(storedEntriesKey);
        if (storedEntries) {
          try {
            const parsedEntries = JSON.parse(storedEntries) as TimeEntry[];
            if (Array.isArray(parsedEntries)) {
              const sanitizedEntries = parsedEntries.map(entry => ({
                ...entry,
                startTime: Number(entry.startTime),
                endTime: entry.endTime ? Number(entry.endTime) : undefined,
                duration: entry.duration ? Number(entry.duration) : undefined,
                totalPauseDuration: entry.totalPauseDuration ? Number(entry.totalPauseDuration) : 0,
                pauseIntervals: Array.isArray(entry.pauseIntervals) ? entry.pauseIntervals.map(pi => ({
                    startTime: Number(pi.startTime),
                    endTime: Number(pi.endTime),
                })) : [],
              }));
              setTimeEntries(sanitizedEntries);
            } else {
              setTimeEntries([]);
            }
          } catch (e) {
            console.error("Failed to parse time entries from localStorage", e);
            setTimeEntries([]);
          }
        } else {
          setTimeEntries([]);
        }
      }
      setLoading(false);
    }
  }, []);

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
    if (stringField.search(/("|,|\n)/g) >= 0) {
      stringField = stringField.replace(/"/g, '""');
      stringField = `"${stringField}"`;
    }
    return stringField;
  };

  const handleExportData = () => {
    if (!user || timeEntries.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no time entries to export for this user.",
        variant: "default",
      });
      return;
    }

    const headers = [
      "Entry ID", "User ID", "User Name", "User Email", "Branch",
      "Date", "Start Time", "End Time",
      "Total Duration (HH:MM:SS)", "Productive Duration (HH:MM:SS)", "Total Pause Duration (HH:MM:SS)",
      "Pause Intervals (Start-End;...)", "Manual Entry", "Reason for Manual Entry/Adjustment", "Notes"
    ];

    const csvRows = [headers.join(',')];

    timeEntries.forEach(entry => {
      const entryDate = entry.startTime ? format(new Date(entry.startTime), "yyyy-MM-dd") : '';
      const entryStartTime = entry.startTime ? format(new Date(entry.startTime), "HH:mm:ss") : '';
      const entryEndTime = entry.endTime ? format(new Date(entry.endTime), "HH:mm:ss") : '';
      
      const totalDurationSec = entry.duration || 0;
      const totalPauseDurationSec = entry.totalPauseDuration || 0;
      const productiveDurationSec = totalDurationSec - totalPauseDurationSec;

      const pauseIntervalsString = (entry.pauseIntervals || [])
        .map(pi => `${format(new Date(pi.startTime), "HH:mm:ss")}-${format(new Date(pi.endTime), "HH:mm:ss")}`)
        .join('; ');

      const row = [
        escapeCsvField(entry.id),
        escapeCsvField(user.id),
        escapeCsvField(user.name),
        escapeCsvField(user.email),
        escapeCsvField(entry.branch),
        escapeCsvField(entryDate),
        escapeCsvField(entryStartTime),
        escapeCsvField(entryEndTime),
        escapeCsvField(formatDurationFromSeconds(totalDurationSec)),
        escapeCsvField(formatDurationFromSeconds(productiveDurationSec > 0 ? productiveDurationSec : 0)),
        escapeCsvField(formatDurationFromSeconds(totalPauseDurationSec)),
        escapeCsvField(pauseIntervalsString),
        escapeCsvField(entry.manual ? 'Yes' : 'No'),
        escapeCsvField(entry.reason),
        escapeCsvField(entry.notes),
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `time_entries_${user.id}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
        title: "Data Exported",
        description: "Time entries have been downloaded as a CSV file.",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 justify-center items-center h-full">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 justify-center items-center h-full">
        <Card className="max-w-md mx-auto mt-10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-8 h-8 text-destructive" />
              Profile Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              User details could not be loaded. Please try logging in again.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-8">
      <div className="space-y-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-center">My Profile</h1>
        
        <Card className="shadow-xl">
          <CardHeader className="items-center text-center">
              {user.avatarUrl ? (
                   <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" data-ai-hint="person avatar" />
              ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                      <UserCircle className="w-16 h-16" />
                  </div>
              )}
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Time tracking overview and data export options are available below.
            </p>
          </CardContent>
        </Card>

        <ProfileOverviewTile timeEntries={timeEntries} />

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-6 h-6" />
              Data Export
            </CardTitle>
            <CardDescription>Download your time tracking data as a CSV file (for Excel).</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all your recorded time entries, including productive time and pause details, as a CSV file. This format is easily opened in spreadsheet programs like Excel.
            </p>
            <Button 
              className="w-full" 
              onClick={handleExportData} 
              disabled={timeEntries.length === 0}
            >
              Export as CSV (for Excel)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

