import { Clock, WashingMachine, AlarmClockCheck, BookmarkCheck, BookmarkX } from 'lucide-react';

export const statusStyles = {
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