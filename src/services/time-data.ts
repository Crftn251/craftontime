import { db } from '@/lib/firebase';
import type { TimeEntry } from '@/lib/types';
import { collection, doc, writeBatch } from 'firebase/firestore';

/**
 * Synchronizes a user's local time entries with Firestore.
 * This will overwrite any existing entries for that user in Firestore
 * with the provided local entries.
 *
 * @param userId The ID of the user whose entries are being synced.
 * @param entries The array of TimeEntry objects to upload.
 */
export const syncTimeEntriesToFirestore = async (userId: string, entries: TimeEntry[]): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to sync data.");
  }
  if (!entries || entries.length === 0) {
    // No data to sync
    return;
  }

  const batch = writeBatch(db);
  const userEntriesCollection = collection(db, 'users', userId, 'timeEntries');

  entries.forEach((entry) => {
    const entryRef = doc(userEntriesCollection, entry.id);
    // We convert the object to a plain JS object for Firestore
    batch.set(entryRef, { ...entry });
  });

  await batch.commit();
};
