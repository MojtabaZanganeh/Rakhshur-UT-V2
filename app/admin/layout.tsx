import { Header } from '@/components/layout/header';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if token exists on server-side
  const cookieStore = cookies();
  const token = (await cookieStore).get('token');

  if (!token) {
    redirect('/auth/login');
  }

  // In a real implementation, you would verify if the user has admin role
  // For now, we'll just check for the token

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="admin" />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}