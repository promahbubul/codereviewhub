import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Layers, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div
      suppressHydrationWarning
      className="relative overflow-hidden subtle-grid min-h-[calc(100vh-3.5rem)] flex flex-col justify-between"
    >
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 pt-20 pb-20 sm:px-6 lg:px-8 text-center" suppressHydrationWarning>
        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-[1.15]">
          Automate Code Submissions & Review Workflows
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          A centralized platform for developers and students to submit project deliverables,
          enforce repository integrity, and streamline real-time code evaluation.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex items-center justify-center gap-3" suppressHydrationWarning>
          <Link href="/signup">
            <Button size="lg" className="gap-2 font-medium">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="font-medium">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8 border-t border-zinc-900 pt-16" suppressHydrationWarning>
        <div className="grid md:grid-cols-3 gap-6 text-left" suppressHydrationWarning>
          <div className="p-5 rounded-lg border border-zinc-800/80 bg-zinc-950/40" suppressHydrationWarning>
            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3" suppressHydrationWarning>
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">
              Role-Based Access Control
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Stateless JWT verification with strict role enforcement protecting mentor and student
              route boundaries at the API gateway layer.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-zinc-800/80 bg-zinc-950/40" suppressHydrationWarning>
            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3" suppressHydrationWarning>
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">
              Duplicate Prevention Engine
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Composite unique constraint indexing (`studentId + repoUrl`) preventing redundant
              evaluations and accidental double submissions.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-zinc-800/80 bg-zinc-950/40" suppressHydrationWarning>
            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3" suppressHydrationWarning>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">
              Server-Side Evaluation Pipeline
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              PostgreSQL count aggregations, server-side paginated queries, and structured feedback
              storage with reviewer traceability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
