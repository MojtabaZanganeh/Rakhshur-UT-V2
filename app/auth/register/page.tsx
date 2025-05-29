"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/lib/auth-provider';
import { Loader2, WashingMachine } from 'lucide-react';

const registerSchema = z.object({
  first_name: z.string().min(2, { message: 'نام باید حداقل 2 کاراکتر باشد' }),
  last_name: z.string().min(2, { message: 'نام خانوادگی باید حداقل 2 کاراکتر باشد' }),
  phone: z.string().min(10, { message: 'شماره تلفن باید حداقل 10 رقم باشد' }),
  student_id: z.string().min(5, { message: 'شماره دانشجویی باید حداقل 5 کاراکتر باشد' }),
  dormitory: z.enum(['dormitory-1', 'dormitory-2']),
});

const verifySchema = z.object({
  code: z.string().length(5, { message: 'کد تایید باید 5 رقم باشد' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type VerifyFormValues = z.infer<typeof verifySchema>;

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [userData, setUserData] = useState<RegisterFormValues | null>(null);
  const { register, sendCode, checkCode } = useAuth();

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      student_id: '',
      dormitory: 'dormitory-1',
    },
  });

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmitRegister = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await sendCode(values.phone, 'register');

      if (response) {
        setUserData(values);

        verifyForm.reset();
        setStep('verify');
      }

    } catch (error) {
      console.error('خطای ثبت‌نام:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitVerify = async (values: VerifyFormValues) => {
    if (!userData) return;

    try {
      setIsSubmitting(true);

      const response = await checkCode(userData.phone, values.code);
      if (response) {
        await register(userData);
      } else {
        throw new Error('کد اشتباه است');
      }
    } catch (error) {
      console.error('خطای تایید:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPChange = (value: string) => {
    verifyForm.setValue('code', value, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <WashingMachine className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-center">ایجاد حساب کاربری</CardTitle>
          <CardDescription className="text-center">
            {step === 'register'
              ? 'اطلاعات خود را برای ایجاد حساب کاربری وارد کنید'
              : 'کد تأیید ارسال شده به تلفن همراه خود را وارد کنید'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'register' ? (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نام</FormLabel>
                        <FormControl>
                          <Input placeholder="علی" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نام خانوادگی</FormLabel>
                        <FormControl>
                          <Input placeholder="محمدی" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شماره تلفن</FormLabel>
                      <FormControl>
                        <Input placeholder="09123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شماره دانشجویی</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="dormitory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>خوابگاه</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl dir='rtl'>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب خوابگاه" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir='rtl'>
                          <SelectItem value="dormitory-1">خوابگاه 1</SelectItem>
                          <SelectItem value="dormitory-2">خوابگاه 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'در حال ارسال کد...' : 'ادامه'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...verifyForm}>
              <form onSubmit={verifyForm.handleSubmit(onSubmitVerify)} className="space-y-4">
                <FormField
                  control={verifyForm.control}
                  name="code"
                  render={() => (
                    <FormItem className="mx-auto text-center">
                      <FormLabel className="text-gray-800 dark:text-gray-200 font-medium mb-3 block">
                        کد تأیید
                      </FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={5}
                          value={verifyForm.watch('code')}
                          onChange={handleOTPChange}
                          containerClassName="justify-center"
                        >
                          <InputOTPGroup className="gap-2 sm:gap-4">
                            {[4, 3, 2, 1, 0].map((index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className={`
                                  w-12 h-12 text-xl font-bold
                                  border-2 border-gray-300 dark:border-gray-500
                                  bg-white dark:bg-gray-800
                                  text-gray-900 dark:text-white
                                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
                                  transition-all
                                `}
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage className="text-red-600 dark:text-red-400 mt-2" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  disabled={isSubmitting || verifyForm.watch('code').length !== 5}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      در حال تأیید...
                    </>
                  ) : 'تکمیل ثبت‌نام'}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => {
                      registerForm.reset();
                      verifyForm.reset();
                      setStep('register');
                    }}
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    بازگشت به فرم ثبت‌نام
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              ورود
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}