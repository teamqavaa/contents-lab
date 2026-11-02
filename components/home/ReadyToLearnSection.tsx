// components/home/ReadyToLearnSection.tsx — appel à l'action de fin de page (Learn → Practise → Grow)
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

import { plural } from '@/lib/format';

export default function ReadyToLearnSection({ courses, categories }: { courses: number; categories: number }) {
  const steps = [
    {
      title: 'Learn',
      text: courses > 0 ? `Pick one of ${plural(courses, 'course')} with expert-led lessons` : 'Pick a course with expert-led lessons',
    },
    { title: 'Practise', text: 'Apply each lesson in the Practice Lab' },
    {
      title: 'Grow',
      text: categories > 1 ? `Move toward one of ${categories} career paths` : 'Move toward the career path you chose',
    },
  ];

  return (
    <section aria-labelledby="ready-title" className="w-full bg-white px-4 py-20 md:px-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-neutral-900 px-6 py-12 sm:px-12 md:py-14">
        <Zap
          className="pointer-events-none absolute -right-6 -top-8 h-56 w-56 rotate-12 fill-white/[0.04] text-white/[0.04]"
          aria-hidden="true"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 id="ready-title" className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Ready to start
              <br />
              <span className="text-lime-300">learning?</span>
            </h2>
            <p className="mt-4 text-neutral-300">Find a course that interests you and start learning now!</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn btn-lg bg-lime-300 text-neutral-900 hover:bg-lime-200">
                Explore Courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/career-tracks"
                className="btn btn-lg border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Explore Careers
              </Link>
            </div>
          </div>

          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex items-center gap-5 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                <span className="text-xs font-bold text-lime-300">{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block text-sm font-bold text-white">{step.title}</span>
                  <span className="block text-sm text-neutral-400">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
