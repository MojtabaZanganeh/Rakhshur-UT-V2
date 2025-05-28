"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, PlusCircle, Building, Clock, WashingMachine, AlarmClockCheck, BookmarkX, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { fetchApi } from '@/lib/api';
import { Reservation } from '@/types/reservation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

type AdminStats = {
  totalReservations: number;
  totalUsers: number;
  dormitoryCounts: {
    'dormitory-1': number;
    'dormitory-2': number;
  };
  statusCounts: {
    pending: number;
    washing: number;
    ready: number;
    finished: number;
    cancelled: number;
  };
  weeklyReservations: {
    day: string;
    count: number;
  }[];
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))','hsl(var(--chart-5))'];

const DORMITORY_COLORS = ['hsl(var(--chart-6))', 'hsl(var(--chart-7))'];

const statusStyles = {
  pending: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
    icon: <Clock className="h-4 w-4 mr-1" />,
    label: 'در انتظار'
  },
  washing: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    icon: <WashingMachine className="h-4 w-4 mr-1" />,
    label: 'در حال شستشو'
  },
  ready: {
    color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    icon: <AlarmClockCheck className="h-4 w-4 mr-1" />,
    label: 'آماده تحویل'
  },
  finished: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    icon: <BookmarkCheck className="h-4 w-4 mr-1" />,
    label: 'تحویل داده شده'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    icon: <BookmarkX className="h-4 w-4 mr-1" />,
    label: 'لغو شده'
  },
};

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isMainAdmin = user?.role === 'admin';
  const isDormitoryAdmin = user?.role.startsWith('admin-dormitory');
  const adminDormitory = isDormitoryAdmin ? user?.role.replace('admin-', '') : null;

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reservations/info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (response.status === 200 && data.success) {
          setStats(data.info);
        }
        else {
          throw new Error(data.message);
        }

      } catch (error) {
        console.error('Failed to fetch info:', error);
        toast.error(error instanceof Error && error.message ? error.message : 'خطا در بارگذاری آمار');
      } finally {
        setIsLoading(false);
      }
    };

    const loadRecentReservations = async () => {
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
          setRecentReservations(data.recent.list);
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


    setTimeout(() => {
      loadAdminData();
      loadRecentReservations();
      setIsLoading(false);
    }, 1000);
  }, [isDormitoryAdmin, adminDormitory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const statusData = stats ? [
    { name: 'در انتظار', value: stats.statusCounts.pending },
    { name: 'در حال شستشو', value: stats.statusCounts.washing },
    { name: 'آماده', value: stats.statusCounts.ready },
    { name: 'تحویل داده شده', value: stats.statusCounts.finished },
    { name: 'لغو شده', value: stats.statusCounts.cancelled },
  ] : [];

  const dormitoryData = stats ? [
    { name: 'خوابگاه ۱', value: stats.dormitoryCounts['dormitory-1'] },
    { name: 'خوابگاه ۲', value: stats.dormitoryCounts['dormitory-2'] },
  ] : [];

  const getDormitoryStats = () => {
    if (!stats || !adminDormitory) return null;

    return {
      totalReservations: stats.dormitoryCounts[adminDormitory as keyof typeof stats.dormitoryCounts] || 0,
      statusCounts: stats.statusCounts
    };
  };

  const dormitoryStats = getDormitoryStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">داشبورد مدیریت</h1>
          <p className="text-muted-foreground">
            خوش آمدید، {user?.first_name} {user?.last_name}
            {isDormitoryAdmin && adminDormitory === 'dormitory-1' && ' (ادمین خوابگاه ۱)'}
            {isDormitoryAdmin && adminDormitory === 'dormitory-2' && ' (ادمین خوابگاه ۲)'}
          </p>
        </div>

        <Link href={isDormitoryAdmin ? `/admin/timeslots/new?dormitory=${adminDormitory}` : "/admin/timeslots/new"}>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            افزودن نوبت جدید
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-orange-100">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDormitoryAdmin ? 'رزروهای خوابگاه' : 'کل رزروها'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.totalReservations}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDormitoryAdmin ? 'کاربران خوابگاه' : 'کل کاربران'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            )}
          </CardContent>
        </Card>

        {(isMainAdmin) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">خوابگاه ۱</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.dormitoryCounts['dormitory-1']}</div>
              )}
            </CardContent>
          </Card>
        )}

        {(isMainAdmin) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">خوابگاه ۲</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.dormitoryCounts['dormitory-2']}</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        {isMainAdmin &&
          <TabsList>
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="analytics">تحلیل‌ها</TabsTrigger>
          </TabsList>
        }

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8 mb-8">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle dir='rtl'>رزروهای هفتگی</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.weeklyReservations} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle dir='rtl'>وضعیت رزروها</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-semibold mb-4" dir='rtl'>رزروهای اخیر</h2>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          ) : (
            <div className="space-y-4" dir='rtl'>
              {recentReservations.length > 0 ? (
                recentReservations.slice(0, 5).map((reservation) => (
                  <Card key={reservation.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="font-medium">
                            {reservation.user_first_name} {reservation.user_last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(reservation.timeSlots.date || '')} - {reservation.timeSlots.start_time.toString()} • {reservation.timeSlots.dormitory === 'dormitory-1' ? 'خوابگاه ۱' : 'خوابگاه ۲'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusStyles[reservation.status].color}>
                            <div className="flex items-center">
                              {statusStyles[reservation.status].label}
                              &nbsp;
                              {statusStyles[reservation.status].icon}
                            </div>
                          </Badge>
                          <Link href={`/admin/reservations/`}>
                            <Button variant="default" size="sm">مدیریت</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  هیچ رزروی یافت نشد
                </div>
              )}
              {recentReservations.length > 5 && (
                <div className="text-center mt-4">
                  <Link href="/admin/reservations">
                    <Button variant="outline">مشاهده همه رزروها</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {isMainAdmin && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle dir='rtl'>رزروها بر اساس خوابگاه</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dormitoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {dormitoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DORMITORY_COLORS[index % DORMITORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle dir='rtl'>توزیع وضعیت رزروها</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}