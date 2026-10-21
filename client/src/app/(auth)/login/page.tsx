'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogIn, KeyRound, Mail, Sparkles, UserCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth() as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from query param if available
  useEffect(() => {
    const queryEmail = searchParams.get('email');
    if (queryEmail) {
      setEmail(queryEmail);
      if (queryEmail.includes('mentor')) {
        setPassword('Mentor@12345');
      } else {
        setPassword('Student@12345');
      }
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'MENTOR' || user.role === 'ADMIN') {
        router.push('/mentor/dashboard');
      } else {
        router.push('/student/submit');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        toast.success(`Welcome back, ${user.name}!`);

        if (user.role === 'MENTOR' || user.role === 'ADMIN') {
          router.push('/mentor/dashboard');
        } else {
          router.push('/student/submit');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <LogIn className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Sign In to Your Account</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Quick Demo Pre-fill Buttons */}
            <div className="mb-6 p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>One-Click Test Login Credentials</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-slate-700 hover:border-purple-500"
                  onClick={() => handleQuickFill('mentor@programming-hero.com', 'Mentor@12345')}
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1 text-purple-400" />
                  Mentor Fill
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-slate-700 hover:border-indigo-500"
                  onClick={() => handleQuickFill('tanvir@student.ph', 'Student@12345')}
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                  Student Fill
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full mt-2 font-semibold shadow-md shadow-indigo-500/20"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-800/80 pt-4">
            <p className="text-xs text-slate-400">
              Don&apos;t have a student account?{' '}
              <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-400">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
