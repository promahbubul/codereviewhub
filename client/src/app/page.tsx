'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  GitBranch,
  Terminal,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const { user, login } = useAuth() as any;
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  // Fast One-Click Demo Session Launcher
  const handleQuickDemo = async (role: 'MENTOR' | 'STUDENT') => {
    setIsDemoLoading(role);
    const credentials =
      role === 'MENTOR'
        ? { email: 'mentor@programming-hero.com', password: 'Mentor@12345' }
        : { email: 'tanvir@student.ph', password: 'Student@12345' };

    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data.success) {
        const { token, user: authUser } = res.data.data;
        login(token, authUser);
        toast.success(`Authenticated as ${role.toLowerCase()}: ${authUser.name}`);
        if (role === 'MENTOR') {
          router.push('/mentor/dashboard');
        } else {
          router.push('/student/submit');
        }
      }
    } catch {
      toast.error('Failed to initiate demo session');
    } finally {
      setIsDemoLoading(null);
    }
  };

  return (
    <div className="relative overflow-hidden subtle-grid min-h-[calc(100vh-3.5rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-16 sm:px-6 lg:px-8 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-mono text-zinc-300 mb-6 backdrop-blur-xs">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>v1.0.0 • Code Review & Evaluation Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-[1.12]">
          Developer Deliverables & Review Workflows
        </h1>

        <p className="mt-5 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          High-throughput submission management platform engineered for real-time mentor code reviews,
          duplicate repository prevention, and role-based access control.
        </p>

        {/* Instant Evaluation Entry Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            user.role === 'MENTOR' || user.role === 'ADMIN' ? (
              <Link href="/mentor/dashboard">
                <Button size="lg" className="gap-2 font-medium">
                  Open Review Queue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/student/submit">
                <Button size="lg" className="gap-2 font-medium">
                  Submit Deliverable
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2.5 p-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xs">
              <span className="text-[11px] font-mono text-zinc-400 px-2 hidden sm:inline">
                Instant Access:
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleQuickDemo('MENTOR')}
                isLoading={isDemoLoading === 'MENTOR'}
                className="gap-1.5 font-medium"
              >
                <Terminal className="h-3.5 w-3.5 text-zinc-900" />
                Launch as Mentor
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickDemo('STUDENT')}
                isLoading={isDemoLoading === 'STUDENT'}
                className="gap-1.5 font-medium"
              >
                <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
                Launch as Student
              </Button>

              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-400">
                  Manual Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* macOS Window UI Mockup Frame */}
        <div className="mt-14 mx-auto max-w-4xl rounded-xl border border-zinc-800/80 bg-zinc-950/80 shadow-2xl overflow-hidden text-left">
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/50">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
              <span className="ml-2 text-[11px] font-mono text-zinc-500">review.workspace/queue</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span>LIVE QUEUE</span>
            </div>
          </div>

          {/* Table Mockup Preview */}
          <div className="p-4 overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800/60 text-[11px]">
                  <th className="pb-2 font-normal">STUDENT</th>
                  <th className="pb-2 font-normal">REPOSITORY</th>
                  <th className="pb-2 font-normal">DECISION</th>
                  <th className="pb-2 font-normal text-right">EVALUATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300 text-[11px]">
                <tr>
                  <td className="py-2.5 text-zinc-200">tanvir@student.ph</td>
                  <td className="py-2.5 text-zinc-400 flex items-center gap-1.5">
                    <GithubIcon className="h-3 w-3" /> devfolio-app
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      ● APPROVED
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-zinc-500">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-zinc-200">nusrat@student.ph</td>
                  <td className="py-2.5 text-zinc-400 flex items-center gap-1.5">
                    <GithubIcon className="h-3 w-3" /> task-pulse
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                      ● PENDING
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-zinc-400 font-medium">In Review</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-zinc-200">rakib@student.ph</td>
                  <td className="py-2.5 text-zinc-400 flex items-center gap-1.5">
                    <GithubIcon className="h-3 w-3" /> fintrack-api
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      ● QUEUED
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-zinc-500">Awaiting</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Engineering Architecture Highlights */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 border-t border-zinc-900 pt-12">
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-950/40">
            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">
              Role-Based Access Control
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Stateless JWT verification with strict role enforcement protecting mentor and student
              route boundaries at the API gateway layer.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-950/40">
            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">
              Automated Duplicate Prevention
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Composite unique constraint indexing (`studentId + repoUrl`) preventing redundant
              evaluations and double-submissions.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-950/40">
            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">
              Server-Side Evaluation Pipeline
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              PostgreSQL count aggregations, server-side paginated queries, and structured feedback
              storage with reviewer traceability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
