"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  WashingMachine, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Calendar, 
  Clock, 
  Settings 
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';

type HeaderProps = {
  variant?: 'user' | 'admin';
};

export function Header({ variant = 'user' }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const userNavigation = [
    { name: 'داشبورد', href: '/dashboard', icon: <Calendar className="ml-2 h-4 w-4" /> },
    { name: 'رزروها', href: '/reservations', icon: <Clock className="ml-2 h-4 w-4" /> },
    { name: 'پروفایل', href: '/profile', icon: <User className="ml-2 h-4 w-4" /> },
  ];

  const adminNavigation = [
    { name: 'داشبورد', href: '/admin', icon: <Calendar className="ml-2 h-4 w-4" /> },
    { name: 'نوبت‌ها', href: '/admin/timeslots', icon: <Clock className="ml-2 h-4 w-4" /> },
    { name: 'رزروها', href: '/admin/reservations', icon: <Calendar className="ml-2 h-4 w-4" /> },
    { name: 'تنظیمات', href: '/admin/settings', icon: <Settings className="ml-2 h-4 w-4" /> },
  ];

  const navigation = variant === 'admin' ? adminNavigation : userNavigation;

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={variant === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2">
              <WashingMachine className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold">سامانه لباسشویی</span>
              {variant === 'admin' && (
                <span className="mr-2 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  مدیریت
                </span>
              )}
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user?.first_name} {user?.last_name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">پروفایل</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>خروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>

          {/* Mobile navigation */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            {isAuthenticated && (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">منو</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <WashingMachine className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-lg font-bold">سامانه لباسشویی</span>
                    </div>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">بستن منو</span>
                      </Button>
                    </SheetTrigger>
                  </div>
                  <div className="space-y-1 py-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center py-2 px-3 text-sm font-medium rounded-md hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center py-2 px-3 text-sm font-medium rounded-md hover:bg-muted text-red-600 dark:text-red-400"
                    >
                      <LogOut className="ml-2 h-4 w-4" />
                      خروج
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}