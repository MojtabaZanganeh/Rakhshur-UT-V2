'use client'

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Check, X, Users, ArrowRight, Clock, CalendarDays, ClipboardCheck, AlertCircle, ListChecks, ArrowLeft } from 'lucide-react';
import JalaliDatePicker from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { TimeSlot, ValidationErrors } from '@/types/reservation';
import toast from 'react-hot-toast';

export default function AddTimeSlotPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFromDate, setSelectedFromDate] = useState('');
  const [selectedToDate, setSelectedToDate] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedSpecificDate, setSelectedSpecificDate] = useState('');
  const [start_time, setStartTime] = useState(new Date(2025, 0, 1, 14, 0));
  const [end_time, setEndTime] = useState(new Date(2025, 0, 1, 18, 0));
  const [defaultCapacity, setDefaultCapacity] = useState(1);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isWeeklyMode, setIsWeeklyMode] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekDays = [
    { key: 'saturday', label: 'شنبه' },
    { key: 'sunday', label: 'یکشنبه' },
    { key: 'monday', label: 'دوشنبه' },
    { key: 'tuesday', label: 'سه‌شنبه' },
    { key: 'wednesday', label: 'چهارشنبه' },
    { key: 'thursday', label: 'پنج‌شنبه' },
    { key: 'friday', label: 'جمعه' }
  ];

  const validateTimeRange = (): boolean => {
    const newErrors: ValidationErrors = {};
    const startMinutes = start_time.getHours() * 60 + start_time.getMinutes();
    const endMinutes = end_time.getHours() * 60 + end_time.getMinutes();
    const difference = endMinutes - startMinutes;

    if (difference <= 0) {
      newErrors.end_time = 'زمان پایان باید بعد از زمان شروع باشد';
    } else if (difference < 30) {
      newErrors.end_time = 'حداقل فاصله زمانی ۳۰ دقیقه باید باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCustomSlot = (start_time: Date, end_time: Date): string | null => {
    const startMinutes = start_time.getHours() * 60 + start_time.getMinutes();
    const endMinutes = end_time.getHours() * 60 + end_time.getMinutes();
    const difference = endMinutes - startMinutes;

    if (difference <= 0) {
      return 'زمان پایان باید بعد از زمان شروع باشد';
    } else if (difference < 30) {
      return 'حداقل فاصله زمانی ۳۰ دقیقه باید باشد';
    }

    return null;
  };

  const generateTimeSlots = () => {
    if (!validateTimeRange()) return;

    const slots: TimeSlot[] = [];
    const start = start_time.getHours() * 60 + start_time.getMinutes();
    const end = end_time.getHours() * 60 + end_time.getMinutes();

    for (let minutes = start; minutes < end; minutes += 30) {
      const startHour = Math.floor(minutes / 60);
      const startMin = minutes % 60;
      const endHour = Math.floor((minutes + 30) / 60);
      const endMin = (minutes + 30) % 60;

      const start_timeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      const end_timeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      slots.push({
        id: `slot-${minutes}`,
        start_time: start_timeStr,
        end_time: end_timeStr,
        is_active: true,
        is_custom: false,
        capacity: defaultCapacity
      });
    }

    setTimeSlots(slots);
    setCurrentStep(3);
  };

  const toggleSlot = (id: string) => {
    setTimeSlots(prev => prev.map(slot =>
      slot.id === id ? { ...slot, is_active: !slot.is_active } : slot
    ));
  };

  const deleteCustomSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const addCustomSlot = () => {
    const newSlot: TimeSlot = {
      id: `custom-${Date.now()}`,
      start_time: new Date(2025, 0, 1, 9, 0),
      end_time: new Date(2025, 0, 1, 9, 30),
      is_active: true,
      is_custom: true,
      capacity: defaultCapacity
    }
    setTimeSlots(prev => [...prev, newSlot]);
  };

  const updateCustomSlot = (id: string, field: 'start_time' | 'end_time' | 'capacity', value: Date | number) => {
    setTimeSlots(prev => prev.map(slot => {
      if (slot.id === id) {
        const updatedSlot = { ...slot, [field]: value };

        if (field === 'start_time' || field === 'end_time') {
          const start_time = field === 'start_time' ? value as Date : slot.start_time as Date;
          const end_time = field === 'end_time' ? value as Date : slot.end_time as Date;

          const validationError = validateCustomSlot(start_time, end_time);
          if (validationError) {
            setErrors(prev => ({ ...prev, [`${id}-${field}`]: validationError }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[`${id}-start_time`];
              delete newErrors[`${id}-end_time`];
              return newErrors;
            })
          }
        }

        return updatedSlot
      }
      return slot
    }));
  };

  const updateSlotCapacity = (id: string, capacity: number) => {
    setTimeSlots(prev => prev.map(slot =>
      slot.id === id ? { ...slot, capacity: Math.max(1, capacity) } : slot
    ));
  };

  const formatTimeForDisplay = (time: string | Date): string => {
    if (typeof time === 'string') return time;
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  };

  const saveShift = async () => {
    setIsSubmitting(true);

    try {
      const slotsData = {
        dateRange: {
          isWeeklyMode,
          fromDate: selectedFromDate,
          toDate: selectedToDate,
          specificDate: selectedSpecificDate,
          selectedDays: selectedDates
        },
        timeSlots: timeSlots
          .filter(slot => slot.is_active)
          .map(slot => ({
            id: slot.id,
            start_time: formatTimeForDisplay(slot.start_time),
            end_time: formatTimeForDisplay(slot.end_time),
            capacity: slot.capacity,
            is_custom: slot.is_custom
          })),
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/timeslots/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slotsData }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        toast.success('نوبت ها با موفقیت ثبت شد');
        setCurrentStep(5);
      }
      else {
        throw new Error(data.message || 'خطا در ذخیره نوبت‌ها');
      }

    } catch (error) {

      toast.error(error instanceof Error && error.message ? error.message : 'خطای نامشخص در ذخیره اطلاعات');

    } finally {
      setIsSubmitting(false);
    }
  };

  const StepDateSelection = () => (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          گام ۱: انتخاب روز
        </h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-inner">
          <button
            onClick={() => setIsWeeklyMode(false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isWeeklyMode
              ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
          >
            تاریخ خاص
          </button>
          <button
            onClick={() => setIsWeeklyMode(true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isWeeklyMode
              ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
          >
            روزهای هفته
          </button>
        </div>
      </div>

      {isWeeklyMode ? (
        <div>
          <div className="flex items-center gap-12 mb-6">
            <JalaliDatePicker
              selected={selectedFromDate}
              onChange={setSelectedFromDate}
              label="از تاریخ"
            />
            <JalaliDatePicker
              selected={selectedToDate}
              onChange={setSelectedToDate}
              label="تا تاریخ"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {weekDays.map(day => (
              <label
                key={day.key}
                className={`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${selectedDates.includes(day.key)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <span className="font-medium dark:text-gray-200">{day.label}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="absolute opacity-0"
                    checked={selectedDates.includes(day.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDates(prev => [...prev, day.key])
                      } else {
                        setSelectedDates(prev => prev.filter(d => d !== day.key))
                      }
                    }}
                  />

                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${selectedDates.includes(day.key)
                      ? 'bg-blue-500'
                      : 'border-2 border-gray-300 dark:border-gray-500'
                      }`}
                  >
                    {selectedDates.includes(day.key) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-12 mb-6">
          <JalaliDatePicker
            selected={selectedSpecificDate}
            onChange={setSelectedSpecificDate}
            label="انتخاب تاریخ"
          />
        </div>
      )}

      <button
        onClick={() => setCurrentStep(2)}
        disabled={isWeeklyMode ? selectedDates.length === 0 : !selectedSpecificDate}
        className={`w-full py-3 rounded-xl font-medium text-white transition-all ${isWeeklyMode
          ? selectedDates.length === 0
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          : !selectedSpecificDate
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        مرحله بعد
        <ArrowLeft className="w-4 h-4 inline-block mr-2" />
      </button>
    </div>
  );

  const StepTimeRange = () => (
    <div className="space-y-6 text-right" dir="rtl">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        گام ۲: انتخاب بازه زمانی کلی
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="mb-2 text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>ساعت شروع</span>
          </Label>
          <TimePicker
            value={start_time}
            onChange={(time: Date) => {
              setStartTime(time)
              setErrors(prev => ({ ...prev, start_time: '', end_time: '' }))
            }}
            className="w-full"
          />
          {errors.start_time && (
            <p className="mt-1 text-sm text-red-600 text-right flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.start_time}
            </p>
          )}
        </div>
        <div>
          <Label className="mb-2 text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>ساعت پایان</span>
          </Label>
          <TimePicker
            value={end_time}
            onChange={(time: Date) => {
              setEndTime(time)
              setErrors(prev => ({ ...prev, end_time: '' }))
            }}
            className="w-full"
          />
          {errors.end_time && (
            <p className="mt-1 text-sm text-red-600 text-right flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.end_time}
            </p>
          )}
        </div>
        <div>
          <Label className="mb-2 text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>تعداد رزرو</span>
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="5"
              value={defaultCapacity}
              onChange={(e) => setDefaultCapacity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-medium"
            />
            <span className="left-3 top-3 text-gray-500 dark:text-gray-400">نفر</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          مرحله قبل
        </button>
        <button
          onClick={generateTimeSlots}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
        >
          تولید نوبت‌ها
        </button>
      </div>
    </div>
  );

  const StepTimeSlots = () => (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <ListChecks className="w-5 h-5" />
          گام ۳: نوبت‌های تولید شده
        </h3>
        <button
          onClick={addCustomSlot}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all"
        >
          <span>نوبت جدید</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            className={`flex items-center justify-between p-4 border rounded-xl transition-all ${slot.is_active
              ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
              : 'border-red-300 bg-red-50 dark:bg-red-900/20'
              }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => toggleSlot(slot.id)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${slot.is_active
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
              >
                {slot.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>

              <div className="flex-1">
                {slot.is_custom ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-full sm:flex-1">
                        <TimePicker
                          value={slot.start_time as Date}
                          onChange={(val: Date) => updateCustomSlot(slot.id, 'start_time', val)}
                          className="w-full text-sm sm:text-base"
                          label="شروع"
                        />
                        {errors[`${slot.id}-start_time`] && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[`${slot.id}-start_time`]}
                          </p>
                        )}
                      </div>

                      <span className="hidden sm:inline text-gray-500 dark:text-gray-400">تا</span>

                      <div className="w-full sm:flex-1">
                        <TimePicker
                          value={slot.end_time as Date}
                          onChange={(val: Date) => updateCustomSlot(slot.id, 'end_time', val)}
                          className="w-full text-sm sm:text-base"
                          label="پایان"
                        />
                        {errors[`${slot.id}-end_time`] && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[`${slot.id}-end_time`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium dark:text-gray-200 text-sm sm:text-base">
                      {formatTimeForDisplay(slot.start_time)} - {formatTimeForDisplay(slot.end_time)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center mr-5">
                <Label className="text-xs dark:text-gray-300 mb-2">ظرفیت</Label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={slot.capacity}
                  onChange={(e) => updateSlotCapacity(slot.id, parseInt(e.target.value) || 1)}
                  className="w-12 p-1 border border-gray-200 dark:border-gray-600 rounded text-center dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              {slot.is_custom && (
                <button
                  onClick={() => deleteCustomSlot(slot.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          مرحله قبل
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
        >
          ادامه
        </button>
      </div>
    </div>
  );

  const StepSummary = () => (
    <div className="space-y-6 text-right" dir="rtl">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5" />
        گام ۴: بررسی نهایی
      </h3>

      <div className="space-y-4">
        <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold mb-3 dark:text-gray-200 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            روزهای انتخاب شده:
          </h4>
          <div className="flex flex-wrap gap-2 justify-end">
            {isWeeklyMode ? (
              selectedDates.map((date, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium flex items-center gap-1"
                >
                  {weekDays.find(d => d.key === date)?.label || date}
                </span>
              ))
            ) : (
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                {selectedSpecificDate}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold mb-3 dark:text-gray-200 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            نوبت‌های فعال:
          </h4>
          <div className="space-y-3">
            {timeSlots.filter(slot => slot.is_active).map(slot => (
              <div
                key={slot.id}
                className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                    ظرفیت: {slot.capacity} نفر
                  </span>
                  {slot.is_custom && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">
                      سفارشی
                    </span>
                  )}
                </div>
                <span className="font-medium dark:text-gray-200">
                  {formatTimeForDisplay(slot.start_time)} - {formatTimeForDisplay(slot.end_time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(3)}
          className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          مرحله قبل
        </button>
        <button
          onClick={() => saveShift()}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          ذخیره و انتشار
        </button>
      </div>
    </div>
  );

  const StepConfirmation = () => (
    <div className="text-center space-y-6" dir="rtl">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
          <Check className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">نوبت‌ها با موفقیت ذخیره شد!</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          تمام نوبت‌های تعریف شده برای کاربران قابل رزرو است و می‌توانند از طریق لینک اختصاصی شما اقدام به رزرو کنند.
        </p>
      </div>

      <button
        onClick={() => {
          setCurrentStep(1)
          setSelectedDates([])
          setSelectedSpecificDate('')
          setTimeSlots([])
          setErrors({})
        }}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all inline-flex items-center gap-2"
      >
        تعریف نوبت جدید
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <StepDateSelection />
      case 2: return <StepTimeRange />
      case 3: return <StepTimeSlots />
      case 4: return <StepSummary />
      case 5: return <StepConfirmation />
      default: return <StepDateSelection />
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="mb-8">
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 right-0 h-1.5 bg-blue-500 rounded-full -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
          <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                onClick={() => step < currentStep && setCurrentStep(step)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${step <= currentStep
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600'
                  } ${step < currentStep ? 'hover:bg-blue-400' : ''}`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderCurrentStep()}
    </div>
  )
}