"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, UserCircle, LogOut, Settings, User, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import { BranchSelector } from '@/components/shared/BranchSelector';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Branch, UserProfile } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface HeaderProps {
  onBranchChange?: (branch: Branch) => void;
  currentUser?: UserProfile | null;
}

export const Header: FC<HeaderProps> = ({ onBranchChange, currentUser }) => {
  const router = useRouter();
  
  const userName = currentUser?.name || "Employee";
  const userEmail = currentUser?.email || "employee@crafton.com";
  const userAvatar = currentUser?.avatarUrl;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUserId');
      localStorage.removeItem('loggedInUserName');
      localStorage.removeItem('selectedBranch');
      localStorage.removeItem('isAuthenticated');
      // Clear time tracker specific localStorage items
      localStorage.removeItem('employeeTimeTracker_startTime');
      localStorage.removeItem('employeeTimeTracker_elapsedTime');
      localStorage.removeItem('employeeTimeTracker_isRunning');
      // Ensure user-specific time entries are cleared
      const userId = currentUser?.id; // Use the actual current user's ID before clearing
      if (userId) {
        localStorage.removeItem(`timeEntries_${userId}`);
      } else {
        // Fallback if currentUser was not available for some reason, clear generic if it was ever used
        localStorage.removeItem('timeEntries');
      }
    }
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6"> {/* Adjusted gap */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">Crafton Time Track</span>
          </Link>
          
          {/* Explicit Navigation Links */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </Button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentUser && <BranchSelector onBranchChange={onBranchChange} />}
          {currentUser && <Separator orientation="vertical" className="h-8" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  {userAvatar && <AvatarImage src={userAvatar} alt={userName} data-ai-hint="user avatar" />}
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
