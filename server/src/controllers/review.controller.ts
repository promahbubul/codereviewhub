import { Response } from 'express';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { AuthRequest } from '../types';
import prisma from '../prisma';
import { UpdateStatusInput } from '../validators/submission.validator';

export const getSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const statusParam = (req.query.status as string)?.toUpperCase();
    const searchParam = (req.query.search as string)?.trim();

    // Construct server-side filtering criteria
    const whereClause: Prisma.SubmissionWhereInput = {};

    // Server-side status filter
    if (statusParam && Object.values(SubmissionStatus).includes(statusParam as SubmissionStatus)) {
      whereClause.status = statusParam as SubmissionStatus;
    }

    // Optional server-side search filter
    if (searchParam) {
      whereClause.OR = [
        { projectName: { contains: searchParam, mode: 'insensitive' } },
        { repoUrl: { contains: searchParam, mode: 'insensitive' } },
        { student: { name: { contains: searchParam, mode: 'insensitive' } } },
        { student: { email: { contains: searchParam, mode: 'insensitive' } } },
      ];
    }

    // Parallel execution for total count and paginated items
    const [total, submissions] = await Promise.all([
      prisma.submission.count({ where: whereClause }),
      prisma.submission.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      data: submissions,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Get review submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching review submissions',
    });
  }
};

export const updateSubmissionStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const mentorId = req.user!.id;
    const { status, feedback } = req.body as UpdateStatusInput;

    // Check if the submission exists
    const existing = await prisma.submission.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
      return;
    }

    // Update status, feedback, reviewer info and timestamp
    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status,
        feedback: feedback ? feedback.trim() : null,
        reviewedById: mentorId,
        reviewedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Submission marked as ${status} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating submission status',
    });
  }
};

export const getStatistics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [total, pending, approved, rejected, totalStudents] = await Promise.all([
      prisma.submission.count(),
      prisma.submission.count({ where: { status: SubmissionStatus.PENDING } }),
      prisma.submission.count({ where: { status: SubmissionStatus.APPROVED } }),
      prisma.submission.count({ where: { status: SubmissionStatus.REJECTED } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        totalStudents,
      },
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while calculating statistics',
    });
  }
};
