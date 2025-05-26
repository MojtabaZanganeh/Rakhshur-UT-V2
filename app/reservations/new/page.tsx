"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
        // year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

export default function NewReservationPage() {
    const router = useRouter();
    const [timeSlots, setTimeSlots] = useState<TimeSlotsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; slotId: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            <div className="w-full">
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="inline-flex w-max h-auto gap-1 p-1" dir='rtl'>
                        <TabsTrigger value="all" onClick={() => setActiveTab('all')} className="px-4 py-2 whitespace-nowrap">
                            همه تاریخ‌ها
                        </TabsTrigger>
                        {dates.map((date) => (
                            <TabsTrigger
                                key={date}
                                value={date}
                                onClick={() => setActiveTab(date)}
                                className="px-4 py-2 whitespace-nowrap"
                            >
                                {formatDate(date)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </ScrollArea>
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
                router.push('/dashboard');
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
                                <span>{timeSlots[date].day} - {formatDate(date)}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" dir="rtl">
                                {timeSlots[date].slots.map((slot) => (
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

            <Tabs defaultValue="all" className="space-y-4">
                {generateTabs()}
                <TabsContent value={activeTab} className="space-y-4">
                    {renderTimeSlots()}
                </TabsContent>
            </Tabs>
        </div>
    );
}