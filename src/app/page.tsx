import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login'); // Redirect to the new login page
  return null;
}
