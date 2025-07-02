
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Branch, UserProfile } from '@/lib/types';
import { BRANCHES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, User, LogIn, Building, Users, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>();
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsUsersLoading(true);
        const fetchedUsers = await userService.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        toast({
          title: 'Fehler beim Laden der Benutzer',
          description: 'Die Mitarbeiterliste konnte nicht von der Datenbank geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleLogin = () => {
    if (!selectedUserId) {
      toast({ title: 'Auswahl fehlt', description: 'Bitte wählen Sie einen Mitarbeiter aus.', variant: 'destructive' });
      return;
    }
    if (!selectedBranch) {
      toast({ title: 'Auswahl fehlt', description: 'Bitte wählen Sie eine Filiale aus.', variant: 'destructive' });
      return;
    }

    setIsLoginLoading(true);

    // In a real app, you would perform authentication here
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('loggedInUserId', selectedUserId);
        localStorage.setItem('selectedBranch', selectedBranch);
        localStorage.setItem('isAuthenticated', 'true');
        
        const user = users.find(u => u.id === selectedUserId);
        if (user) {
            localStorage.setItem('loggedInUserName', user.name);
        }
      }
      toast({ title: 'Anmeldung erfolgreich', description: `Willkommen! Weiterleitung zum Dashboard für Filiale ${selectedBranch}.` });
      router.push('/dashboard');
      setIsLoginLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-4xl shadow-2xl mb-6">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Briefcase className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Zeiterfassung</CardTitle>
          <CardDescription>Bitte wählen Sie Ihr Profil und Ihre Filiale aus, um fortzufahren.</CardDescription>
        </CardHeader>
      </Card>

      <div className="w-full max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-6 h-6" />
                Mitarbeiter auswählen
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[14.5rem] overflow-y-auto pr-2">
                {isUsersLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {users.map((user) => (
                        <Button
                        key={user.id}
                        variant={selectedUserId === user.id ? 'default' : 'outline'}
                        className="flex flex-col items-center justify-center h-24 w-full aspect-square p-1.5 text-center"
                        onClick={() => setSelectedUserId(user.id)}
                        >
                        <User className="w-7 h-7 mb-1.5" />
                        <span className="text-xs leading-tight">{user.name}</span>
                        </Button>
                    ))}
                    </div>
                )}
            </CardContent>
            </Card>

            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                <Building className="w-6 h-6" />
                Filiale auswählen
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[14.5rem] overflow-y-auto pr-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {BRANCHES.map((branch) => (
                    <Button
                    key={branch}
                    variant={selectedBranch === branch ? 'default' : 'outline'}
                    className="flex flex-col items-center justify-center h-24 w-full aspect-square p-1.5 text-center"
                    onClick={() => setSelectedBranch(branch)}
                    >
                    <Building className="w-7 h-7 mb-1.5" />
                    <span className="text-xs leading-tight">{branch}</span>
                    </Button>
                ))}
                </div>
            </CardContent>
            </Card>
        </div>
        
        <Button 
          onClick={handleLogin} 
          className="w-full" 
          size="lg" 
          disabled={isLoginLoading || isUsersLoading || !selectedUserId || !selectedBranch}
        >
          {isLoginLoading ? (
            <LogIn className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-5 w-5" />
          )}
          Weiter
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
