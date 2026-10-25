import { z } from 'zod';
import { SubmissionStatus } from '@prisma/client';
import { normalizeRepoUrl } from '../utils/url';

export const createSubmissionSchema = z.object({
  projectName: z
    .string({ required_error: 'Project name is required' })
    .trim()
    .min(3, 'Project name must be at least 3 characters long')
    .max(100, 'Project name cannot exceed 100 characters'),
  repoUrl: z
    .string({ required_error: 'Repository URL is required' })
    .trim()
    .url('Repository must be a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'Repository URL must start with http:// or https://'
    )
    .transform(normalizeRepoUrl),
  liveUrl: z
    .string({ required_error: 'Live deployment URL is required' })
    .trim()
    .url('Live link must be a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'Live link must start with http:// or https://'
    ),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters'),
});

export const updateStatusSchema = z.object({
  status: z.enum([SubmissionStatus.APPROVED, SubmissionStatus.REJECTED], {
    required_error: 'Status is required and must be either APPROVED or REJECTED',
  }),
  feedback: z
    .string()
    .trim()
    .max(1000, 'Feedback cannot exceed 1000 characters')
    .optional()
    .nullable(),
}).superRefine((data, ctx) => {
  // A rejection without a reason leaves the student with nothing to act on
  if (data.status === SubmissionStatus.REJECTED && (data.feedback?.length ?? 0) < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['feedback'],
      message: 'Feedback of at least 10 characters is required when rejecting a submission',
    });
  }
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
