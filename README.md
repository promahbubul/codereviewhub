# 🚀 Fullstack Project Submission & Review Dashboard

> **Hiring Assessment:** Associate Web Instructor  
> **Organization:** Programming Hero & Next Level Recruitment Team  
> **Candidate Submission Deadline:** October 25, 2026 (11:59 PM)  
> **Submission URL:** [Assessment Submission Google Form](https://forms.gle/uoYk7kb1zvTAfqow8)

---

## 🌟 Overview & Architecture

A production-grade, defensive full-stack web application designed for student project submissions and real-time mentor evaluation with strict **Role-Based Access Control (RBAC)**, server-side pagination, defensive validation, and anti-spam rate limiting.

### 🛠️ Technology Stack
* **Language:** TypeScript (Strict Mode throughout client and server)
* **Frontend:** Next.js (App Router), Tailwind CSS v4, ShadCN UI (Radix primitives + CVA variants: Dialog, Table, Button, Badge...), Lucide Icons
* **Backend:** Express.js + TypeScript RESTful architecture
* **Database & ORM:** PostgreSQL (Neon Cloud) + Prisma ORM
* **Authentication:** JWT (JSON Web Tokens) with role enforcement (`STUDENT`, `MENTOR`, `ADMIN`)
* **Validation:** End-to-end schema validation via Zod
* **Rate Limiting:** `express-rate-limit` anti-spam middleware

---

## 🔑 Pre-Seeded Test Accounts

The cloud PostgreSQL database comes pre-seeded with sample submissions and test accounts:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Lead Mentor** | `mentor@programming-hero.com` | `Mentor@12345` | Access to Review Dashboard, Server-side Filters, Stats & Status Actions |
| **Student (Tanvir)** | `tanvir@student.ph` | `Student@12345` | Project submission portal, duplicate prevention check, my submissions |
| **System Admin** | `admin@programming-hero.com` | `Admin@12345` | Full administrative evaluation privileges |


---

## 📋 Features Checklist & Implementation Details

### 1. Student Submission Portal (`/student/submit` & `/student/dashboard`)
* ✅ **Comprehensive Form:** Project name, GitHub Repository URL, Live Deployment URL, and Technical Description.
* ✅ **Defensive Validation:** Strict Zod schema enforcing valid URL protocols (`http/https`), string length boundaries, and sanitized text.
* ✅ **Duplicate Prevention:** Repo URLs are canonicalized (case, `www.`, trailing `/`, `.git`, query string) before hitting the PostgreSQL composite unique index (`@@unique([studentId, repoUrl])`), so cosmetic variants of the same repository are rejected with `409 Conflict`.
* ✅ **Anti-Spam Rate Limit:** Protected by `express-rate-limit` (10 submissions / 15 minutes, keyed per authenticated student so shared campus IPs do not block each other).
* ✅ **Student History Portal:** Real-time visibility into previous submissions, review status badges (`Pending`, `Approved`, `Rejected`), and constructive mentor feedback notes.

### 2. Mentor Review Dashboard (`/mentor/dashboard`)
* ✅ **Aggregated Statistics:** Real-time metrics computed directly by PostgreSQL count aggregations:
  * Total Submissions
  * Total Pending Reviews
  * Total Approved Projects
  * Total Rejected Projects
* ✅ **Server-Side Filtering:** Query-driven filtering (`?status=APPROVED`, `?status=REJECTED`, `?status=PENDING`) executed on the database level.
* ✅ **Paginated Data Table:** Server-side pagination (`page`, `limit`, `totalPages`) with quick navigation controls.
* ✅ **Approval / Rejection Action Modal:** Accessible ShadCN Dialog to approve or reject submissions. Rejections require feedback (min 10 chars, enforced on both client and server) so students always know what to fix. Reviewer identity and timestamp are recorded.
* ✅ **Search:** Debounced (400ms) server-side search matching project name, repo URL, student name, or student email.

### 3. Authentication & RBAC (`/login` & `/signup`)
* ✅ Secure password hashing with `bcryptjs` (salt rounds: 10).
* ✅ JWT token verification middleware with automatic session restoration and role claims.
* ✅ Role Guard middleware (`requireRole(['MENTOR', 'ADMIN'])`) preventing students from viewing or mutating mentor endpoints (returns `403 Forbidden`).
* ✅ Seamless redirection upon login to the appropriate portal according to role.

---

## 📂 Repository Structure (Monorepo)

```text
├── client/                      # Next.js Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/    # Login page (role-based redirect)
│   │   │   ├── (auth)/signup/   # Student signup page
│   │   │   ├── student/submit/  # Project submission portal
│   │   │   ├── student/dashboard/# Student submission history & feedback
│   │   │   └── mentor/dashboard/# Paginated review table, stats & actions
│   │   ├── components/ui/       # ShadCN UI components (components.json)
│   │   ├── context/AuthContext  # JWT auth context & session provider
│   │   └── lib/api.ts           # Axios client with JWT request interceptor
│   └── package.json
│
├── server/                      # Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma        # Models: User, Submission, Enums: Role, Status
│   │   └── seed.ts              # Seeder with pre-configured accounts & submissions
│   ├── src/
│   │   ├── controllers/         # auth, submission, review controllers
│   │   ├── middlewares/         # auth, role (RBAC), rateLimiter, zod validator
│   │   ├── routes/              # Express route definitions
│   │   └── server.ts            # Server bootstrap
│   └── package.json
│
├── Web Instructor - Hiring Task.pdf
├── email.txt
├── PROJECT_PLAN.md              # Detailed planning & video strategy document
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
* Node.js v18+ (tested on Node.js v24)
* npm v9+

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd october
```

### 2. Configure Environment Variables

**Server Environment (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="super_secret_jwt_key_programming_hero_task_2026_secure"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:3000"
```

**Client Environment (`client/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies & Seed Database
From the project root:
```bash
# Install dependencies for both server and client
npm run install:all

# Generate Prisma client and seed database
npm run seed
```

### 4. Run Development Servers
Open two terminals or run from root:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
# Server starts at http://localhost:5000 (Health check: http://localhost:5000/api/health)
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Next.js app starts at http://localhost:3000
```

---

## 🎥 Part 2: Video Presentation Strategy (Bengali, OBS)

As instructed in the assessment document:
* **OBS Setup:** Screen recording with facecam located in the **lower-right corner**.
* **Language:** Bengali.
* **Duration:** 10–12 minutes strictly per video.

### Selected Topics:
1. **Video 1 (Category 1 - Theoretical Concept):**
   * **Topic 1C:** *Authentication vs. Authorization (RBAC)*
   * Demystifying identity verification (AuthN) vs permission enforcement (AuthZ).
   * Explaining JWT claims, stateless verification vs database querying, and role-based middleware architecture.
2. **Video 2 (Category 2 - Hands-on Coding Demonstration):**
   * **Topic 2A:** *Securing a Route Handler*
   * Demonstrating how to extract token headers, verify user claims, query Prisma database, and enforce RBAC guards before updating submission status.

---

## 📄 License
Created for the **Programming Hero & Next Level Recruitment Task Assessment (Associate Web Instructor)**.
