
'use client'

import { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { ChevronUp, ChevronDown, Clock } from 'lucide-react'

type TimePickerProps = {
  value: Date
  onChange: (value: Date) => void
  label?: string
  className?: string
}

const TimePickerItem = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatter = (val: number) => val.toString().padStart(2, '0')
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  formatter?: (val: number) => string
}) => {
  const validValues = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step
  )

  const increment = () => {
    const nextIndex = validValues.indexOf(value) + 1
    onChange(nextIndex >= validValues.length ? validValues[0] : validValues[nextIndex])
  }

  const decrement = () => {
    const prevIndex = validValues.indexOf(value) - 1
    onChange(prevIndex < 0 ? validValues[validValues.length - 1] : validValues[prevIndex])
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={increment}
        className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 focus:outline-none"
      >
        <ChevronUp size={18} />
      </button>

      <div className="w-12 h-10 flex items-center justify-center text-xl font-medium">
        {formatter(value)}
      </div>

      <button
        type="button"
        onClick={decrement}
        className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 focus:outline-none"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  )
}

export const TimePicker = ({ value, onChange, label, className = "" }: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [openDirection, setOpenDirection] = useState<'up' | 'down' | null>(null)


  const [tempTime, setTempTime] = useState<{ hours: number, minutes: number }>({
    hours: value.getHours(),
    minutes: value.getMinutes()
  })

  const hours = value.getHours()
  const minutes = value.getMinutes()

  useEffect(() => {
    if (isOpen) {
      setTempTime({
        hours: value.getHours(),
        minutes: value.getMinutes()
      })
    }
  }, [isOpen, value])

  useEffect(() => {
    if (isOpen && pickerRef.current && popupRef.current) {
      const pickerRect = pickerRef.current.getBoundingClientRect();
      const popupHeight = popupRef.current.offsetHeight || 200;
      const spaceBelow = window.innerHeight - pickerRect.bottom;
      const spaceAbove = pickerRect.top;

      if (spaceBelow > popupHeight && spaceAbove <= popupHeight) {
        setOpenDirection('down');
      } else {
        setOpenDirection('up');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setOpenDirection(null)
    }
  }, [isOpen]);

  const handleHourChange = (newHour: number) => {
    setTempTime(prev => ({ ...prev, hours: newHour }))
  }

  const handleMinuteChange = (newMinute: number) => {
    setTempTime(prev => ({ ...prev, minutes: newMinute }))
  }

  const handleApply = () => {
    const newDate = new Date(value)
    newDate.setHours(tempTime.hours, tempTime.minutes)
    onChange(newDate)
    setIsOpen(false)
  }

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, []);

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {label && <Label className="mb-2 block dark:text-gray-200 text-xs sm:text-sm">{label}</Label>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <span className="text-gray-800 dark:text-gray-200">{formattedTime}</span>
        <Clock size={16} className="text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className={`
            absolute z-[999] p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
            rounded-md shadow-lg transform transition-all duration-200 ease-out
            ${openDirection === 'down' ? 'opacity-100 translate-y-1 top-full mt-1' : ''}
            ${openDirection === 'up' ? 'opacity-100 -translate-y-1 bottom-full mb-1' : ''}
            ${openDirection === null ? 'opacity-0 pointer-events-none' : ''}
          `}
          style={{ minWidth: '10rem' }}
        >

          <div className="flex items-center justify-center flex-row-reverse">
            <TimePickerItem
              value={tempTime.hours}
              onChange={handleHourChange}
              min={0}
              max={23}
            />

            <div className="mx-2 text-xl font-bold dark:text-gray-300">:</div>

            <TimePickerItem
              value={tempTime.minutes}
              onChange={handleMinuteChange}
              min={0}
              max={45}
              step={15}
            />
          </div>

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            >
              تأیید
            </button>
          </div>
        </div>
      )
      }
    </div >
  )
}