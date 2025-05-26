import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-12">
        <div className="w-48 h-48 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border-4 border-blue-300 dark:border-blue-700">
          <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-blue-300 dark:border-blue-600">
            <div className="w-24 h-24 bg-blue-200 dark:bg-blue-800/50 rounded-full flex items-center justify-center animate-spin-slow">
              <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">404</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl space-y-6">
        <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-300">
          صفحه مورد نظر پیدا نشد!
        </h2>
        <p className="text-lg text-blue-600 dark:text-blue-400">
          به نظر می‌رسد صفحه مورد نظر شما مانند لباس‌های گم شده، پیدا نمی‌شود!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white">
            <Link href="/dashboard">بازگشت به داشبورد</Link>
          </Button>
          <Button asChild variant="outline" className="border-blue-300 text-blue-600 dark:border-blue-600 dark:bg-gray-900 dark:text-white dark:hover:bg-blue-900/30">
            <Link href="/">صفحه اصلی</Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-16 text-sm text-blue-500 dark:text-blue-400">
        <p>اگر نیاز به کمک دارید، با بخش پشتیبانی تماس بگیرید</p>
      </div>
    </div>
  );
}