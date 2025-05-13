
"use client";
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";
import type { Branch, UserProfile } from '@/lib/types';
import { MOCK_USERS } from '@/lib/types';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { LayoutDashboard, User, LogOut, Settings, Briefcase, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function AppLayout({ children }: { children: ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch | undefined>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const userId = localStorage.getItem('loggedInUserId');
      const userName = localStorage.getItem('loggedInUserName');

      if (isAuthenticated === 'true' && userId) {
        const userDetails = userName ? { id: userId, name: userName, email: `${userName.toLowerCase().replace(' ','.')}@crafton.com` } : MOCK_USERS.find(u => u.id === userId);
        
        if (userDetails) {
          setCurrentUser(userDetails);
        } else {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('loggedInUserId');
          localStorage.removeItem('loggedInUserName');
          router.replace('/login');
          return;
        }
      } else {
        router.replace('/login');
        return;
      }
      setIsAuthCheckComplete(true);

      // Set initial branch from localStorage if available
      const storedBranch = localStorage.getItem('selectedBranch') as Branch | null;
      if (storedBranch) {
        setCurrentBranch(storedBranch);
      }

    }
  }, [router]);

  const handleBranchChange = (branch: Branch) => {
    setCurrentBranch(branch);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedBranch', branch);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      const userId = currentUser?.id; 
      localStorage.removeItem('loggedInUserId');
      localStorage.removeItem('loggedInUserName');
      localStorage.removeItem('selectedBranch');
      localStorage.removeItem('isAuthenticated');
      if (userId) {
        // Timer state is intentionally NOT removed here to persist timer across logout/login.
        localStorage.removeItem(`timeEntries_${userId}`);
      } else {
        localStorage.removeItem('timeEntries'); 
      }
    }
    router.push('/login');
  };
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  if (!isAuthCheckComplete || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/50">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="p-2 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 p-1 hover:bg-sidebar-accent rounded-md flex-grow">
            <Briefcase className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-semibold tracking-tight text-sidebar-primary group-data-[collapsible=icon]:hidden">Crafton</span>
          </Link>
          {/* Sidebar internal trigger can be added here if needed, using SidebarTrigger component from ui/sidebar */}
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Zeiterfassung">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard />
                  <span className="group-data-[collapsible=icon]:hidden">Zeiterfassung</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/profile'} tooltip="Profile">
                <Link href="/profile" className="flex items-center gap-2">
                  <User />
                  <span className="group-data-[collapsible=icon]:hidden">Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-1 py-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent">
                <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-8 w-8">
                    {currentUser.avatarUrl && <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar" />}
                    <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden flex-grow overflow-hidden">
                        <p className="text-sm font-medium leading-tight truncate">{currentUser.name}</p>
                        <p className="text-xs leading-tight text-sidebar-foreground/70 truncate">
                        {currentUser.email}
                        </p>
                    </div>
                     <ChevronUp className="h-4 w-4 ml-auto shrink-0 group-data-[collapsible=icon]:hidden opacity-70 group-data-[state=open]:rotate-180 transition-transform" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-1 z-[60]" align="end" side="top"  alignOffset={-5} sideOffset={10}> {/* Ensure dropdown is above other elements */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-not-allowed">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <Header 
            onBranchChange={handleBranchChange} 
            currentUser={currentUser}
        />
        <main className="flex-1 container mx-auto py-8 px-4 md:px-6 lg:px-8">
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
