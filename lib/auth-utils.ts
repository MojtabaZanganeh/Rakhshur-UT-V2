import { User } from '@/types/user';

export async function verifyToken(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/verify-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}