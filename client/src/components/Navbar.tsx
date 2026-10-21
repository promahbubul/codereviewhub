'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { GraduationCap, LayoutDashboard, Send, LogOut, LogIn, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth() as any;
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              PeerReview<span className="text-indigo-500">.io</span>
            </span>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Programming Hero Task
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {user?.role === 'STUDENT' && (
            <>
              <Link
                href="/student/submit"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/student/submit'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Send className="h-4 w-4" />
                Submit Project
              </Link>
              <Link
                href="/student/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/student/dashboard'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                My Submissions
              </Link>
            </>
          )}

          {(user?.role === 'MENTOR' || user?.role === 'ADMIN') && (
            <Link
              href="/mentor/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/mentor/dashboard'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Mentor Review Dashboard
            </Link>
          )}
        </nav>

        {/* User / Auth State */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium text-slate-200">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
              <Badge
                variant={
                  user.role === 'MENTOR'
                    ? 'warning'
                    : user.role === 'ADMIN'
                    ? 'destructive'
                    : 'info'
                }
              >
                {user.role}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-1.5 text-slate-300 hover:text-rose-400 hover:border-rose-500/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
