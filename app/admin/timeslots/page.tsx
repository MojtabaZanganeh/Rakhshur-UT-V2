"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Calendar, Clock, Users, MoreVertical, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TimePicker } from '@/components/ui/time-picker';

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
    startTime: Date;
    endTime: Date;
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
        // year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
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

export default function AdminTimeSlotsPage() {
    const [timeSlots, setTimeSlots] = useState<TimeSlotsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

                if (response.status === 200) {
                    if (data.success) {
                        setTimeSlots(data.timeslots);
                    }
                    else {
                        throw new Error(data.message);
                    }
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

    const generateTabs = () => {
        if (!timeSlots) return null;

        const dates = Object.keys(timeSlots);

        return (
            <TabsList className="mb-4 flex-wrap h-auto" dir='rtl'>
                <TabsTrigger value="all" onClick={() => setActiveTab('all')} className="px-4 py-2">
                    همه تاریخ‌ها
                </TabsTrigger>
                {dates.map((date) => (
                    <TabsTrigger
                        key={date}
                        value={date}
                        onClick={() => setActiveTab(date)}
                        className="px-4 py-2"
                        dir='rtl'
                    >
                        {formatDate(date)}
                    </TabsTrigger>
                ))}
            </TabsList>
        );
    };

    const handleEdit = (date: string, index: number) => {
        if (!timeSlots) return;

        const slot = timeSlots[date].slots[index];
        setEditingSlot({
            id: slot.id,
            date,
            index,
            startTime: parseTimeString(slot.start_time),
            endTime: parseTimeString(slot.end_time)
        });
    };

    const handleCancel = () => {
        setEditingSlot(null);
    };

    const handleSave = async () => {
        if (!editingSlot || !timeSlots) return;

        try {
            setIsUpdating(true);

            const startTime = formatTimeToString(editingSlot.startTime);
            const endTime = formatTimeToString(editingSlot.endTime);

            const response = await fetch('/api/timeslots/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    slot_id: editingSlot.id,
                    start_time: startTime,
                    end_time: endTime
                }),
            });

            const data = await response.json();

            if (response.status === 200 && data.success) {
                const updatedTimeSlots = { ...timeSlots };
                const slot = updatedTimeSlots[editingSlot.date].slots[editingSlot.index];
                slot.start_time = startTime;
                slot.end_time = endTime;

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
                                <span>{(timeSlots[date].day)} - {formatDate(date)}</span>
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
                                                                value={editingSlot.startTime}
                                                                onChange={(newTime) => setEditingSlot({ ...editingSlot, startTime: newTime })}
                                                            />
                                                        </div>
                                                    ) : slot.start_time}
                                                </TableCell>
                                                <TableCell>
                                                    {editingSlot && editingSlot.date === date && editingSlot.index === index ? (
                                                        <div className="w-32 mx-auto">
                                                            <TimePicker
                                                                value={editingSlot.endTime}
                                                                onChange={(newTime) => setEditingSlot({ ...editingSlot, endTime: newTime })}
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
                                                            value={editingSlot.startTime}
                                                            onChange={(newTime) => setEditingSlot({ ...editingSlot, startTime: newTime })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <p className="text-muted-foreground">زمان پایان</p>
                                                        <TimePicker
                                                            value={editingSlot.endTime}
                                                            onChange={(newTime) => setEditingSlot({ ...editingSlot, endTime: newTime })}
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

            <Tabs defaultValue="all" className="space-y-4">
                {generateTabs()}
                <TabsContent value={activeTab} className="space-y-4">
                    {renderTimeSlots()}
                </TabsContent>
            </Tabs>
        </div>
    );
}