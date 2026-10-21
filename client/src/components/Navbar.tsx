'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Layers, Send, TableProperties, LogOut, LogIn, CheckCircle2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth() as any;
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-900 group-hover:bg-white transition-colors">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              CodeReview<span className="text-zinc-500 font-normal">Hub</span>
            </span>
          </Link>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {mounted && user?.role === 'STUDENT' && (
            <>
              <Link
                href="/student/submit"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  pathname === '/student/submit'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                Submit Project
              </Link>
              <Link
                href="/student/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  pathname === '/student/dashboard'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <TableProperties className="h-3.5 w-3.5" />
                My Submissions
              </Link>
            </>
          )}

          {mounted && (user?.role === 'MENTOR' || user?.role === 'ADMIN') && (
            <Link
              href="/mentor/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                pathname === '/mentor/dashboard'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <TableProperties className="h-3.5 w-3.5" />
              Review Queue
            </Link>
          )}
        </nav>

        {/* Right Section: Auth State */}
        <div className="flex items-center gap-3">
          {mounted ? (
            user ? (
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    user.role === 'MENTOR'
                      ? 'warning'
                      : user.role === 'ADMIN'
                      ? 'destructive'
                      : 'info'
                  }
                  dot
                >
                  {user.role}
                </Badge>

                <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-700/60">
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-medium text-zinc-200 leading-none">{user.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{user.email}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="Sign Out"
                  className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">
                    Create Account
                  </Button>
                </Link>
              </div>
            )
          ) : (
            <div className="h-7 w-16" suppressHydrationWarning />
          )}
        </div>
      </div>
    </header>
  );
};
