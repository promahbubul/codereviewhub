'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Send,
  Globe,
  FolderGit2,
  FileText,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  History,
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

const submissionFormSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, 'Project name must be at least 3 characters long')
    .max(100, 'Project name cannot exceed 100 characters'),
  repoUrl: z
    .string()
    .trim()
    .url('Must be a valid URL (e.g. https://github.com/username/project)')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'Repository URL must start with http:// or https://'
    ),
  liveUrl: z
    .string()
    .trim()
    .url('Must be a valid deployment URL (e.g. https://myproject.vercel.app)')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'Live link must start with http:// or https://'
    ),
  description: z
    .string()
    .trim()
    .min(10, 'Please provide at least 10 characters describing key features & tech stack')
    .max(2000, 'Description cannot exceed 2000 characters'),
});

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

export default function StudentSubmitPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth() as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
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
        toast.success('🎉 Project submitted successfully for mentor review!');
        reset();
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Failed to submit project. Please verify inputs.';
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Project Submission Portal
            </h1>
            <Badge variant="info">Student View</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Submit your full-stack project for comprehensive mentor review and assessment
          </p>
        </div>

        <Link href="/student/dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            View Past Submissions
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form Card (2 Cols) */}
        <div className="md:col-span-2">
          <Card className="border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Submit New Project</CardTitle>
              <CardDescription>
                All fields are required. Please ensure live link and repository are accessible.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {serverError && (
                <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-semibold block mb-0.5">Submission Error</span>
                    {serverError}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Project Name *
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="e.g. DevPulse - Task Management Suite"
                      {...register('projectName')}
                      error={errors.projectName?.message}
                      className="pl-9"
                    />
                    <FolderGit2 className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* GitHub Repository URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    GitHub Repository URL *
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="https://github.com/your-username/your-repo"
                      {...register('repoUrl')}
                      error={errors.repoUrl?.message}
                      className="pl-9"
                    />
                    <GithubIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Duplicate Prevention: Submitting the same repo URL twice will be rejected.
                  </p>
                </div>

                {/* Live Deployment Link */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Live Demo Link *
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="https://your-project.vercel.app"
                      {...register('liveUrl')}
                      error={errors.liveUrl?.message}
                      className="pl-9"
                    />
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Project Description & Technical Overview *
                  </label>
                  <div className="relative">
                    <Textarea
                      rows={4}
                      placeholder="Briefly describe what your app does, key technologies used (e.g. Next.js, Express, Prisma), and how to test it..."
                      {...register('description')}
                      error={errors.description?.message}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full gap-2 font-semibold shadow-lg shadow-indigo-500/20 mt-2"
                  isLoading={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  Submit Project for Review
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info & Guidelines */}
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle className="text-sm font-semibold">Defensive Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Duplicate Guard:</strong> Enforced by DB unique constraints and API logic.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Spam Rate Limit:</strong> Maximum 10 submissions per 15 minutes.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Zod Validation:</strong> URL schemas, character length bounds.
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200">
                Review Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-2">
              <p>• Clean code architecture & TypeScript strictness</p>
              <p>• Robust state management & UI error boundaries</p>
              <p>• Verified role-based route protection</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
