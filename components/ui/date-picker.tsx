import React from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { AlertCircle, Calendar, CalendarDays } from 'lucide-react';

interface JalaliDatePickerProps {
  selected: string | null;
  onChange: (date: string) => void;
  label?: string;
  className?: string;
  error?: string;
}

interface DayProps {
  className?: string;
}

const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  selected,
  onChange,
  label,
  className,
  error
}) => {

  function convertFAtoEN(input: string): string {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return input.replace(/[۰-۹]/g, (char) => {
      const index = persianNumbers.indexOf(char);
      return index !== -1 ? englishNumbers[index] : char;
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  return (
    <div className="relative">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
          <CalendarDays className="w-4 h-4" />
          {label}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute right-3 top-2 text-gray-400" />
        <DatePicker
          value={selected || ''}
          onChange={(date: any) => {
            if (date) {
              const formattedDate = date.format("YYYY/MM/DD");
              const englishDate = convertFAtoEN(formattedDate);
              onChange(englishDate);
            }
          }}
          weekDays={weekDays}
          mapDays={({ date }) => {
            let props: DayProps = {};
            let isWeekend = date.weekDay.index === 6;
            if (isWeekend) props.className = "highlight highlight-red";
            return props;
          }}
          calendar={persian}
          locale={persian_fa}
          format="YYYY/MM/DD"
          editable={false}
          inputClass={`w-full pr-10 p-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all 
            ${error ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
          minDate={today}
          containerStyle={{
            display: "flex"
          }}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default JalaliDatePicker;