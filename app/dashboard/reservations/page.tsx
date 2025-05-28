"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Search, Filter, Calendar, Clock, WashingMachine, AlarmClockCheck, BookmarkCheck, BookmarkX } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

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

export default function UserReservationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const page = searchParams.get('page');
    const status = searchParams.get('status');
    const search = searchParams.get('id');

    if (page) setCurrentPage(parseInt(page));
    if (status) setStatusFilter(status);
    if (search) setSearchQuery(search);

    loadReservations();
  }, [searchParams]);

  const loadReservations = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery.trim()) {
        params.append('id', searchQuery);
      }

      const response = await fetch(`/api/reservations/recent?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        setTotalPages(data.recent.pages || 1);
        setReservations(data.recent.list);
      } else {
        throw new Error(data.message || 'خطا در دریافت اطلاعات');
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      toast.error(error instanceof Error && error.message ? error.message : 'خطا در بارگذاری رزروها');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    updateUrlParams();
    loadReservations();
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
    updateUrlParams();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams(page);
  };

  const updateUrlParams = (page = currentPage) => {
    const params = new URLSearchParams();

    params.append('page', page.toString());

    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }

    if (searchQuery.trim()) {
      params.append('id', searchQuery);
    }

    router.push(`/dashboard/reservations?${params.toString()}`);
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch('/api/reservations/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservation_id: reservationId }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        toast.success('رزرو با موفقیت لغو شد');
        loadReservations();
      } else {
        throw new Error(data.message || 'خطا در لغو رزرو');
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      toast.error(error instanceof Error && error.message ? error.message : 'خطا در لغو رزرو');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            is_active={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}

          {pages}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">رزروهای من</h1>
          <p className="text-muted-foreground">
            مشاهده و پیگیری تمامی رزروهای شما
          </p>
        </div>
        <Link href="/reservations/new">
          <Button>
            <Calendar className="ml-2 h-4 w-4" />
            رزرو جدید
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="جستجو بر اساس شماره رزرو"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4 ml-2" />
                جستجو
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="w-40">
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="pending">در انتظار</option>
                  <option value="washing">در حال شستشو</option>
                  <option value="ready">آماده</option>
                  <option value="finished">تحویل داده شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {/* نمایش دسکتاپ */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow className="text-center">
                      <TableHead className="text-center">شماره رزرو</TableHead>
                      <TableHead className="text-center">تاریخ</TableHead>
                      <TableHead className="text-center">ساعت</TableHead>
                      <TableHead className="text-center">خوابگاه</TableHead>
                      <TableHead className="text-center">وضعیت</TableHead>
                      <TableHead className="text-center">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.length > 0 ? (
                      reservations.map((reservation) => (
                        <TableRow key={reservation.id} className="text-center">
                          <TableCell className="text-center">#{reservation.id}</TableCell>
                          <TableCell className="text-center">{formatDate(reservation.timeSlots.date || '')}</TableCell>
                          <TableCell className="text-center">
                            {reservation.timeSlots.start_time.toString()} - {reservation.timeSlots.end_time.toString()}
                          </TableCell>
                          <TableCell className="text-center">
                            {reservation.timeSlots.dormitory === 'dormitory-1' ? 'خوابگاه ۱' : 'خوابگاه ۲'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`${statusStyles[reservation.status].color} mx-auto justify-center`}>
                              <div className="flex items-center justify-center">
                                {statusStyles[reservation.status].label}
                                &nbsp;
                                {statusStyles[reservation.status].icon}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              {reservation.status === 'pending' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">لغو رزرو</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="text-right">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>آیا از لغو این رزرو مطمئن هستید؟</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        این عملیات غیرقابل بازگشت است. پس از لغو رزرو، امکان بازگرداندن آن وجود ندارد.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex flex-row-reverse justify-start gap-2">
                                      <AlertDialogCancel>انصراف</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleCancelReservation(reservation.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        بله، لغو شود
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          هیچ رزروی یافت نشد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* نمایش موبایل */}
                <div className="md:hidden space-y-4 p-2">
                  {reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <Card key={reservation.id} className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">شماره رزرو</p>
                            <p className="font-medium">#{reservation.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">تاریخ</p>
                            <p className="font-medium">{formatDate(reservation.timeSlots.date || '')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ساعت</p>
                            <p className="font-medium">
                              {reservation.timeSlots.start_time.toString()} - {reservation.timeSlots.end_time.toString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">خوابگاه</p>
                            <p className="font-medium">
                              {reservation.timeSlots.dormitory === 'dormitory-1' ? 'خوابگاه ۱' : 'خوابگاه ۲'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">وضعیت</p>
                            <Badge variant="outline" className={`${statusStyles[reservation.status].color} mt-1`}>
                              <div className="flex items-center">
                                {statusStyles[reservation.status].label}
                                &nbsp;
                                {statusStyles[reservation.status].icon}
                              </div>
                            </Badge>
                          </div>
                          {reservation.status === 'pending' && (
                            <div className="col-span-2 pt-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="w-full">لغو رزرو</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="text-right">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>آیا از لغو این رزرو مطمئن هستید؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      این عملیات غیرقابل بازگشت است. پس از لغو رزرو، امکان بازگرداندن آن وجود ندارد.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex flex-row-reverse justify-start gap-2">
                                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelReservation(reservation.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      بله، لغو شود
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      هیچ رزروی یافت نشد
                    </div>
                  )}
                </div>
              </div>

              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}