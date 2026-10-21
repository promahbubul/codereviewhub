'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Layers } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth() as any;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/signup', { name, email, password });
      if (res.data.success) {
        const { token, user: newUser } = res.data.data;
        login(token, newUser);
        toast.success('Candidate profile registered');
        router.push('/student/submit');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 subtle-grid">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 mb-3 shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Create Candidate Account</h2>
          <p className="text-xs text-zinc-400 mt-1">Register to submit code deliverables and view feedback</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-xs">
          {error && (
            <div className="mb-4 rounded-md border border-rose-900/60 bg-rose-950/40 p-2.5 text-xs text-rose-300 font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                Full Name
              </label>
              <Input
                type="text"
                required
                placeholder="Mahbubul Alam"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                Confirm Password
              </label>
              <Input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full mt-2 font-medium"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-5 pt-4 text-center border-t border-zinc-900">
            <p className="text-xs text-zinc-500">
              Already registered?{' '}
              <Link href="/login" className="text-zinc-300 hover:text-white font-medium underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
