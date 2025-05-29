"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { redirect, useRouter } from 'next/navigation';
import { User, userRegister } from '@/types/user';
import { verifyToken } from '@/lib/auth-utils';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendCode: (phone: string, page: string) => Promise<boolean>;
  checkCode: (phone: string, code: string) => Promise<boolean>;
  login: (phone: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: userRegister) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, page, }: { children: React.ReactNode; page?: string; }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await verifyToken();
        if (userData) {
          if (page == 'auth') {
            if (userData.role === 'user') {
              router.push('/dashboard');
            }
            else {
              router.push('/admin');
            }
          }
          setUser(userData);
        }
        else {
          if (page != 'auth') {
            router.push('/auth/login');
          }
        }
      } catch (error) {
        console.error('خطای احراز هویت:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const sendCode = async (phone: string, page: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, page }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('کد تأیید ارسال شد');
        return true;
      } else {
        throw new Error(data.message || 'ارسال کد با خطا مواجه شد');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ارسال کد با خطا مواجه شد');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkCode = async (phone: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/check-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        return true;
      }
      else {
        throw new Error(data.message);
      }

    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'بررسی کد با خطا مواجه شد');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.status === 200 && data.success) {
        setUser(data.user);
        toast.success('ورود موفقیت‌آمیز بود');

        if (data.user.role === 'user') {
          router.push('/dashboard');
        } else if (data.user.role.startsWith('admin')) {
          router.push('/admin');
        }

        return true;
      } else {
        throw new Error(data.message);
      }

    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'ورود با خطا مواجه شد');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      setUser(null);
      router.push('/');
      toast.success('خروج با موفقیت انجام شد');
    } catch (error) {
      toast.error('خروج با خطا مواجه شد');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: userRegister): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.status === 200 && data.success) {
        setUser(data.user);
        toast.success('ثبت‌نام با موفقیت انجام شد');
        router.push('/dashboard');

        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'ثبت‌نام با خطا مواجه شد');
      return false;
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
        checkCode,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth باید درون AuthProvider استفاده شود');
  }
  return context;
};