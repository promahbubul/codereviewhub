'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Send,
  TableProperties,
  Database,
  ArrowRight,
  Code2,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth() as any;

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-sm animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Associate Web Instructor Hiring Assessment</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Project Submission &{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mentor Review
          </span>{' '}
          Platform
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A high-performance fullstack evaluation dashboard engineered with Next.js, Express.js,
          Prisma ORM, PostgreSQL, and strict Role-Based Access Control (RBAC).
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            user.role === 'STUDENT' ? (
              <Link href="/student/submit">
                <Button size="lg" className="gap-2 text-base shadow-indigo-500/25">
                  <Send className="h-5 w-5" />
                  Go to Submission Portal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/mentor/dashboard">
                <Button size="lg" variant="gradient" className="gap-2 text-base shadow-purple-500/25">
                  <TableProperties className="h-5 w-5" />
                  Open Mentor Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )
          ) : (
            <>
              <Link href="/login">
                <Button size="lg" className="gap-2 text-base bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25">
                  Get Started (Login)
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="text-base">
                  Sign Up as Student
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Demo Fast Login Banner */}
        <div className="mt-14 max-w-3xl mx-auto p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Quick Evaluation Credentials (Pre-seeded in Neon DB)
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Mentor Account</span>
                  <Badge variant="warning">MENTOR</Badge>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-1">mentor@programming-hero.com</p>
                <p className="text-xs font-mono text-slate-500">Pass: Mentor@12345</p>
              </div>
              <Link href="/login?email=mentor@programming-hero.com">
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Test Mentor
                </Button>
              </Link>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Student Account</span>
                  <Badge variant="info">STUDENT</Badge>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-1">tanvir@student.ph</p>
                <p className="text-xs font-mono text-slate-500">Pass: Student@12345</p>
              </div>
              <Link href="/login?email=tanvir@student.ph">
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Test Student
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 border-t border-slate-900">
        <h2 className="text-2xl font-bold text-center text-white mb-10">
          Core Engineering & Requirement Architecture
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:border-slate-700 transition-colors">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Student Portal</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Project submission with end-to-end Zod validation, automated duplicate prevention,
                anti-spam rate limiting, and real-time review status tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-slate-700 transition-colors">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <TableProperties className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mentor Review Dashboard</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Server-side paginated data table, server-side status filtering, aggregated KPI statistics,
                and one-click approval/rejection with optional feedback notes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-slate-700 transition-colors">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Defensive RBAC & Security</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stateless JWT authentication, role guards protecting student and mentor endpoints,
                Helmet HTTP security headers, and PostgreSQL relational integrity via Prisma.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
