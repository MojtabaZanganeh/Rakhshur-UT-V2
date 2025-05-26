import { Header } from '@/components/layout/header';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/lib/auth-provider';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen flex flex-col">
      <AuthProvider>
        <Header variant="admin" />
      </AuthProvider>
      <main className="flex-1 container mx-auto px-4 py-8">
        <AuthProvider>
          {children}
        </AuthProvider>
      </main>
    </div>
  );
}