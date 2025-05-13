export type Branch = "SPZ" | "J&C" | "SPW" | "SPR" | "TAL";

export const BRANCHES: Branch[] = ["SPZ", "J&C", "SPW", "SPR", "TAL"];

export interface TimeEntry {
  id: string;
  startTime: number; // Store as timestamp for easier calculations
  endTime?: number; // Optional if entry is ongoing
  duration?: number; // in seconds, calculated on stop or manual entry
  branch: Branch;
  notes?: string;
  userId: string; // User identification
  manual?: boolean; // Indicates if entry was manual
  reason?: string; // Reason for manual adjustment
}

// Represents a user profile for selection and display
export interface UserProfile {
  id: string;
  name: string;
  email: string; // Standard field, though may not be used everywhere
  avatarUrl?: string;
}

// General User type, can be expanded
export interface User extends UserProfile {
  currentBranch?: Branch;
}

// Mock users for login selection
export const MOCK_USERS: UserProfile[] = [
  { id: 'user1', name: 'Maria', email: 'maria@crafton.com' },
  { id: 'user2', name: 'Elke', email: 'elke@crafton.com' },
  { id: 'user3', name: 'Marek', email: 'marek@crafton.com' },
  { id: 'user4', name: 'Jason', email: 'jason@crafton.com' },
  { id: 'user5', name: 'Nele', email: 'nele@crafton.com' },
  { id: 'user6', name: 'Jim', email: 'jim@crafton.com' },
  { id: 'user7', name: 'Schicki', email: 'schicki@crafton.com' },
  { id: 'user8', name: 'Ahmad', email: 'ahmad@crafton.com' },
  { id: 'user9', name: 'Vanessa', email: 'vanessa@crafton.com' },
  { id: 'user10', name: 'Manjana', email: 'manjana@crafton.com' },
  { id: 'user11', name: 'Chris', email: 'chris@crafton.com' },
  { id: 'user12', name: 'Sarah', email: 'sarah@crafton.com' },
  { id: 'user13', name: 'Martina', email: 'martina@crafton.com' },
  { id: 'user14', name: 'Julie', email: 'julie@crafton.com' },
  { id: 'user15', name: 'Regina', email: 'regina@crafton.com' },
];
