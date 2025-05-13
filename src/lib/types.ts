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
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@crafton.com' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@crafton.com' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@crafton.com' },
  { id: 'user4', name: 'Diana Prince', email: 'diana@crafton.com' },
];
