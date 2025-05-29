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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/lib/auth-provider';
import { ArrowRight, Loader2, WashingMachine } from 'lucide-react';

const loginSchema = z.object({
  phone: z.string().min(10, { message: 'شماره تلفن باید حداقل 10 رقم باشد' }),
});

const verifySchema = z.object({
  code: z.string().length(5, { message: 'کد تایید باید 5 رقم باشد' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type VerifyFormValues = z.infer<typeof verifySchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { login, sendCode } = useAuth();

  const phoneForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
    },
  });

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmitPhone = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await sendCode(values.phone, 'login');

      if (response) {
        setPhoneNumber(values.phone);

        verifyForm.reset();
        setStep('verify');
      }

    } catch (error) {
      console.error('خطای ورود:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitVerify = async (values: VerifyFormValues) => {
    try {
      setIsSubmitting(true);
      await login(phoneNumber, values.code);
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
          <CardTitle className="text-2xl text-center">خوش آمدید</CardTitle>
          <CardDescription className="text-center">
            {step === 'phone'
              ? 'شماره تلفن خود را برای ورود به حساب کاربری وارد کنید'
              : 'کد تایید ارسال شده به تلفن همراه خود را وارد کنید'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
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
              <form onSubmit={verifyForm.handleSubmit(onSubmitVerify)} className="space-y-6">
                <FormField
                  control={verifyForm.control}
                  name="code"
                  render={() => (
                    <FormItem className="mx-auto text-center">
                      <FormLabel className="block text-gray-800 dark:text-gray-200 font-medium mb-4 text-lg">
                        کد تأیید را وارد کنید
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
                      <FormMessage className="text-red-600 dark:text-red-400 mt-3 text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className={`
                    w-full py-3 text-lg font-medium
                    bg-blue-600 hover:bg-blue-700 text-white
                    rounded-xl
                    transition-all
                    ${(isSubmitting || verifyForm.watch('code').length !== 5) ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                  disabled={isSubmitting || verifyForm.watch('code').length !== 5}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      در حال تأیید...
                    </>
                  ) : (
                    'ورود به حساب'
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    onClick={() => {
                      phoneForm.reset();
                      verifyForm.reset();
                      setStep('phone');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    <ArrowRight className="w-4 h-4 ml-1" />
                    استفاده از شماره تلفن دیگر
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            حساب کاربری ندارید؟{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              ثبت نام
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}