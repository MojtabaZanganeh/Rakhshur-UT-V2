"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { fetchUserReservations } from '@/lib/api';
import { Reservation } from '@/types/reservation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/format-date';
import { statusStyles } from '@/components/status-style';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reservations/recent', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (response.status === 200 && data.success) {
          setReservations(data.recent.list);
        }
        else {
          throw new Error(data.message);
        }

      } catch (error) {
        console.error('Failed to fetch recent reservations:', error);
        toast.error(error instanceof Error && error.message ? error.message : 'خطا در بارگذاری رزروهای اخیر');
      } finally {
        setIsLoading(false);
      }
    };

    loadReservations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">داشبورد</h1>
          <p className="text-muted-foreground">
            خوش آمدید، {user?.first_name} {user?.last_name}
          </p>
        </div>
        <Link href="/dashboard/reservations/new">
          <Button>
            <Calendar className="ml-2 h-4 w-4" />
            رزرو جدید
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل رزروها</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{reservations.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رزروهای در انتظار</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {reservations.filter(r => r.status === 'pending' || r.status === 'washing').length}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آماده تحویل</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {reservations.filter(r => r.status === 'ready').length}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحویل گرفته شده</CardTitle>
            <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {reservations.filter(r => r.status === 'finished').length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">رزروهای اخیر</h2>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        ) : reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.slice(0, 5).map((reservation) => {
              const status = statusStyles[reservation.status];
              return (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="font-medium text-start" dir='rtl'>
                          رزرو {reservation.timeSlots.date && formatDate(reservation.timeSlots.date, { weekday: "short", month: "short", day: "numeric", })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          بازه زمانی {reservation.timeSlots.start_time.toString() + ' - ' + reservation.timeSlots.end_time.toString()} • آخرین تغییر {formatDate(reservation.updated_at, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={status.color}>
                          <div className="flex items-center">
                            {status.label}
                            &nbsp;
                            {status.icon}
                          </div>
                        </Badge>
                        <Link href={`/dashboard/reservations`}>
                          <Button variant="ghost" size="sm">مشاهده جزئیات</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {reservations.length > 5 && (
              <div className="text-center mt-4">
                <Link href="/dashboard/reservations">
                  <Button variant="outline">مشاهده همه رزروها</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">هنوز رزروی ندارید</CardTitle>
              <CardDescription className="text-center mb-4">
                شما هنوز هیچ رزرو لباسشویی انجام نداده‌اید. برای شروع، اولین رزرو خود را ایجاد کنید.
              </CardDescription>
              <Link href="/dashboard/reservations/new">
                <Button>ایجاد رزرو</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}