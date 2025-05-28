"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Search, Filter, Calendar, Clock, User, BookmarkX, BookmarkCheck, AlarmClockCheck, WashingMachine } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

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

export default function AdminReservationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dormitoryFilter, setDormitoryFilter] = useState('all');

  const isMainAdmin = user?.role === 'admin';
  const isDormitoryAdmin = user?.role.startsWith('admin-dormitory');
  const adminDormitory = isDormitoryAdmin ? user?.role.replace('admin-', '') : null;

  useEffect(() => {
    if (isDormitoryAdmin && adminDormitory) {
      setDormitoryFilter(adminDormitory);
    }

    const page = searchParams.get('page');
    const status = searchParams.get('status');
    const dormitory = searchParams.get('dormitory');
    const search = searchParams.get('search');

    if (page) setCurrentPage(parseInt(page));
    if (status) setStatusFilter(status);
    if (dormitory && (isMainAdmin || dormitory === adminDormitory)) setDormitoryFilter(dormitory);
    if (search) setSearchQuery(search);

    loadReservations();
  }, [searchParams, isDormitoryAdmin, adminDormitory]);

  const loadReservations = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (dormitoryFilter !== 'all') {
        params.append('dormitory', dormitoryFilter);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery);
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

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/reservations/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reservation_id: reservationId,
          status: newStatus
        }),
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        toast.success('وضعیت رزرو با موفقیت تغییر کرد');

        setReservations(prevReservations =>
          prevReservations.map((reservation): Reservation =>
            reservation.id === reservationId
              ? { ...reservation, status: newStatus as ReservationStatus }
              : reservation
          )
        );
      } else {
        throw new Error(data.message || 'خطا در تغییر وضعیت');
      }
    } catch (error) {
      console.error('Failed to update reservation status:', error);
      toast.error(error instanceof Error && error.message ? error.message : 'خطا در تغییر وضعیت رزرو');
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
    } else if (filter === 'dormitory') {
      setDormitoryFilter(value);
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

    if (dormitoryFilter !== 'all') {
      params.append('dormitory', dormitoryFilter);
    }

    if (searchQuery.trim()) {
      params.append('search', searchQuery);
    }

    router.push(`/admin/reservations?${params.toString()}`);
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
          <h1 className="text-3xl font-bold tracking-tight">مدیریت رزروها</h1>
          <p className="text-muted-foreground">
            مشاهده و مدیریت تمامی رزروهای سیستم
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="جستجو بر اساس نام یا شماره رزرو"
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
                <Select
                  value={statusFilter}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="washing">در حال شستشو</SelectItem>
                    <SelectItem value="ready">آماده</SelectItem>
                    <SelectItem value="finished">تحویل داده شده</SelectItem>
                    <SelectItem value="cancelled">لغو شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isMainAdmin && (
                <div className="w-40">
                  <Select
                    value={dormitoryFilter}
                    onValueChange={(value) => handleFilterChange('dormitory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="خوابگاه" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه خوابگاه‌ها</SelectItem>
                      <SelectItem value="dormitory-1">خوابگاه ۱</SelectItem>
                      <SelectItem value="dormitory-2">خوابگاه ۲</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                {/* نمایش دسکتاپ */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-center">
                        <TableHead className="text-center">شماره رزرو</TableHead>
                        <TableHead className="text-center">نام و نام خانوادگی</TableHead>
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
                            <TableCell className="text-center">
                              {reservation.user_first_name} {reservation.user_last_name}
                            </TableCell>
                            <TableCell className="text-center">{formatDate(reservation.timeSlots.date || '')}</TableCell>
                            <TableCell className="text-center">
                              {reservation.timeSlots.start_time.toString()} - {reservation.timeSlots.end_time.toString()}
                            </TableCell>
                            <TableCell className="text-center">
                              {reservation.timeSlots.dormitory === 'dormitory-1' ? 'خوابگاه ۱' : 'خوابگاه ۲'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={`${statusStyles[reservation.status].color} justify-center mx-auto`}>
                                <div className="flex items-center justify-center">
                                  {statusStyles[reservation.status].label}
                                  &nbsp;
                                  {statusStyles[reservation.status].icon}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Select
                                  value={reservation.status}
                                  onValueChange={(value) => handleStatusChange(reservation.id, value)}
                                >
                                  <SelectTrigger className="w-[140px] mx-auto">
                                    <SelectValue placeholder="تغییر وضعیت" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">در انتظار</SelectItem>
                                    <SelectItem value="washing">در حال شستشو</SelectItem>
                                    <SelectItem value="ready">آماده</SelectItem>
                                    <SelectItem value="finished">تحویل داده شده</SelectItem>
                                    <SelectItem value="cancelled">لغو شده</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            هیچ رزروی یافت نشد
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* نمایش موبایل */}
                <div className="md:hidden space-y-3 p-3">
                  {reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <Card key={reservation.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">شماره رزرو:</span>
                            <span>#{reservation.id}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="font-medium">نام:</span>
                            <span>{reservation.user_first_name} {reservation.user_last_name}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="font-medium">تاریخ:</span>
                            <span>{formatDate(reservation.timeSlots.date || '')}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="font-medium">ساعت:</span>
                            <span>
                              {reservation.timeSlots.start_time.toString()} - {reservation.timeSlots.end_time.toString()}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="font-medium">خوابگاه:</span>
                            <span>
                              {reservation.timeSlots.dormitory === 'dormitory-1' ? 'خوابگاه ۱' : 'خوابگاه ۲'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="font-medium">وضعیت:</span>
                            <Badge variant="outline" className={`${statusStyles[reservation.status].color} justify-center`}>
                              <div className="flex items-center">
                                {statusStyles[reservation.status].icon}
                                <span className="mr-1">{statusStyles[reservation.status].label}</span>
                              </div>
                            </Badge>
                          </div>

                          <div className="pt-2">
                            <Select
                              value={reservation.status}
                              onValueChange={(value) => handleStatusChange(reservation.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="تغییر وضعیت" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">در انتظار</SelectItem>
                                <SelectItem value="washing">در حال شستشو</SelectItem>
                                <SelectItem value="ready">آماده</SelectItem>
                                <SelectItem value="finished">تحویل داده شده</SelectItem>
                                <SelectItem value="cancelled">لغو شده</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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