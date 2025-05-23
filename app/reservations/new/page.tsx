"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-provider';
import { fetchTimeSlots, reserveTimeSlots } from '@/lib/api';
import { TimeSlot } from '@/types/reservation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

const timeSlotSchema = z.object({
  timeSlotIds: z.array(z.string()).min(1, {
    message: "You must select at least one time slot",
  }),
});

type TimeSlotFormValues = z.infer<typeof timeSlotSchema>;

export default function NewReservationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDormitory, setSelectedDormitory] = useState<string>('');
  const { user } = useAuth();
  const router = useRouter();

  // Group time slots by date
  const timeSlotsByDate = timeSlots.reduce((acc, slot) => {
    const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Sort dates
  const sortedDates = Object.keys(timeSlotsByDate).sort();

  const form = useForm<TimeSlotFormValues>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      timeSlotIds: [],
    },
  });

  useEffect(() => {
    if (user) {
      setSelectedDormitory(user.dormitory);
    }
  }, [user]);

  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedDormitory) return;
      
      try {
        setIsLoading(true);
        const data = await fetchTimeSlots(selectedDormitory);
        setTimeSlots(data.timeSlots);
      } catch (error) {
        console.error('Error loading time slots:', error);
        toast.error('Failed to load available time slots');
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeSlots();
    
    // Simulating API response for preview purposes
    setTimeout(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const mockTimeSlots: TimeSlot[] = [];
      
      // Add some time slots for today
      for (let hour = 14; hour < 20; hour++) {
        const startTime = new Date(now);
        startTime.setHours(hour, hour % 2 === 0 ? 30 : 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 30);
        
        mockTimeSlots.push({
          id: `today-${hour}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          dormitory: selectedDormitory,
          isAvailable: Math.random() > 0.3, // Some slots are unavailable
        });
      }
      
      // Add some time slots for tomorrow
      for (let hour = 8; hour < 20; hour++) {
        const startTime = new Date(tomorrow);
        startTime.setHours(hour, hour % 2 === 0 ? 0 : 30, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 30);
        
        mockTimeSlots.push({
          id: `tomorrow-${hour}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          dormitory: selectedDormitory,
          isAvailable: Math.random() > 0.2, // More available slots for tomorrow
        });
      }
      
      setTimeSlots(mockTimeSlots);
      setIsLoading(false);
    }, 1000);
  }, [selectedDormitory]);

  const onSubmit = async (values: TimeSlotFormValues) => {
    try {
      setIsSubmitting(true);
      await reserveTimeSlots(values.timeSlotIds);
      toast.success('Reservation created successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    const start = parseISO(slot.startTime);
    const end = parseISO(slot.endTime);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const handleTimeSlotToggle = (slotId: string) => {
    const currentSelections = form.getValues().timeSlotIds;
    if (currentSelections.includes(slotId)) {
      form.setValue(
        'timeSlotIds',
        currentSelections.filter((id) => id !== slotId)
      );
    } else {
      form.setValue('timeSlotIds', [...currentSelections, slotId]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
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
        <h1 className="text-3xl font-bold tracking-tight">New Reservation</h1>
      </div>

      <div className="mb-6">
        <RadioGroup
          defaultValue={user?.dormitory}
          className="flex flex-col space-y-1"
          value={selectedDormitory}
          onValueChange={setSelectedDormitory}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dormitory-1" id="dormitory-1" />
            <Label htmlFor="dormitory-1">Dormitory 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dormitory-2" id="dormitory-2" />
            <Label htmlFor="dormitory-2">Dormitory 2</Label>
          </div>
        </RadioGroup>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
          <CardDescription>
            Select one or more 30-minute time slots for your laundry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[50px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No time slots available</h3>
              <p className="text-muted-foreground">
                There are currently no available time slots for this dormitory.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {sortedDates.length > 0 ? (
                  <Tabs defaultValue={sortedDates[0]} className="w-full">
                    <TabsList className="mb-4 w-full flex flex-wrap h-auto gap-2">
                      {sortedDates.map(date => (
                        <TabsTrigger key={date} value={date} className="flex-grow">
                          {formatDate(date)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {sortedDates.map(date => (
                      <TabsContent key={date} value={date} className="border rounded-md p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {timeSlotsByDate[date].map(slot => (
                            <div 
                              key={slot.id}
                              className={`p-3 rounded-md border flex items-center gap-2 ${
                                !slot.isAvailable ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer hover:border-primary'
                              }`}
                              onClick={() => {
                                if (slot.isAvailable) {
                                  handleTimeSlotToggle(slot.id);
                                }
                              }}
                            >
                              <Checkbox 
                                id={slot.id}
                                checked={form.getValues().timeSlotIds.includes(slot.id)}
                                onCheckedChange={() => {
                                  if (slot.isAvailable) {
                                    handleTimeSlotToggle(slot.id);
                                  }
                                }}
                                disabled={!slot.isAvailable}
                              />
                              <Label 
                                htmlFor={slot.id}
                                className={`flex-grow ${!slot.isAvailable ? 'line-through' : ''}`}
                              >
                                {formatTimeSlot(slot)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium">No time slots available</h3>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || form.getValues().timeSlotIds.length === 0}
                >
                  {isSubmitting ? 'Creating reservation...' : 'Create Reservation'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <p className="text-sm text-muted-foreground">
            Selected: {form.watch('timeSlotIds').length} time slots
          </p>
          <p className="text-sm font-medium">
            Total: {form.watch('timeSlotIds').length * 10000} IRR
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}