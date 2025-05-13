'use client';

import type { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { MOCK_USERS } from '@/lib/types'; // Assuming MOCK_USERS is here for demo
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ProfilePage: NextPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('loggedInUserId');
      if (userId) {
        // In a real app, fetch user data from an API
        // For this demo, we'll use MOCK_USERS
        const foundUser = MOCK_USERS.find(u => u.id === userId);
        setUser(foundUser || null);
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
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
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      <Card className="max-w-2xl mx-auto shadow-xl">
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
          <div>
            <h3 className="font-semibold text-lg mb-2">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium text-muted-foreground">User ID:</span> {user.id}</p>
                <p><span className="font-medium text-muted-foreground">Status:</span> <span className="text-green-600 font-semibold">Active</span></p>
                <p><span className="font-medium text-muted-foreground">Role:</span> Employee</p>
                 <p><span className="font-medium text-muted-foreground">Joined:</span> January 1, 2023 (Placeholder)</p>
            </div>
          </div>
           <div>
            <h3 className="font-semibold text-lg mb-2">Preferences</h3>
             <p className="text-sm text-muted-foreground">Profile preferences can be managed here. (Feature not yet implemented)</p>
          </div>
          <Button variant="outline" className="w-full mt-6" disabled>Edit Profile (Coming Soon)</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
