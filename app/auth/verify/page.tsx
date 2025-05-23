"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-provider';
import { WashingMachine } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const verifySchema = z.object({
  code: z.string().length(5, { message: 'Verification code must be 5 digits' }),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerifyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const { verifyCode } = useAuth();
  
  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (!phone) {
      // Redirect to register page if no phone number is provided
      window.location.href = '/auth/register';
    }
  }, [phone]);

  const onSubmit = async (values: VerifyFormValues) => {
    try {
      setIsSubmitting(true);
      await verifyCode(phone, values.code);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <WashingMachine className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-center">Verify your phone</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification code to {phone}. Enter the code below to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="mx-auto text-center">
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={5} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                        </InputOTPGroup>
                      </InputOTP>
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
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Didn't receive a code?{' '}
            <Button variant="link" className="p-0 h-auto">Resend</Button>
          </p>
          <p className="text-sm text-muted-foreground text-center">
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Back to register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}