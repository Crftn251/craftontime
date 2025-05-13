
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Branch, UserProfile } from '@/lib/types';
import { BRANCHES, MOCK_USERS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, User, LogIn, Building } from 'lucide-react';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = () => {
    if (!selectedUserId) {
      toast({ title: 'Auswahl fehlt', description: 'Bitte wählen Sie einen Mitarbeiter aus.', variant: 'destructive' });
      return;
    }
    if (!selectedBranch) {
      toast({ title: 'Auswahl fehlt', description: 'Bitte wählen Sie eine Filiale aus.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('loggedInUserId', selectedUserId);
        localStorage.setItem('selectedBranch', selectedBranch);
        localStorage.setItem('isAuthenticated', 'true');
        
        const user = MOCK_USERS.find(u => u.id === selectedUserId);
        if (user) {
            localStorage.setItem('loggedInUserName', user.name);
        }
      }
      toast({ title: 'Anmeldung erfolgreich', description: `Willkommen! Weiterleitung zum Dashboard für Filiale ${selectedBranch}.` });
      router.push('/dashboard');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl mb-6">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Briefcase className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Crafton Time Track</CardTitle>
          <CardDescription>Bitte wählen Sie Ihr Profil und Ihre Filiale aus, um fortzufahren.</CardDescription>
        </CardHeader>
      </Card>

      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-6 h-6" />
              Mitarbeiter auswählen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="employee-select" className="w-full">
                <SelectValue placeholder="Mitarbeiter auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_USERS.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building className="w-6 h-6" />
              Filiale auswählen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBranch} onValueChange={(value) => setSelectedBranch(value as Branch)}>
              <SelectTrigger id="branch-select" className="w-full">
                <SelectValue placeholder="Filiale auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Button onClick={handleLogin} className="w-full" size="lg" disabled={isLoading || !selectedUserId || !selectedBranch}>
          {isLoading ? (
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
