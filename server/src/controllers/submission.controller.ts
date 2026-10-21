import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../prisma';
import { CreateSubmissionInput } from '../validators/submission.validator';

export const createSubmission = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const { projectName, repoUrl, liveUrl, description } = req.body as CreateSubmissionInput;

    // Duplicate Prevention Check:
    // Check if the student has already submitted a project with the same repository URL
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        studentId,
        repoUrl: {
          equals: repoUrl.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingSubmission) {
      res.status(409).json({
        success: false,
        message: 'Duplicate submission detected: You have already submitted this repository URL. Duplicate submissions are not allowed.',
        data: {
          existingSubmissionId: existingSubmission.id,
          status: existingSubmission.status,
        },
      });
      return;
    }

    // Create the submission
    const newSubmission = await prisma.submission.create({
      data: {
        projectName: projectName.trim(),
        repoUrl: repoUrl.trim(),
        liveUrl: liveUrl.trim(),
        description: description.trim(),
        studentId,
      },
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

    res.status(201).json({
      success: true,
      message: 'Project submitted successfully for mentor review!',
      data: newSubmission,
    });
  } catch (error: any) {
    console.error('Create submission error:', error);

    // Handle database unique constraint violation if race condition occurs
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A submission with this repository URL already exists in your account.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while saving submission',
    });
  }
};

export const getMySubmissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user!.id;

    const submissions = await prisma.submission.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
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
      data: submissions,
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching submissions',
    });
  }
};
