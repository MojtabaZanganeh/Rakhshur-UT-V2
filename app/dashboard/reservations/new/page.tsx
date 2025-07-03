"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, ArrowLeft, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import JalaliDatePicker from '@/components/ui/date-picker';
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import { formatDate } from '@/lib/format-date';

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

export default function NewReservationPage() {
    const router = useRouter();
    const [timeSlots, setTimeSlots] = useState<TimeSlotsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; slotId: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                    const availableSlots: TimeSlotsData = {};

                    Object.keys(data.timeslots).forEach(date => {
                        const dayData = data.timeslots[date];
                        const availableSlotsForDay = dayData.slots.filter((slot: { capacity_left: number; }) => slot.capacity_left > 0);

                        if (availableSlotsForDay.length > 0) {
                            availableSlots[date] = {
                                ...dayData,
                                slots: availableSlotsForDay
                            };
                        }
                    });

                    setTimeSlots(availableSlots);
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
            <div className="flex flex-row justify-end items-stretch gap-3 mb-6" dir="rtl">
                <div>
                    <JalaliDatePicker
                        selected={selectedDate}
                        onChange={handleDateSelect}
                        mapDays={activeDays}
                        className='pr-10 p-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all'
                    />
                </div>

                <Button
                    variant={activeTab === 'all' ? 'secondary' : 'outline'}
                    onClick={() => setActiveTab('all')}
                    className={`whitespace-nowrap h-auto py-2 px-4 rounded-lg transition-all ${activeTab === 'all' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                >
                    <CalendarDays className="w-5 h-5 ml-2" />
                    نمایش همه تاریخ‌ها
                </Button>
            </div>
        );
    };

    const handleReservation = async () => {
        if (!selectedSlot) {
            toast.error('لطفاً یک نوبت را انتخاب کنید');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/reservations/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    slot_id: selectedSlot.slotId,
                }),
            });

            const data = await response.json();

            if (response.status === 200 && data.success) {
                toast.success('نوبت با موفقیت رزرو شد');
                router.push('/dashboard/reservations');
            } else {
                throw new Error(data.message || 'خطا در رزرو نوبت');
            }
        } catch (error) {
            console.error('Failed to reserve timeslot:', error);
            toast.error(error instanceof Error && error.message ? error.message : 'خطا در رزرو نوبت');
        } finally {
            setIsSubmitting(false);
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
                    <p className="text-muted-foreground">هیچ نوبت خالی یافت نشد</p>
                    <Link href="/dashboard" className="mt-4 inline-block">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            بازگشت به داشبورد
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
                                <span>{timeSlots[date].day} - {formatDate(date, { month: 'long', day: 'numeric' })}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" dir="rtl">
                                {timeSlots[date].slots && timeSlots[date].slots.length > 0 ? (
                                    timeSlots[date].slots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedSlot?.slotId === slot.id ? 'border-primary bg-primary/5' : 'hover:border-gray-400 dark:hover:border-gray-500'}`}
                                            onClick={() => setSelectedSlot({ date, slotId: slot.id })}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{slot.capacity_left} نفر</span>
                                                </div>
                                            </div>
                                            {selectedSlot?.slotId === slot.id && (
                                                <div className="text-xs text-primary text-left">
                                                    انتخاب شده
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center text-muted-foreground">هیچ نوبتی برای این تاریخ وجود ندارد</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold">رزرو نوبت جدید</h1>
                    <p className="text-muted-foreground text-sm">
                        از بین نوبت‌های موجود، زمان مورد نظر خود را انتخاب کنید
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            انصراف
                        </Button>
                    </Link>
                    <Button
                        onClick={handleReservation}
                        disabled={!selectedSlot || isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting ? 'در حال ثبت...' : 'ثبت رزرو'}
                    </Button>
                </div>
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