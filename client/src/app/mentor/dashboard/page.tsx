'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  X,
  FileCode2,
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
}

interface SubmissionItem {
  id: string;
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string | null;
  reviewedAt?: string | null;
  student: StudentInfo;
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

interface Statistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalStudents: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export default function MentorDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth() as any;

  // Data state
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [stats, setStats] = useState<Statistics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalStudents: 0,
  });
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  // Query state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Review state
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [actionStatus, setActionStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [feedbackText, setFeedbackText] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/reviews/statistics');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  }, []);

  // Fetch Paginated Submissions
  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.get('/reviews/submissions', { params });
      if (res.data.success) {
        setSubmissions(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch review queue');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
        router.push('/student/submit');
        toast.error('Access Denied: Mentor permissions required.');
      } else {
        fetchStats();
        fetchSubmissions();
      }
    }
  }, [user, authLoading, router, fetchStats, fetchSubmissions]);

  // Open review inspector modal
  const openReviewModal = (sub: SubmissionItem) => {
    setSelectedSubmission(sub);
    setActionStatus(sub.status === 'REJECTED' ? 'REJECTED' : 'APPROVED');
    setFeedbackText(sub.feedback || '');
  };

  // Submit Evaluation Status Action
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsActionLoading(true);
    try {
      const res = await api.patch(`/reviews/submissions/${selectedSubmission.id}/status`, {
        status: actionStatus,
        feedback: feedbackText,
      });

      if (res.data.success) {
        toast.success(`Submission marked as ${actionStatus}`);
        setSelectedSubmission(null);
        fetchStats();
        fetchSubmissions();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update evaluation status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (status: SubmissionItem['status']) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" dot>APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" dot>REJECTED</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="warning" dot>PENDING</Badge>;
    }
  };

  const addPresetFeedback = (text: string) => {
    setFeedbackText((prev) => (prev ? `${prev} ${text}` : text));
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </div>
    );
  }

  if (user && user.role !== 'MENTOR' && user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
        <ShieldAlert className="h-10 w-10 text-rose-500 mb-2" />
        <h2 className="text-base font-semibold text-white">Access Restricted</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Lead Mentor or Administrator role is required to view this evaluation pipeline.
        </p>
      </div>
    );
  }

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Evaluation & Review Queue
            </h1>
            <span className="text-xs font-mono text-zinc-500">• Server-Side Filtered</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time pipeline monitoring, deliverable approvals, and student feedback evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              fetchSubmissions();
            }}
            isLoading={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Queue
          </Button>
        </div>
      </div>

      {/* Senior Executive KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
        <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Deliverables</span>
            <span className="font-mono text-[10px] text-zinc-500">DATABASE</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
          <div className="text-[11px] text-zinc-500 mt-1">{stats.totalStudents} enrolled candidates</div>
        </div>

        <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center justify-between text-xs text-amber-400/90">
            <span>Pending Evaluation</span>
            <span className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{stats.pending}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Requires reviewer action</div>
        </div>

        <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center justify-between text-xs text-emerald-400/90">
            <span>Approved Submissions</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{stats.approved}</div>
          <div className="text-[11px] text-zinc-500 mt-1">{approvalRate}% approval rate</div>
        </div>

        <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center justify-between text-xs text-rose-400/90">
            <span>Rejected / Revision</span>
            <span className="h-2 w-2 rounded-full bg-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{stats.rejected}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Feedback dispatched</div>
        </div>
      </div>

      {/* Filter Segmented Control & Search Input */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        {/* Status Segmented Pills */}
        <div className="flex items-center gap-1 p-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-zinc-100 text-zinc-900 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {tab === 'ALL'
                ? `All (${stats.total})`
                : tab === 'PENDING'
                ? `Pending (${stats.pending})`
                : tab === 'APPROVED'
                ? `Approved (${stats.approved})`
                : `Rejected (${stats.rejected})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search student or repo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 text-xs h-8 bg-zinc-950/60"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 text-[11px] font-mono text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 font-medium">CANDIDATE</th>
                <th className="py-3 px-4 font-medium">PROJECT & REPOSITORY</th>
                <th className="py-3 px-4 font-medium">SUBMISSION DATE</th>
                <th className="py-3 px-4 font-medium">EVALUATION</th>
                <th className="py-3 px-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                      <span className="font-mono text-xs">Querying database...</span>
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <SlidersHorizontal className="h-6 w-6 text-zinc-600 mb-1" />
                      <p className="text-xs font-medium text-zinc-300">No matching submissions found</p>
                      <p className="text-[11px] text-zinc-500">
                        {statusFilter !== 'ALL'
                          ? `There are no projects currently in '${statusFilter}' status.`
                          : 'No submissions have been recorded in the database.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Candidate */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] border border-zinc-700/60 shrink-0">
                          {getInitials(sub.student.name)}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-200">{sub.student.name}</div>
                          <div className="text-[11px] font-mono text-zinc-500">{sub.student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Project & Repos */}
                    <td className="py-3.5 px-4 align-top max-w-sm">
                      <div className="font-medium text-zinc-100">{sub.projectName}</div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {sub.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 font-mono text-[11px]">
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-zinc-300 hover:text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
                        >
                          <GithubIcon className="h-3 w-3" />
                          Source
                        </a>
                        <a
                          href={sub.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
                        >
                          <Globe className="h-3 w-3" />
                          Live
                        </a>
                      </div>
                      {sub.feedback && (
                        <div className="mt-2 text-[11px] text-zinc-400 bg-zinc-900/70 p-2 rounded border border-zinc-800/80">
                          <span className="text-zinc-300 font-semibold">Feedback Note: </span>
                          {sub.feedback}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 align-top font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {formatDate(sub.createdAt)}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {getStatusBadge(sub.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={sub.status === 'PENDING' ? 'default' : 'outline'}
                        onClick={() => openReviewModal(sub)}
                        className="h-7 text-xs font-medium"
                      >
                        {sub.status === 'PENDING' ? 'Review & Grade' : 'Inspect'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t border-zinc-800/80 bg-zinc-950/80 text-[11px] font-mono text-zinc-400 gap-2">
          <div>
            Showing{' '}
            <span className="text-zinc-200">
              {meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}
            </span>{' '}
            to{' '}
            <span className="text-zinc-200">
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{' '}
            of <span className="text-zinc-200">{meta.total}</span> items
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
              Prev
            </Button>

            <span className="px-2 text-zinc-300">
              {meta.page} / {meta.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-7 px-2 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Review Inspector Command Dialog */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
              <div>
                <h3 className="text-sm font-semibold text-white">Evaluate Candidate Deliverable</h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  {selectedSubmission.student.name} ({selectedSubmission.student.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="p-5 space-y-4">
              {/* Project Card */}
              <div className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">
                    {selectedSubmission.projectName}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={selectedSubmission.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <GithubIcon className="h-3 w-3" /> Repo <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <a
                      href={selectedSubmission.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" /> Live <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {selectedSubmission.description}
                </p>
              </div>

              {/* Status Decision Toggle */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase">
                  Assessment Decision *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActionStatus('APPROVED')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium transition-all ${
                      actionStatus === 'APPROVED'
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Deliverable
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionStatus('REJECTED')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium transition-all ${
                      actionStatus === 'REJECTED'
                        ? 'bg-rose-950/60 border-rose-600 text-rose-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject / Request Changes
                  </button>
                </div>
              </div>

              {/* Quick Feedback Chips */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-mono text-zinc-400 uppercase text-[11px]">
                    Feedback & Recommendations
                  </label>
                  <span className="text-[10px] text-zinc-500">Quick preset chips:</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Clean Architecture & Modular Code',
                    'Missing Rate Limiter Protection',
                    'Production Ready & Approved',
                    'Broken Live Demo Link',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addPresetFeedback(preset)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <Textarea
                  rows={3}
                  placeholder="Leave actionable review notes for the candidate..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant={actionStatus === 'APPROVED' ? 'success' : 'destructive'}
                  isLoading={isActionLoading}
                  className="font-medium"
                >
                  Confirm {actionStatus}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
