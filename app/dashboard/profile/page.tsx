"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-provider';
import { fetchApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(2, { message: 'نام باید حداقل ۲ کاراکتر باشد' }),
  last_name: z.string().min(2, { message: 'نام خانوادگی باید حداقل ۲ کاراکتر باشد' }),
  student_id: z.string().min(9, { message: 'شماره دانشجویی باید ۹ کاراکتر باشد' }),
  dormitory: z.enum(['dormitory-1', 'dormitory-2']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      student_id: user?.student_id || '',
      dormitory: user?.dormitory || 'dormitory-1',
    },
    values: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      student_id: user?.student_id || '',
      dormitory: user?.dormitory || 'dormitory-1',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/profile/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user?.id, values }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        toast.success('پروفایل با موفقیت ویرایش شد');
      } else {
        throw new Error(data.message || 'خطا در ویرایش پروفایل');
      }
    } catch (error) {
      console.error('Failed to edit profile:', error);
      toast.error(error instanceof Error && error.message ? error.message : 'خطا در ویرایش پروفایل');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full md:w-1/2 mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">پروفایل کاربری</h1>

      <Tabs defaultValue="account" className="space-y-4" dir='rtl'>
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            اطلاعات حساب
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            امنیت
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-200">اطلاعات شخصی</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                اطلاعات حساب کاربری خود را مشاهده و ویرایش کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">نام</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="علی"
                              {...field}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 dark:text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">نام خانوادگی</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="محمدی"
                              {...field}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 dark:text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="student_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">شماره دانشجویی</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="12345678"
                              {...field}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 dark:text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dormitory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">خوابگاه</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled
                          >
                            <FormControl dir='rtl'>
                              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="انتخاب خوابگاه" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                              <SelectItem value="dormitory-1">خوابگاه ۱</SelectItem>
                              <SelectItem value="dormitory-2">خوابگاه ۲</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-600 dark:text-red-400" />
                        </FormItem>

                      )}
                    />

                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">شماره همراه</FormLabel>
                      <FormControl>
                        <Input
                          value={user?.phone}
                          disabled
                          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        />
                      </FormControl>
                    </FormItem>

                  </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      شماره همراه و خوابگاه قابل تغییر نیست. در صورت نیاز با مدیریت تماس بگیرید.
                    </p>

                  <div className="pt-4">

                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting || !form.formState.isDirty}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        در حال به‌روزرسانی...
                      </>
                    ) : 'به‌روزرسانی پروفایل'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-200">تنظیمات امنیتی</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                مدیریت تنظیمات امنیتی حساب کاربری
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">روش احراز هویت</h4>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-200">احراز هویت با کد پیامکی</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      حساب شما با ارسال کد تأیید به شماره تلفن، ایمن شده است.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">نقش کاربری</h4>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <User className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {user?.role === 'admin' ? 'مدیر سیستم' : 'کاربر عادی'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      سطح دسترسی و مجوزهای حساب شما
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            {/* <CardFooter>
              <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600">
                درخواست تغییر رمز عبور
              </Button>
            </CardFooter> */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}