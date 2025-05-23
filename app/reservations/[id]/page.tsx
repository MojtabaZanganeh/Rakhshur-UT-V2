"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api';
import { Reservation } from '@/types/reservation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

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

export default function ReservationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReservation = async () => {
      try {
        const data = await fetchApi<{ reservation: Reservation }>(`/reservations/${params.id}`);
        setReservation(data.reservation);
      } catch (error) {
        console.error('Error loading reservation:', error);
        toast.error('Failed to load reservation details');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadReservation();
    }
    
    // Simulating API response for preview purposes
    setTimeout(() => {
      const now = new Date();
      
      const mockReservation: Reservation = {
        id: params.id as string,
        userId: 'user-123',
        timeSlots: [
          {
            id: 'slot-1',
            startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            endTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours from now
            dormitory: 'dormitory-1',
            isAvailable: false,
          },
          {
            id: 'slot-2',
            startTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours from now
            endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
            dormitory: 'dormitory-1',
            isAvailable: false,
          },
        ],
        status: 'waiting',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        paymentStatus: 'completed',
      };
      
      setReservation(mockReservation);
      setIsLoading(false);
    }, 1000);
  }, [params.id, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  };

  const formatTimeSlot = (startTime: string, endTime: string) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const cancelReservation = async () => {
    try {
      await fetchApi(`/reservations/${params.id}`, {
        method: 'DELETE',
      });
      toast.success('Reservation cancelled successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Failed to cancel reservation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Reservation Details</h1>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-[120px] w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ) : reservation ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Reservation #{reservation.id.substring(0, 8)}</CardTitle>
                <CardDescription>
                  Created on {formatDate(reservation.createdAt)}
                </CardDescription>
              </div>
              <Badge className={statusStyles[reservation.status].color}>
                <div className="flex items-center">
                  {statusStyles[reservation.status].icon}
                  {statusStyles[reservation.status].label}
                </div>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Time Slots</h3>
              <div className="space-y-2">
                {reservation.timeSlots.map((slot) => (
                  <div key={slot.id} className="p-3 border rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">
                          {formatDate(slot.startTime)}
                        </div>
                        <div>
                          {formatTimeSlot(slot.startTime, slot.endTime)}
                        </div>
                      </div>
                      <div>
                        <Badge variant="outline">
                          {slot.dormitory === 'dormitory-1' ? 'Dormitory 1' : 'Dormitory 2'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Status</h3>
                <div className="font-medium capitalize">
                  {reservation.paymentStatus}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Amount</h3>
                <div className="font-medium">
                  {reservation.timeSlots.length * 10000} IRR
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Status Timeline</h3>
              <ol className="relative border-l border-muted mt-3 ml-3">
                <li className="mb-4 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                  <h3 className="font-medium">Reservation Created</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(reservation.createdAt)} at {formatTime(reservation.createdAt)}
                  </p>
                </li>
                <li className="mb-4 ml-6">
                  <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ${
                    reservation.status === 'waiting' || reservation.status === 'washing' || reservation.status === 'ready'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {reservation.status === 'waiting' || reservation.status === 'washing' || reservation.status === 'ready'
                      ? <CheckCircle2 className="w-3 h-3" />
                      : <Clock className="w-3 h-3" />
                    }
                  </span>
                  <h3 className="font-medium">Laundry Received</h3>
                  <p className="text-sm text-muted-foreground">
                    {reservation.status === 'waiting' || reservation.status === 'washing' || reservation.status === 'ready'
                      ? 'Your laundry has been received'
                      : 'Waiting for your laundry'
                    }
                  </p>
                </li>
                <li className="mb-4 ml-6">
                  <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ${
                    reservation.status === 'washing' || reservation.status === 'ready'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {reservation.status === 'washing' || reservation.status === 'ready'
                      ? <CheckCircle2 className="w-3 h-3" />
                      : <Clock className="w-3 h-3" />
                    }
                  </span>
                  <h3 className="font-medium">Washing in Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {reservation.status === 'washing' || reservation.status === 'ready'
                      ? 'Your laundry is being washed'
                      : 'Waiting to start washing'
                    }
                  </p>
                </li>
                <li className="ml-6">
                  <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ${
                    reservation.status === 'ready'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {reservation.status === 'ready'
                      ? <CheckCircle2 className="w-3 h-3" />
                      : <Clock className="w-3 h-3" />
                    }
                  </span>
                  <h3 className="font-medium">Ready for Pickup</h3>
                  <p className="text-sm text-muted-foreground">
                    {reservation.status === 'ready'
                      ? 'Your laundry is ready for pickup'
                      : 'Not ready yet'
                    }
                  </p>
                </li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            {reservation.status === 'waiting' && (
              <Button variant="destructive" className="w-full" onClick={cancelReservation}>
                Cancel Reservation
              </Button>
            )}
            {reservation.status !== 'waiting' && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-semibold mb-2">Reservation not found</h2>
            <p className="text-muted-foreground mb-4">
              The reservation you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}