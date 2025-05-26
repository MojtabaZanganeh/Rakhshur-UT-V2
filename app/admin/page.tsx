"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, PlusCircle, Building } from 'lucide-react';
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

type AdminStats = {
  totalReservations: number;
  totalUsers: number;
  dormitoryCounts: {
    'dormitory-1': number;
    'dormitory-2': number;
  };
  statusCounts: {
    waiting: number;
    washing: number;
    ready: number;
    finished: number;
  };
  weeklyReservations: {
    day: string;
    count: number;
  }[];
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const DORMITORY_COLORS = ['hsl(var(--chart-5))', 'hsl(var(--chart-6))'];

// export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const statsData = await fetchApi<{ stats: AdminStats }>('/admin/stats');
        setStats(statsData.stats);

        const reservationsData = await fetchApi<{ reservations: Reservation[] }>('/admin/reservations/recent');
        setRecentReservations(reservationsData.reservations);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();

    setTimeout(() => {
      setStats({
        totalReservations: 87,
        totalUsers: 42,
        dormitoryCounts: {
          'dormitory-1': 48,
          'dormitory-2': 39,
        },
        statusCounts: {
          waiting: 12,
          washing: 22,
          ready: 15,
          finished: 150,
        },
        weeklyReservations: [
          { day: 'شنبه', count: 14 },
          { day: 'یکشنبه', count: 10 },
          { day: 'دوشنبه', count: 8 },
          { day: 'سه‌شنبه', count: 12 },
          { day: 'چهارشنبه', count: 15 },
          { day: 'پنج‌شنبه', count: 10 },
          { day: 'جمعه', count: 30 },
        ],
      });

      setRecentReservations([
        {
          id: '1234abcd',
          userId: 'user1',
          timeSlots: [
            {
              id: 'slot1',
              startTime: '2025-01-01T14:30:00Z',
              endTime: '2025-01-01T15:00:00Z',
              dormitory: 'dormitory-1',
            },
          ],
          status: 'washing',
          createdAt: '2025-01-01T12:00:00Z',
          updatedAt: '2025-01-01T12:00:00Z',
          paymentStatus: 'completed',
        },
        {
          id: '5678efgh',
          userId: 'user2',
          timeSlots: [
            {
              id: 'slot2',
              startTime: '2025-01-01T15:30:00Z',
              endTime: '2025-01-01T16:00:00Z',
              dormitory: 'dormitory-2',
            },
          ],
          status: 'washing',
          createdAt: '2025-01-01T13:00:00Z',
          updatedAt: '2025-01-01T14:00:00Z',
          paymentStatus: 'completed',
        },
        {
          id: '9012ijkl',
          userId: 'user3',
          timeSlots: [
            {
              id: 'slot3',
              startTime: '2025-01-01T16:30:00Z',
              endTime: '2025-01-01T17:00:00Z',
              dormitory: 'dormitory-1',
            },
          ],
          status: 'waiting',
          createdAt: '2025-01-01T14:00:00Z',
          updatedAt: '2025-01-01T15:30:00Z',
          paymentStatus: 'completed',
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const statusData = stats ? [
    { name: 'در انتظار', value: stats.statusCounts.waiting },
    { name: 'در حال شستشو', value: stats.statusCounts.washing },
    { name: 'آماده', value: stats.statusCounts.ready },
    { name: 'تحویل داده شده', value: stats.statusCounts.finished },
  ] : [];

  const dormitoryData = stats ? [
    { name: 'خوابگاه ۱', value: stats.dormitoryCounts['dormitory-1'] },
    { name: 'خوابگاه ۲', value: stats.dormitoryCounts['dormitory-2'] },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">داشبورد مدیریت</h1>
          <p className="text-muted-foreground">
            خوش آمدید، {user?.first_name} {user?.last_name}
          </p>
        </div>
        <Link href="/admin/timeslots/new">
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            افزودن نوبت جدید
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
              <div className="text-2xl font-bold">{stats?.totalReservations}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل کاربران</CardTitle>
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
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="analytics">تحلیل‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
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
              {recentReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="font-medium">
                          رزرو #{reservation.id.substring(0, 8)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(reservation.createdAt)} • {reservation.timeSlots[0].dormitory === 'dormitory-1' ? 'خوابگاه ۱' : 'خوابگاه ۲'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm capitalize px-2 py-1 rounded-full  text-white dark:text-white
                          ${reservation.status === 'waiting' ? 'bg-[hsl(var(--chart-1))]' :
                            reservation.status === 'washing' ? 'bg-[hsl(var(--chart-2))]' :
                              reservation.status === 'ready' ? 'bg-[hsl(var(--chart-3))]' :
                                reservation.status === 'finished' ? 'bg-[hsl(var(--chart-4))]' : 'bg-gray-400'}
                          `}>
                          {reservation.status === 'waiting' ? 'در انتظار' :
                            reservation.status === 'washing' ? 'در حال شستشو' :
                              reservation.status === 'ready' ? 'آماده' :
                                reservation.status === 'finished' ? 'تحویل داده شده' : reservation.status}
                        </div>
                        <Link href={`/admin/reservations/${reservation.id}`}>
                          <Button variant="default" size="sm">مدیریت</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="text-center mt-4">
                <Link href="/admin/reservations">
                  <Button variant="outline">مشاهده همه رزروها</Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>

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
                      <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}