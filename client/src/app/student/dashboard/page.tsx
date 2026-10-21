'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
  GitCommit,
  ExternalLink,
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
      setError(err.response?.data?.message || 'Failed to fetch deliverables log');
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
        return <Badge variant="success" dot>APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" dot>CHANGES REQUESTED</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="warning" dot>IN QUEUE</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Deliverables Log & Reviews
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time verification log, reviewer notes, and assessment history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubmissions} className="gap-1.5 font-mono text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Link href="/student/submit">
            <Button size="sm" className="gap-1.5 font-medium">
              <Send className="h-3.5 w-3.5" />
              New Submission
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission List / Activity Timeline */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 rounded-lg border border-zinc-800/80 bg-zinc-950/40 animate-pulse"
            />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-zinc-800/80 bg-zinc-950/40">
          <GitCommit className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
          <h3 className="text-sm font-semibold text-zinc-300">No project deliverables logged</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            You have not submitted any projects to the evaluation queue yet.
          </p>
          <Link href="/student/submit">
            <Button size="sm" className="mt-4 gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Submit First Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-xs hover:border-zinc-700/80 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-900">
                <div>
                  <h3 className="text-base font-semibold text-white">{sub.projectName}</h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    Logged: {formatDate(sub.createdAt)}
                  </p>
                </div>
                <div>{getStatusBadge(sub.status)}</div>
              </div>

              <div className="py-3">
                <p className="text-xs text-zinc-400 leading-relaxed">{sub.description}</p>

                <div className="flex items-center gap-2 mt-3 font-mono text-[11px]">
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <GithubIcon className="h-3 w-3" />
                    Repository <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
                  </a>
                  <a
                    href={sub.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-zinc-900/60 px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <Globe className="h-3 w-3" />
                    Live Demo <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
                  </a>
                </div>
              </div>

              {/* Reviewer Feedback Callout */}
              {sub.feedback && (
                <div className="mt-3 p-3.5 rounded-md border border-zinc-800/80 bg-zinc-900/40">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium mb-1">
                    <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Reviewer Assessment:</span>
                    {sub.reviewedBy && (
                      <span className="text-[11px] font-mono text-zinc-500">
                        {sub.reviewedBy.name} • {formatDate(sub.reviewedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 italic pl-5 border-l-2 border-zinc-700">
                    &ldquo;{sub.feedback}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
