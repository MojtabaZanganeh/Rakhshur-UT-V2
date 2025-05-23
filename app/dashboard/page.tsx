"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { fetchUserReservations } from '@/lib/api';
import { Reservation } from '@/types/reservation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles = {
  waiting: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: <Clock className="h-4 w-4 mr-1" />,
    label: 'Waiting'
  },
  washing: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: <Calendar className="h-4 w-4 mr-1" />,
    label: 'Washing'
  },
  ready: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
    label: 'Ready for pickup'
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const data = await fetchUserReservations();
        setReservations(data.reservations);
      } catch (error) {
        console.error('Error loading reservations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReservations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
        </div>
        <Link href="/reservations/new">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            New Reservation
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
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
            <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {reservations.filter(r => r.status === 'waiting' || r.status === 'washing').length}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
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
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Reservations</h2>
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
                        <div className="font-medium">
                          Reservation #{reservation.id.substring(0, 8)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.timeSlots.length} slot(s) • Created on {formatDate(reservation.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={status.color}>
                          <div className="flex items-center">
                            {status.icon}
                            {status.label}
                          </div>
                        </Badge>
                        <Link href={`/reservations/${reservation.id}`}>
                          <Button variant="ghost" size="sm">View details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {reservations.length > 5 && (
              <div className="text-center mt-4">
                <Link href="/reservations">
                  <Button variant="outline">View All Reservations</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">No reservations yet</CardTitle>
              <CardDescription className="text-center mb-4">
                You haven't made any laundry reservations yet. Create your first reservation to get started.
              </CardDescription>
              <Link href="/reservations/new">
                <Button>Create Reservation</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}