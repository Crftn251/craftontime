export type Branch = "SPZ" | "J&C" | "SPW" | "SPR" | "TAL";

export const BRANCHES: Branch[] = ["SPZ", "J&C", "SPW", "SPR", "TAL"];

export interface TimeEntry {
  id: string;
  startTime: number; // Store as timestamp for easier calculations
  endTime?: number; // Optional if entry is ongoing
  duration?: number; // in seconds, calculated on stop or manual entry
  branch: Branch;
  notes?: string;
  userId: string; // Placeholder for user identification
  manual?: boolean; // Indicates if entry was manual
  reason?: string; // Reason for manual adjustment
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currentBranch?: Branch;
}
