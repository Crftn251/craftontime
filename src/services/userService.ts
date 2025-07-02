
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

// Helper to convert a Firestore document to a UserProfile object
const fromFirestore = (doc: QueryDocumentSnapshot<DocumentData>): UserProfile => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    avatarUrl: data.avatarUrl,
  };
};

export const userService = {
  // Fetch all users from Firestore, ordered by name
  async getUsers(): Promise<UserProfile[]> {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  },

  // Add a new user to Firestore
  async addUser(name: string): Promise<UserProfile> {
    const usersCollection = collection(db, 'users');
    const docRef = await addDoc(usersCollection, { name });
    return { id: docRef.id, name };
  },

  // Update an existing user's name
  async updateUser(id: string, name: string): Promise<void> {
    const userDoc = doc(db, 'users', id);
    await updateDoc(userDoc, { name });
  },

  // Delete a user from Firestore
  async deleteUser(id:string): Promise<void> {
    const userDoc = doc(db, 'users', id);
    await deleteDoc(userDoc);
  },

  // A utility to add multiple users at once, useful for seeding the database
  async addInitialUsers(users: Omit<UserProfile, 'id'>[]): Promise<void> {
    const usersCollection = collection(db, 'users');
    for (const user of users) {
        await addDoc(usersCollection, { name: user.name });
    }
  }
};
