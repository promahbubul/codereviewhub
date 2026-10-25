import { PrismaClient, Role, SubmissionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash default password
  const salt = await bcrypt.genSalt(10);
  const mentorPassword = await bcrypt.hash('Mentor@12345', salt);
  const adminPassword = await bcrypt.hash('Admin@12345', salt);
  const studentPassword = await bcrypt.hash('Student@12345', salt);

  // 1. Seed Mentor & Admin
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@programming-hero.com' },
    update: {},
    create: {
      name: 'Arifin Ridoy (Lead Mentor)',
      email: 'mentor@programming-hero.com',
      password: mentorPassword,
      role: Role.MENTOR,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@programming-hero.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@programming-hero.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // 2. Seed Students
  const student1 = await prisma.user.upsert({
    where: { email: 'tanvir@student.ph' },
    update: {},
    create: {
      name: 'Tanvir Hasan',
      email: 'tanvir@student.ph',
      password: studentPassword,
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'nusrat@student.ph' },
    update: {},
    create: {
      name: 'Nusrat Jahan',
      email: 'nusrat@student.ph',
      password: studentPassword,
      role: Role.STUDENT,
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'rakib@student.ph' },
    update: {},
    create: {
      name: 'Rakibul Islam',
      email: 'rakib@student.ph',
      password: studentPassword,
      role: Role.STUDENT,
    },
  });

  console.log('✅ Users seeded successfully!');

  // 3. Clear existing submissions for clean re-seeding
  await prisma.submission.deleteMany({});

  // 4. Seed Submissions across different statuses
  const sampleSubmissions = [
    {
      projectName: 'DevFolio - Developer Portfolio Platform',
      repoUrl: 'https://github.com/tanvir-hasan/devfolio-app',
      liveUrl: 'https://devfolio-tanvir.vercel.app',
      description: 'A modern developer portfolio showcase with Next.js, Tailwind, and MDX blog posts.',
      status: SubmissionStatus.APPROVED,
      feedback: 'Great presentation, fully responsive layout and excellent lighthouse score!',
      studentId: student1.id,
      reviewedById: mentor.id,
      reviewedAt: new Date(),
    },
    {
      projectName: 'E-Shop Pro - Fullstack Marketplace',
      repoUrl: 'https://github.com/tanvir-hasan/eshop-pro',
      liveUrl: 'https://eshop-pro-tanvir.vercel.app',
      description: 'E-commerce platform with Stripe checkout, Prisma ORM, and JWT authentication.',
      status: SubmissionStatus.PENDING,
      studentId: student1.id,
    },
    {
      projectName: 'TaskPulse - Kanban Task Manager',
      repoUrl: 'https://github.com/nusrat-jahan/task-pulse',
      liveUrl: 'https://taskpulse-preview.netlify.app',
      description: 'Collaborative task management with drag and drop support and real-time updates.',
      status: SubmissionStatus.APPROVED,
      feedback: 'Clean code, excellent state management handling using Zustand.',
      studentId: student2.id,
      reviewedById: mentor.id,
      reviewedAt: new Date(),
    },
    {
      projectName: 'Weatherly - Realtime Forecast App',
      repoUrl: 'https://github.com/nusrat-jahan/weatherly-app',
      liveUrl: 'https://weatherly-nusrat.vercel.app',
      description: 'Weather forecasting application using OpenWeather API with geolocation search.',
      status: SubmissionStatus.REJECTED,
      feedback: 'Missing rate-limiting on search inputs and API keys were exposed in client bundle. Please fix and resubmit.',
      studentId: student2.id,
      reviewedById: mentor.id,
      reviewedAt: new Date(),
    },
    {
      projectName: 'LearnSphere - Online Course LMS',
      repoUrl: 'https://github.com/rakib-dev/learn-sphere',
      liveUrl: 'https://learnsphere-lms.vercel.app',
      description: 'LMS portal with video player, quiz engine, and student grade tracking.',
      status: SubmissionStatus.PENDING,
      studentId: student3.id,
    },
    {
      projectName: 'FinTrack - Personal Finance Tracker',
      repoUrl: 'https://github.com/rakib-dev/fintrack',
      liveUrl: 'https://fintrack-rakib.vercel.app',
      description: 'Expense tracker with interactive charts, budget limits, and CSV export feature.',
      status: SubmissionStatus.PENDING,
      studentId: student3.id,
    },
    // Extra rows so the mentor table spans more than one page (limit = 10) out of the box
    {
      projectName: 'ChatNest - Realtime Chat Rooms',
      repoUrl: 'https://github.com/tanvir-hasan/chatnest',
      liveUrl: 'https://chatnest-tanvir.vercel.app',
      description: 'Socket.io powered chat rooms with typing indicators, read receipts and JWT auth.',
      status: SubmissionStatus.PENDING,
      studentId: student1.id,
    },
    {
      projectName: 'RecipeBox - Meal Planner',
      repoUrl: 'https://github.com/tanvir-hasan/recipebox',
      liveUrl: 'https://recipebox-tanvir.netlify.app',
      description: 'Weekly meal planner with grocery list generation and nutrition breakdown per recipe.',
      status: SubmissionStatus.REJECTED,
      feedback: 'Live link returns 404 on refresh. Configure SPA fallback redirects and resubmit.',
      studentId: student1.id,
      reviewedById: mentor.id,
      reviewedAt: new Date(),
    },
    {
      projectName: 'BookShelf - Library Management',
      repoUrl: 'https://github.com/nusrat-jahan/bookshelf',
      liveUrl: 'https://bookshelf-nusrat.vercel.app',
      description: 'Library system with book borrowing, due-date reminders and admin inventory panel.',
      status: SubmissionStatus.APPROVED,
      feedback: 'Well-structured Prisma relations and clear role separation. Nice work!',
      studentId: student2.id,
      reviewedById: mentor.id,
      reviewedAt: new Date(),
    },
    {
      projectName: 'JobBoard - Remote Jobs Portal',
      repoUrl: 'https://github.com/nusrat-jahan/jobboard',
      liveUrl: 'https://jobboard-nusrat.vercel.app',
      description: 'Job listing portal with company dashboards, applicant tracking and search filters.',
      status: SubmissionStatus.PENDING,
      studentId: student2.id,
    },
    {
      projectName: 'HealthLog - Fitness Tracker',
      repoUrl: 'https://github.com/nusrat-jahan/healthlog',
      liveUrl: 'https://healthlog-nusrat.vercel.app',
      description: 'Workout and calorie tracker with weekly progress charts and goal reminders.',
      status: SubmissionStatus.PENDING,
      studentId: student2.id,
    },
    {
      projectName: 'EventHub - Event Ticketing',
      repoUrl: 'https://github.com/rakib-dev/eventhub',
      liveUrl: 'https://eventhub-rakib.vercel.app',
      description: 'Event creation and ticket booking with QR code check-in and organizer analytics.',
      status: SubmissionStatus.APPROVED,
      feedback: 'Solid validation and good use of server-side pagination. Approved.',
      studentId: student3.id,
      reviewedById: mentor.id,
      reviewedAt: new Date(),
    },
    {
      projectName: 'CodeSnip - Snippet Manager',
      repoUrl: 'https://github.com/rakib-dev/codesnip',
      liveUrl: 'https://codesnip-rakib.vercel.app',
      description: 'Save, tag and share code snippets with syntax highlighting and full-text search.',
      status: SubmissionStatus.REJECTED,
      feedback: 'Search endpoint has no input validation and crashes on special characters. Add Zod validation.',
      studentId: student3.id,
      reviewedById: mentor.id,
      reviewedAt: new Date(),
    },
    {
      projectName: 'TravelMate - Trip Planner',
      repoUrl: 'https://github.com/rakib-dev/travelmate',
      liveUrl: 'https://travelmate-rakib.vercel.app',
      description: 'Collaborative itinerary planner with map integration and shared expense splitting.',
      status: SubmissionStatus.PENDING,
      studentId: student3.id,
    },
  ];

  for (const sub of sampleSubmissions) {
    await prisma.submission.create({
      data: sub,
    });
  }

  console.log(`✅ Seeded ${sampleSubmissions.length} sample submissions.`);
  console.log('\n--- Seed Credentials Summary ---');
  console.log('Mentor:  email: mentor@programming-hero.com | pass: Mentor@12345');
  console.log('Admin:   email: admin@programming-hero.com  | pass: Admin@12345');
  console.log('Student: email: tanvir@student.ph          | pass: Student@12345');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
