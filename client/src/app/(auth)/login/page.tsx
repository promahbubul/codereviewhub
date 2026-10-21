'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Layers, Terminal, GitBranch } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth() as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const { token, user: loggedUser } = res.data.data;
        login(token, loggedUser);
        toast.success(`Welcome back, ${loggedUser.name}`);

        if (loggedUser.role === 'MENTOR' || loggedUser.role === 'ADMIN') {
          router.push('/mentor/dashboard');
        } else {
          router.push('/student/submit');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 subtle-grid">
      <div className="w-full max-w-sm">
        {/* Brand Icon Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 mb-3 shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Sign In to CodeReview</h2>
          <p className="text-xs text-zinc-400 mt-1">Enter credentials or select quick demo profile</p>
        </div>

        {/* Demo Fast Switcher Strip */}
        <div className="flex items-center justify-center gap-1.5 p-1 mb-5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 font-mono text-[11px]">
          <span className="text-zinc-500 px-1 hidden sm:inline">Demo:</span>
          <button
            type="button"
            onClick={() => handleDemoFill('mentor@programming-hero.com', 'Mentor@12345')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            <Terminal className="h-3 w-3 text-amber-400" />
            Lead Mentor
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('tanvir@student.ph', 'Student@12345')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            <GitBranch className="h-3 w-3 text-blue-400" />
            Candidate
          </button>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-xs">
          {error && (
            <div className="mb-4 rounded-md border border-rose-900/60 bg-rose-950/40 p-2.5 text-xs text-rose-300 font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                Password
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full mt-2 font-medium"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-5 pt-4 text-center border-t border-zinc-900">
            <p className="text-xs text-zinc-500">
              New candidate?{' '}
              <Link href="/signup" className="text-zinc-300 hover:text-white font-medium underline underline-offset-4">
                Register account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-xs font-mono text-zinc-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
