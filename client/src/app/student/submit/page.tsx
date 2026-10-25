'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import api, { getApiErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Send,
  Globe,
  FolderGit2,
  AlertCircle,
  History,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

const submissionFormSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name cannot exceed 100 characters'),
  repoUrl: z
    .string()
    .trim()
    .url('Must be a valid URL (e.g. https://github.com/user/project)')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'Repository URL must start with http:// or https://'
    ),
  liveUrl: z
    .string()
    .trim()
    .url('Must be a valid deployment URL (e.g. https://app.vercel.app)')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'Live link must start with http:// or https://'
    ),
  description: z
    .string()
    .trim()
    .min(10, 'Provide at least 10 characters describing key architecture and stack')
    .max(2000, 'Description cannot exceed 2000 characters'),
});

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

export default function StudentSubmitPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      projectName: '',
      repoUrl: '',
      liveUrl: '',
      description: '',
    },
  });

  const watchProjectName = watch('projectName');
  const watchRepoUrl = watch('repoUrl');
  const watchLiveUrl = watch('liveUrl');
  const watchDescription = watch('description');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: SubmissionFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/submissions', data);
      if (res.data.success) {
        toast.success('Project deliverable submitted to review queue');
        reset();
        router.push('/student/dashboard');
      }
    } catch (err) {
      const errorMsg =
        getApiErrorMessage(err, 'Failed to submit project. Please verify inputs.');
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRepoName = (url: string) => {
    try {
      const parts = url.split('/').filter(Boolean);
      return parts.length >= 2 ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}` : url;
    } catch {
      return url;
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
            Deliverable Ingestion Portal
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Submit your project repository and live deployment for reviewer assessment
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
          <Link href="/student/dashboard">
            <History className="h-3.5 w-3.5" />
            Submission Log
          </Link>
        </Button>
      </div>

      {/* Split-Screen Layout */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          {serverError && (
            <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Submission Error</span>
                {serverError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                Project Name *
              </label>
              <Input
                placeholder="e.g. DevPulse Platform"
                {...register('projectName')}
                error={errors.projectName?.message}
              />
            </div>

            {/* GitHub Repo URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono text-zinc-400 uppercase">
                  GitHub Repository URL *
                </label>
                <span className="text-[10px] font-mono text-zinc-500">Duplicate Protected</span>
              </div>
              <Input
                placeholder="https://github.com/username/project"
                {...register('repoUrl')}
                error={errors.repoUrl?.message}
              />
            </div>

            {/* Live Deployment Link */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                Production / Live Preview URL *
              </label>
              <Input
                placeholder="https://project.vercel.app"
                {...register('liveUrl')}
                error={errors.liveUrl?.message}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                Architecture & Implementation Overview *
              </label>
              <Textarea
                rows={4}
                placeholder="Detail the technical architecture, framework choices (e.g. Next.js App Router, Prisma ORM, Express), and key features..."
                {...register('description')}
                error={errors.description?.message}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="default"
                className="w-full gap-2 font-medium"
                isLoading={isSubmitting}
              >
                <Send className="h-3.5 w-3.5" />
                Submit Project to Review Queue
              </Button>
            </div>
          </form>
        </div>

        {/* Right Live Preview Column (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <Eye className="h-3.5 w-3.5 text-zinc-400" />
            <span>LIVE REVIEWER PREVIEW</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">Queue Card Preview</span>
              <Badge variant="warning" dot>
                PENDING
              </Badge>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white">
                {watchProjectName || 'Untitled Project'}
              </h4>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                Candidate: {user?.name} ({user?.email})
              </p>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed min-h-[40px] italic">
              {watchDescription
                ? watchDescription
                : 'Your project overview will render here in the review inspection queue...'}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1 text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                <GithubIcon className="h-3 w-3" />
                {watchRepoUrl ? getRepoName(watchRepoUrl) : 'repository'}
              </span>

              {watchLiveUrl && (
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <Globe className="h-3 w-3" /> live
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
