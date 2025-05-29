"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Calendar, Clock, Users, MoreVertical, Loader2, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TimePicker } from '@/components/ui/time-picker';
import JalaliDatePicker from '@/components/ui/date-picker';
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import { formatDate } from '@/lib/format-data';

type TimeSlot = {
    id: string;
    start_time: string;
    end_time: string;
    capacity_left: number;
};

type DayData = {
    day: string;
    slots: TimeSlot[];
};

type TimeSlotsData = {
    [date: string]: DayData;
};

type EditingSlot = {
    id: string;
    date: string;
    index: number;
    start_time: Date;
    end_time: Date;
};

const parseTimeString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

const formatTimeToString = (date: Date): string => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const jalaliToGregorian = (jalaliDate: string): Date | null => {
    try {
        const parts = jalaliDate.split('/');
        if (parts.length !== 3) return null;

        const dateObj = new DateObject({
            date: jalaliDate,
            format: "YYYY/MM/DD",
            calendar: persian
        });

        const gregorianDate = dateObj.convert(persian).toDate();
        return gregorianDate;
    } catch (error) {
        console.error('Error converting date:', error);
        return null;
    }
};

function gregorianToJalali(date: Date): string | null {
    try {
        const dateObj = new DateObject({
            date,
            calendar: persian
        });
        return dateObj.format("YYYY/MM/DD");
    } catch (error) {
        console.error('Error converting date to Jalali:', error);
        return null;
    }
}

export const dynamic = 'force-dynamic';

export default function AdminTimeSlotsPage() {
    const [timeSlots, setTimeSlots] = useState<TimeSlotsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        const fetchTimeSlots = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/timeslots/get', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                const data = await response.json();

                if (response.status === 200 && data.success) {
                    setTimeSlots(data.timeslots);
                }
                else {
                    throw new Error(data.message);
                }

            } catch (error) {
                console.error('Failed to fetch timeslots:', error);
                toast.error(error instanceof Error && error.message ? error.message : 'خطا در بارگذاری نوبت‌ها');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimeSlots();
    }, []);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);

        if (!date || !timeSlots) {
            setActiveTab('all');
            return;
        }

        const formatDateToLocalDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formatDateToISO = (dateString: string): string => {
            return new Date(dateString).toISOString().split('T')[0];
        };
        const gregorianDate = jalaliToGregorian(date);
        if (!gregorianDate) {
            toast.error('تاریخ نامعتبر است');
            setActiveTab('all');
            return;
        }

        const isoDate = formatDateToLocalDate(gregorianDate);
        const availableDates = Object.keys(timeSlots);

        const matchingDate = availableDates.find(d => formatDateToISO(d) === isoDate);

        if (matchingDate) {
            setActiveTab(matchingDate);
        } else {
            setActiveTab('all');
            toast.error('برای تاریخ انتخاب شده نوبتی وجود ندارد');
        }
    };

    const calculateActiveDaysOfJalaliYear = () => {
        if (!timeSlots) return [];

        const activeDaysSet = new Set<number>();

        Object.keys(timeSlots).forEach(dateStr => {
            const gregorianDate = new Date(dateStr);
            const jalaliDate = gregorianToJalali(gregorianDate);
            if (jalaliDate) {
                const dayOfYear = getJalaliDayOfYear(jalaliDate);
                activeDaysSet.add(dayOfYear);
            }
        });

        return Array.from(activeDaysSet);
    };

    function getJalaliDayOfYear(jalaliDateStr: string): number {
        try {
            const dateObj = new DateObject({
                date: jalaliDateStr,
                format: "YYYY/MM/DD",
                calendar: persian
            });
            return dateObj.dayOfYear;
        } catch (error) {
            console.error('Error calculating day of year:', error);
            return 0;
        }
    }

    const generateTabs = () => {
        if (!timeSlots) return null;

        const activeDays = calculateActiveDaysOfJalaliYear();

        return (
            <div className="grid grid-flow-row-dense md:grid-flow-col-dense place-content-end items-stretch gap-3 mb-6" dir="rtl">
                <div>
                    <JalaliDatePicker
                        selected={selectedDate}
                        onChange={handleDateSelect}
                        mapDays={activeDays}
                        className='w-full pr-10 p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all'
                    />
                </div>

                <Button
                    variant={activeTab === 'all' ? 'secondary' : 'outline'}
                    onClick={() => setActiveTab('all')}
                    className={`whitespace-nowrap h-[50px] py-2 px-4 rounded-lg transition-all ${activeTab === 'all' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                >
                    <CalendarDays className="w-5 h-5 ml-2" />
                    نمایش همه تاریخ‌ها
                </Button>
            </div>
        );
    };

    const handleEdit = (date: string, index: number) => {
        if (!timeSlots) return;

        const slot = timeSlots[date].slots[index];
        setEditingSlot({
            id: slot.id,
            date,
            index,
            start_time: parseTimeString(slot.start_time),
            end_time: parseTimeString(slot.end_time)
        });
    };

    const handleCancel = () => {
        setEditingSlot(null);
    };

    const handleSave = async () => {
        if (!editingSlot || !timeSlots) return;

        try {
            setIsUpdating(true);

            const start_time = formatTimeToString(editingSlot.start_time);
            const end_time = formatTimeToString(editingSlot.end_time);

            const response = await fetch('/api/timeslots/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    slot_id: editingSlot.id,
                    start_time: start_time,
                    end_time: end_time
                }),
            });

            const data = await response.json();

            if (response.status === 200 && data.success) {
                const updatedTimeSlots = { ...timeSlots };
                const slot = updatedTimeSlots[editingSlot.date].slots[editingSlot.index];
                slot.start_time = start_time;
                slot.end_time = end_time;

                setTimeSlots(updatedTimeSlots);
                setEditingSlot(null);
                toast.success('نوبت با موفقیت به‌روزرسانی شد');
            } else {
                throw new Error(data.message || 'خطا در به‌روزرسانی نوبت');
            }
        } catch (error) {
            console.error('Failed to update timeslot:', error);
            toast.error(error instanceof Error && error.message ? error.message : 'خطا در به‌روزرسانی نوبت');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (slot_id: string) => {
        try {
            setIsDeleting(slot_id);

            const response = await fetch('/api/timeslots/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ slot_id }),
            });

            const data = await response.json();

            if (response.status === 200 && data.success) {

                const updatedTimeSlots = { ...timeSlots };

                Object.keys(updatedTimeSlots).forEach(date => {
                    updatedTimeSlots[date].slots = updatedTimeSlots[date].slots.filter(slot => slot.id !== slot_id);

                    if (updatedTimeSlots[date].slots.length === 0) {
                        delete updatedTimeSlots[date];
                    }
                });

                setTimeSlots(updatedTimeSlots);
                toast.success('نوبت با موفقیت حذف شد');
            } else {
                throw new Error(data.message || 'خطا در حذف نوبت');
            }
        } catch (error) {
            console.error('Failed to delete timeslot:', error);
            toast.error(error instanceof Error && error.message ? error.message : 'خطا در حذف نوبت');
        } finally {
            setIsDeleting(null);
        }
    };

    const renderTimeSlots = () => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                </div>
            );
        }

        if (!timeSlots || Object.keys(timeSlots).length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">هیچ نوبتی یافت نشد</p>
                    <Link href="/admin/timeslots/new" className="mt-4 inline-block">
                        <Button className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            افزودن نوبت جدید
                        </Button>
                    </Link>
                </div>
            );
        }

        const dates = Object.keys(timeSlots);
        const filteredDates = activeTab === 'all' ? dates : [activeTab];

        return (
            <div className="space-y-4">
                {filteredDates.map((date) => (
                    <Card key={date} className="overflow-hidden border border-gray-200 dark:border-gray-700">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4" dir="rtl">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span>{(timeSlots[date].day)} - {formatDate(date, { month: 'long', day: 'numeric' })}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">

                            <div className="hidden md:block">
                                <Table className="[&_th]:text-center [&_td]:text-center" dir='rtl'>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]">ردیف</TableHead>
                                            <TableHead className="min-w-[100px]">زمان شروع</TableHead>
                                            <TableHead className="min-w-[100px]">زمان پایان</TableHead>
                                            <TableHead className="min-w-[120px]">ظرفیت</TableHead>
                                            <TableHead className="w-[120px]">عملیات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {timeSlots[date].slots.map((slot, index) => (
                                            <TableRow key={`${date}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>
                                                    {editingSlot && editingSlot.date === date && editingSlot.index === index ? (
                                                        <div className="w-32 mx-auto">
                                                            <TimePicker
                                                                value={editingSlot.start_time}
                                                                onChange={(newTime) => setEditingSlot({ ...editingSlot, start_time: newTime })}
                                                            />
                                                        </div>
                                                    ) : slot.start_time}
                                                </TableCell>
                                                <TableCell>
                                                    {editingSlot && editingSlot.date === date && editingSlot.index === index ? (
                                                        <div className="w-32 mx-auto">
                                                            <TimePicker
                                                                value={editingSlot.end_time}
                                                                onChange={(newTime) => setEditingSlot({ ...editingSlot, end_time: newTime })}
                                                            />
                                                        </div>
                                                    ) : slot.end_time}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className={slot.capacity_left === 0 ? 'text-red-500 dark:text-red-400' : ''}>
                                                            {slot.capacity_left}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center gap-2">
                                                        {editingSlot && editingSlot.date === date && editingSlot.index === index ? (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={handleCancel}
                                                                    disabled={isUpdating}
                                                                >
                                                                    انصراف
                                                                </Button>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={handleSave}
                                                                    disabled={isUpdating}
                                                                >
                                                                    {isUpdating ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : 'ذخیره'}
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(date, index)}
                                                                >
                                                                    ویرایش
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(slot.id)}
                                                                    disabled={isDeleting === slot.id}
                                                                >
                                                                    {isDeleting === slot.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : 'حذف'}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="md:hidden space-y-3 p-3" dir="rtl">
                                {timeSlots[date].slots.map((slot, index) => (
                                    <div key={`mobile-${date}-${index}`} className="border rounded-lg p-3" dir="rtl">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium pt-1">نوبت {index + 1}</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="ml-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="text-right min-w-[120px]">
                                                    <DropdownMenuItem
                                                        className="justify-end px-4 py-2"
                                                        onClick={() => handleEdit(date, index)}
                                                    >
                                                        ویرایش
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="justify-end px-4 py-2 text-red-600"
                                                        onClick={() => handleDelete(slot.id)}
                                                    >
                                                        حذف
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {editingSlot && editingSlot.date === date && editingSlot.index === index ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="space-y-1 text-right">
                                                        <p className="text-muted-foreground">زمان شروع</p>
                                                        <TimePicker
                                                            value={editingSlot.start_time}
                                                            onChange={(newTime) => setEditingSlot({ ...editingSlot, start_time: newTime })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <p className="text-muted-foreground">زمان پایان</p>
                                                        <TimePicker
                                                            value={editingSlot.end_time}
                                                            onChange={(newTime) => setEditingSlot({ ...editingSlot, end_time: newTime })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2 mt-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCancel}
                                                        disabled={isUpdating}
                                                    >
                                                        انصراف
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={handleSave}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : 'ذخیره'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-1 text-right">
                                                    <p className="text-muted-foreground">زمان شروع</p>
                                                    <p className="font-medium">{slot.start_time}</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <p className="text-muted-foreground">زمان پایان</p>
                                                    <p className="font-medium">{slot.end_time}</p>
                                                </div>
                                                <div className="space-y-1 text-right col-span-2">
                                                    <p className="text-muted-foreground">ظرفیت باقیمانده:
                                                        <span className={`mr-1 ${slot.capacity_left === 0 ? 'text-red-500 dark:text-red-400' : 'font-medium'}`}>
                                                            {slot.capacity_left} نفر
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold">مدیریت نوبت‌ها</h1>
                    <p className="text-muted-foreground text-sm">
                        مشاهده و مدیریت نوبت‌های تعریف شده
                    </p>
                </div>
                <Link href="/admin/timeslots/new">
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        افزودن نوبت جدید
                    </Button>
                </Link>
            </div>

            <Tabs value={activeTab} className="space-y-4">
                {generateTabs()}
                <TabsContent value={activeTab} className="space-y-4">
                    {renderTimeSlots()}
                </TabsContent>
            </Tabs>
        </div>
    );
}