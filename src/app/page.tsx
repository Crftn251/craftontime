import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // Optionally, return a loading component or null
  return null;
}
