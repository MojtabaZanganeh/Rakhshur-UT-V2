"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { verifyToken } from '@/lib/auth-utils';
import { safeJsonFetch } from './config';
import { userLogin } from './api';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendCode: (phone: string) => Promise<void>;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'role'>) => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await verifyToken();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const sendCode = async (phone: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'sendCode', phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ارسال کد با خطا مواجه شد');
      }

      toast.success('کد تایید ارسال شد');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ارسال کد با خطا مواجه شد');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, code: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'login', phone, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ورود با خطا مواجه شد');
      }

      setUser(data.user);

      if (data.user.role === 'user') {
        router.push('/dashboard');
      } else {
        router.push('/admin');
      }

      toast.success('ورود موفقیت‌آمیز بود');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ورود با خطا مواجه شد');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'role'>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      toast.success('Verification code sent to your phone');
      router.push(`/auth/verify?phone=${userData.phone}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (phone: string, code: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Verification failed');
      }

      toast.success('Phone verified successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        sendCode,
        login,
        logout,
        register,
        verifyCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};