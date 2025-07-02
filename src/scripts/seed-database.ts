
// This script is a utility to seed the Firestore database with initial data.
// It's meant to be run once from the command line.

import { MOCK_USERS } from '@/lib/types';
import { userService } from '@/services/userService';

const seedDatabase = async () => {
  console.log('Seeding database with initial users...');

  try {
    // Check if users already exist to avoid duplicates
    const existingUsers = await userService.getUsers();
    if (existingUsers.length > 0) {
      console.log('Database already contains users. Skipping seed.');
      return;
    }

    await userService.addInitialUsers(MOCK_USERS);
    console.log('Successfully seeded the database with initial users.');
  } catch (error) {
    console.error('Error seeding the database:', error);
  }
};

seedDatabase();
