
'use client';

import type { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCircle, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserProfile, TimeEntry } from '@/lib/types';
import { MOCK_USERS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProfileOverviewTile } from '@/components/features/ProfileOverviewTile';
import { useToast } from "@/hooks/use-toast";

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
            const parsedEntries = JSON.parse(storedEntries);
            if (Array.isArray(parsedEntries)) {
              setTimeEntries(parsedEntries);
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

  const handleExportData = () => {
    if (!user || timeEntries.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no time entries to export for this user.",
        variant: "default",
      });
      return;
    }

    const dataToExport = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      timeEntries: timeEntries.map(entry => ({
        ...entry,
        startTime: new Date(entry.startTime).toISOString(),
        endTime: entry.endTime ? new Date(entry.endTime).toISOString() : undefined,
      })),
      exportedAt: new Date().toISOString(),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `time_entries_${user.id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast({
        title: "Data Exported",
        description: "Time entries have been downloaded as a JSON file.",
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
            {/* Removed Details, Preferences, and Edit Profile button as requested */}
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
            <CardDescription>Download your time tracking data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all your recorded time entries as a JSON file.
            </p>
            <Button 
              className="w-full" 
              onClick={handleExportData} 
              disabled={timeEntries.length === 0}
            >
              Export My Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

