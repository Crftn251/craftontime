
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TimeEntry, PauseInterval } from '@/lib/types';

// Helper to convert Firestore Timestamps back to numbers for client-side use
const fromFirestore = (doc: QueryDocumentSnapshot<DocumentData>): TimeEntry => {
    const data = doc.data();
    // Safely convert Timestamps to numbers, handling potential server vs. client-side differences
    const toMillis = (timestamp: any): number | undefined => {
        if (!timestamp) return undefined;
        if (timestamp instanceof Timestamp) return timestamp.toMillis();
        // Handle cases where it might already be a number or needs parsing
        if (typeof timestamp === 'object' && timestamp.seconds) {
             return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toMillis();
        }
        return timestamp;
    }

    return {
        id: doc.id,
        ...data,
        startTime: toMillis(data.startTime)!,
        endTime: toMillis(data.endTime),
        pauseIntervals: data.pauseIntervals?.map((p: any) => ({
            startTime: toMillis(p.startTime)!,
            endTime: toMillis(p.endTime)!,
        })) || [],
    } as TimeEntry;
};


// Helper to convert client-side numbers to Firestore Timestamps for storage
const toFirestore = (entry: Partial<TimeEntry>): DocumentData => {
    const data: DocumentData = { ...entry };
    if (entry.startTime) data.startTime = Timestamp.fromMillis(entry.startTime);
    if (entry.endTime) data.endTime = Timestamp.fromMillis(entry.endTime);
    if (entry.pauseIntervals) {
        data.pauseIntervals = entry.pauseIntervals.map(p => ({
            startTime: Timestamp.fromMillis(p.startTime),
            endTime: Timestamp.fromMillis(p.endTime),
        }));
    }
    return data;
};


export const timeEntryService = {
  // Get all time entries for a specific user, ordered by start time
  async getTimeEntries(userId: string): Promise<TimeEntry[]> {
    const entriesCollection = collection(db, 'timeEntries');
    const q = query(entriesCollection, where('userId', '==', userId), orderBy('startTime', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  },

  // Get a single time entry by its ID
  async getTimeEntry(id: string): Promise<TimeEntry | null> {
    const entryDoc = doc(db, 'timeEntries', id);
    const docSnap = await getDoc(entryDoc);
    if(docSnap.exists()){
        return fromFirestore(docSnap);
    }
    return null;
  },

  // Find an entry that has been started but not stopped for a user
  async getOngoingTimeEntry(userId: string): Promise<TimeEntry | null> {
    const entriesCollection = collection(db, 'timeEntries');
    const q = query(
      entriesCollection,
      where('userId', '==', userId),
      where('endTime', '==', null),
      orderBy('startTime', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return fromFirestore(querySnapshot.docs[0]);
    }
    return null;
  },

  // Add a new time entry to the database
  async addTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
    const newEntryData = toFirestore(entry);
    const docRef = await addDoc(collection(db, 'timeEntries'), newEntryData);
    return { id: docRef.id, ...entry };
  },

  // Update an existing time entry
  async updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<void> {
    const entryDoc = doc(db, 'timeEntries', id);
    const updateData = toFirestore(updates);
    await updateDoc(entryDoc, updateData);
  },

  // Delete a time entry
  async deleteTimeEntry(id: string): Promise<void> {
    const entryDoc = doc(db, 'timeEntries', id);
    await deleteDoc(entryDoc);
  },
};
