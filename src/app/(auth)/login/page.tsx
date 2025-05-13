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
import { Briefcase, User, LogIn } from 'lucide-react';

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
      toast({ title: 'Selection Missing', description: 'Please select an employee.', variant: 'destructive' });
      return;
    }
    if (!selectedBranch) {
      toast({ title: 'Selection Missing', description: 'Please select a branch.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('loggedInUserId', selectedUserId);
        localStorage.setItem('selectedBranch', selectedBranch);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Store selected user's name for display in header
        const user = MOCK_USERS.find(u => u.id === selectedUserId);
        if (user) {
            localStorage.setItem('loggedInUserName', user.name);
        }
      }
      toast({ title: 'Login Successful', description: `Welcome! Redirecting to dashboard for branch ${selectedBranch}.` });
      router.push('/dashboard');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Briefcase className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Crafton Time Track</CardTitle>
          <CardDescription>Please select your profile and branch to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="employee-select" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Employee
            </Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="employee-select" className="w-full">
                <SelectValue placeholder="Select employee..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_USERS.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-select" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Branch
            </Label>
            <Select value={selectedBranch} onValueChange={(value) => setSelectedBranch(value as Branch)}>
              <SelectTrigger id="branch-select" className="w-full">
                <SelectValue placeholder="Select branch..." />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <LogIn className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            Proceed
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
