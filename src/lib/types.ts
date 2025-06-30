
export type Branch = "SPZ" | "J&C" | "SPW" | "SPR" | "TAL" | "Büro";

export const BRANCHES: Branch[] = ["SPZ", "J&C", "SPW", "SPR", "TAL", "Büro"];

export interface PauseInterval {
  startTime: number; // Timestamp
  endTime: number;   // Timestamp
}

export type ActivityType = "Ordnung" | "Verkauf" | "OLS" | "Eigenes" | "Keine Angabe";
export const PREDEFINED_ACTIVITIES: Exclude<ActivityType, "Eigenes" | "Keine Angabe">[] = ["Ordnung", "Verkauf", "OLS"];


export interface TimeEntry {
  id: string;
  startTime: number; // Store as timestamp for easier calculations
  endTime?: number; // Optional if entry is ongoing
  duration?: number; // in seconds, calculated on stop or manual entry (total duration including pauses)
  branch: Branch;
  notes?: string;
  userId: string; // User identification
  manual?: boolean; // Indicates if entry was manual
  reason?: string; // Reason for manual adjustment
  totalPauseDuration?: number; // in seconds
  pauseIntervals?: PauseInterval[];
  activityType?: ActivityType;
  customActivityDescription?: string;
}

// Represents a user profile for selection and display
export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
}

// General User type, can be expanded
export interface User extends UserProfile {
  currentBranch?: Branch;
}

// Mock users for login selection
export const MOCK_USERS: UserProfile[] = [
  { id: 'user1', name: 'Maria' },
  { id: 'user2', name: 'Elke' },
  { id: 'user3', name: 'Marek' },
  { id: 'user4', name: 'Jason' },
  { id: 'user5', name: 'Nele' },
  { id: 'user6', name: 'Jim' },
  { id: 'user7', name: 'Schicki' },
  { id: 'user8', name: 'Ahmad' },
  { id: 'user9', name: 'Vanessa' },
  { id: 'user10', name: 'Manjana' },
  { id: 'user11', name: 'Chris' },
  { id: 'user12', name: 'Sarah' },
  { id: 'user13', name: 'Martina' },
  { id: 'user14', name: 'Julie' },
  { id: 'user15', name: 'Regina' },
  { id: 'user16', name: 'Manu' },
];
