'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  TableProperties,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
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

  // State
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

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [actionStatus, setActionStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [feedbackText, setFeedbackText] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/reviews/statistics');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, []);

  // Fetch Paginated Submissions with Server-Side Filter
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
      toast.error(err.response?.data?.message || 'Failed to fetch review data');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  // Auth & Role Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
        router.push('/student/submit');
        toast.error('Access Denied: Mentor privileges required to access this dashboard.');
      } else {
        fetchStats();
        fetchSubmissions();
      }
    }
  }, [user, authLoading, router, fetchStats, fetchSubmissions]);

  // Open review modal
  const openReviewModal = (sub: SubmissionItem) => {
    setSelectedSubmission(sub);
    setActionStatus(sub.status === 'REJECTED' ? 'REJECTED' : 'APPROVED');
    setFeedbackText(sub.feedback || '');
  };

  // Submit Status Action
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
        toast.success(`Submission updated to ${actionStatus}!`);
        setSelectedSubmission(null);
        fetchStats();
        fetchSubmissions();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update submission status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status: SubmissionItem['status']) => {
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
            Pending
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

  if (user && user.role !== 'MENTOR' && user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white">403 - Forbidden Access</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          You do not have mentor or admin permissions to access this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Mentor Review Dashboard
            </h1>
            <Badge variant="warning">Lead Mentor View</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Real-time evaluation, server-side paginated project table & status assessment
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchStats();
            fetchSubmissions();
          }}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Data
        </Button>
      </div>

      {/* KPI Aggregated Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Submissions */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Submissions</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TableProperties className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-400/90">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.pending}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Approved Projects */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400/90">Approved Projects</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.approved}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Rejected Projects */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-400/90">Rejected Projects</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.rejected}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Controls */}
      <Card className="border-slate-800 bg-slate-900/60 mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
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

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search student or project..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </CardContent>
      </Card>

      {/* Paginated Data Table */}
      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Project Details</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                      <span className="text-xs">Fetching review submissions...</span>
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FileCheck2 className="h-8 w-8 text-slate-600 mb-1" />
                      <p className="text-sm font-medium text-slate-300">No submissions found</p>
                      <p className="text-xs text-slate-500">
                        {statusFilter !== 'ALL'
                          ? `No submissions currently under '${statusFilter}' status.`
                          : 'No student submissions recorded yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Student Info */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-semibold text-white">{sub.student.name}</div>
                      <div className="text-xs text-slate-400">{sub.student.email}</div>
                    </td>

                    {/* Project Details & Links */}
                    <td className="py-4 px-4 align-top max-w-sm">
                      <div className="font-medium text-slate-100">{sub.projectName}</div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {sub.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                        >
                          <GithubIcon className="h-3 w-3" />
                          Repo
                        </a>
                        <a
                          href={sub.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60"
                        >
                          <Globe className="h-3 w-3" />
                          Live
                        </a>
                      </div>
                      {sub.feedback && (
                        <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                          <span className="text-indigo-400 font-semibold">Feedback: </span>
                          {sub.feedback}
                        </div>
                      )}
                    </td>

                    {/* Submission Date */}
                    <td className="py-4 px-4 align-top text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(sub.createdAt)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      {getStatusBadge(sub.status)}
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={sub.status === 'PENDING' ? 'default' : 'outline'}
                        className="text-xs h-8"
                        onClick={() => openReviewModal(sub)}
                      >
                        {sub.status === 'PENDING' ? 'Review Submission' : 'Change Status'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 gap-3">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-200">
              {meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-200">
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-200">{meta.total}</span> submissions
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <span className="px-2 text-slate-300 font-medium">
              Page {meta.page} of {meta.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 px-2.5 gap-1 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Review & Status Action Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Review Submission</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Student:{' '}
                <span className="text-white font-medium">{selectedSubmission.student.name}</span>{' '}
                ({selectedSubmission.student.email})
              </p>
            </div>

            <form onSubmit={handleStatusUpdate} className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1">Project</p>
                <p className="text-sm text-white font-medium">{selectedSubmission.projectName}</p>
                <div className="flex gap-2 mt-2">
                  <a
                    href={selectedSubmission.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <GithubIcon className="h-3 w-3" /> Repo
                  </a>
                  <a
                    href={selectedSubmission.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" /> Live
                  </a>
                </div>
              </div>

              {/* Status Decision Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Evaluation Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionStatus('APPROVED')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      actionStatus === 'APPROVED'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Project
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionStatus('REJECTED')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      actionStatus === 'REJECTED'
                        ? 'bg-rose-600/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/10'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Project
                  </button>
                </div>
              </div>

              {/* Mentor Feedback Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mentor Feedback / Assessment Notes
                </label>
                <Textarea
                  rows={3}
                  placeholder="Provide constructive feedback for the student (e.g. suggestions for improvement, architectural strengths, or reasons for rejection)..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
