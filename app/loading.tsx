import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center justify-center space-y-4">

        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-primary animate-pulse">
            در حال بارگذاری
            <span className="inline-block ml-1">
              <span className="inline-block animate-[typing_1.5s_steps(3,end)_infinite]">
                ...
              </span>
            </span>
          </h3>
          <p className="text-sm text-muted-foreground">
            لطفاً چند لحظه صبر کنید
          </p>
        </div>
        
        <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}