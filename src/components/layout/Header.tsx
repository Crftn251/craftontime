
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { PanelLeft, Briefcase, User, LogOut, Gauge, UserCircle2 } from 'lucide-react'; 
import { BranchSelector } from '@/components/shared/BranchSelector';
import { Button } from '@/components/ui/button';
import type { Branch, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onBranchChange?: (branch: Branch) => void;
  currentUser: UserProfile | null;
}

export const Header: FC<HeaderProps> = ({ onBranchChange, currentUser }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUserId');
      localStorage.removeItem('selectedBranch');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('loggedInUserName');
      // Clear individual stopwatch states for all users - this might be broad but ensures cleanup
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('employeeTimeTracker_')) {
          localStorage.removeItem(key);
        }
      });
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login');
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "NN"; // No Name
    const names = name.split(' ');
    if (names.length === 1) return name.substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };


  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
           <Link href="/dashboard" className="flex items-center gap-2 ml-1">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold tracking-tight text-primary">Crafton</span>
           </Link>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <Gauge className="mr-2 h-4 w-4" />
              Zeiterfassung
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/profile">
              <UserCircle2 className="mr-2 h-4 w-4" />
              Profil
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <BranchSelector onBranchChange={onBranchChange} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="person avatar" />
                  <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Mobile navigation - shown below header for simplicity, could be a drawer */}
      <div className="md:hidden flex justify-around p-2 border-t bg-background">
          <Button variant="ghost" asChild className="flex-1">
            <Link href="/dashboard">
              <Gauge className="mr-2 h-5 w-5" />
              Zeiterfassung
            </Link>
          </Button>
          <Button variant="ghost" asChild className="flex-1">
            <Link href="/profile">
              <UserCircle2 className="mr-2 h-5 w-5" />
              Profil
            </Link>
          </Button>
      </div>
    </header>
  );
};
