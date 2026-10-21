'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

interface Submission {
  id: string;
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth() as any;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/submissions/my');
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchSubmissions();
      }
    }
  }, [user, authLoading, router]);

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              My Submissions
            </h1>
            <Badge variant="info">Student History</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Track review status, mentor notes, and project assessment outcomes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubmissions} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Link href="/student/submit">
            <Button size="sm" className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              New Submission
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse"
            />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <Card className="text-center py-12 border-slate-800 bg-slate-900/40">
          <CardContent className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">No submissions yet</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                You haven&apos;t submitted any projects for evaluation yet. Submit your first project now!
              </p>
            </div>
            <Link href="/student/submit">
              <Button size="sm" className="gap-2 mt-2">
                <Send className="h-4 w-4" />
                Submit Your Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <Card
              key={sub.id}
              className="border-slate-800 bg-slate-900/60 shadow-md hover:border-slate-700 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      {sub.projectName}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted on {formatDate(sub.createdAt)}
                    </p>
                  </div>
                  <div>{getStatusBadge(sub.status)}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed">{sub.description}</p>

                {/* External Links */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    Source Code
                  </a>
                  <a
                    href={sub.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-800/60 hover:border-indigo-700 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Live Preview
                  </a>
                </div>

                {/* Mentor Feedback Box */}
                {sub.feedback && (
                  <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Mentor Feedback</span>
                      {sub.reviewedBy && (
                        <span className="text-slate-400 font-normal">
                          by {sub.reviewedBy.name} • {formatDate(sub.reviewedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 italic whitespace-pre-wrap">
                      &quot;{sub.feedback}&quot;
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
