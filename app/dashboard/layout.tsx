import { Header } from '@/components/layout/header';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="user" />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}