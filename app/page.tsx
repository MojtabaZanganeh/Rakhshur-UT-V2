import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarClock, ClipboardList, CreditCard, WashingMachine } from 'lucide-react';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
  }).format(date);
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="py-4 px-6 sm:px-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <WashingMachine className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">سامانه رزرو لباسشویی</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="outline">ورود</Button>
          </Link>
          <Link href="/auth/register">
            <Button>ثبت‌نام</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              رزرو لباسشویی خوابگاه
              <span className="text-blue-600 dark:text-blue-400"> به سادگی</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              رزرو نوبت لباسشویی، پیگیری وضعیت و دریافت اعلان‌ها در یک سامانه
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">شروع کنید</Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">ورود به حساب</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 w-12 h-12 flex items-center justify-center mb-4">
                <CalendarClock className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">رزرو آسان</h3>
              <p className="text-gray-600 dark:text-gray-300">انتخاب زمان مناسب و رزرو نوبت لباسشویی در چند ثانیه</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 w-12 h-12 flex items-center justify-center mb-4">
                <ClipboardList className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">پیگیری وضعیت</h3>
              <p className="text-gray-600 dark:text-gray-300">مشاهده وضعیت شستشو از انتظار تا آماده تحویل</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 w-12 h-12 flex items-center justify-center mb-4">
                <CreditCard className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">پرداخت امن</h3>
              <p className="text-gray-600 dark:text-gray-300">پرداخت آنلاین و امن هزینه خدمات لباسشویی</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 dark:bg-gray-900 py-5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-1">© {formatDate(new Date().toString())} سامانه رزرو لباسشویی. تمامی حقوق محفوظ است.</p>
            <a href='https://mojtaba-zanganeh.ir/' className="text-blue-600 dark:text-blue-400">توسعه داده شده توسط: مجتبی زنگنه</a>
          </div>
        </div>
      </footer>
    </div>
  );
}