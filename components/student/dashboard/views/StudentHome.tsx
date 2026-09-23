"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Route, Sparkles } from "lucide-react";

import { Badge } from "@/components/student/ui/badge";
import { Card, CardContent } from "@/components/student/ui/card";
import { LessonRow } from "@/components/student/dashboard/student/LessonRow";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";

export type StudentHomeCourse = {
  title: string;
  kind: string;
  duration: string;
  href: string;
};

export type StudentHomeRecommendation = {
  eyebrow: string;
  title: string;
  description: string;
  reason: string;
  href: string;
  ctaLabel: string;
};

export type StudentHomeStat = {
  label: string;
  value: string;
  meta: string;
  icon: string;
};

export type StudentHomeData = {
  stats: StudentHomeStat[];
  keepGoing: { title: string; kind: string; progress: number; href: string }[];
  recommendation: StudentHomeRecommendation | null;
  featuredCourses: StudentHomeCourse[];
};

// Uppercase tracked eyebrows match the public homepage section headers.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase md:text-sm">
      {children}
    </h2>
  );
}

export default function StudentHome({ data }: { data: StudentHomeData }) {
  const { user } = useUser();
  const firstName = user?.full_name?.split(" ")[0] || user?.display_name?.split(" ")[0] || "there";

  return (
    <div className="w-full">
      {/* Welcome hero, styled after the homepage banner. */}
      <section className="w-full bg-white px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-semibold tracking-tight text-gray-700 shadow-sm">
            Welcome back, {firstName}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
            Continue your journey.
          </h1>
          <p className="max-w-2xl text-lg font-medium text-gray-600 md:text-xl">
            Pick up where you left off, sharpen a skill, or explore a new track.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Upskilling: tracks entry points. */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/skill-tracks"
            className="flex items-center justify-between rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div>
              <h3 className="text-base font-bold text-neutral-900">Skill tracks</h3>
              <p className="mt-1 text-sm font-medium text-neutral-500">
                Sharpen one skill with focused labs.
              </p>
            </div>
            <Route size={18} strokeWidth={1.5} className="text-blue-400" />
          </Link>
          <Link
            href="/career-tracks"
            className="flex items-center justify-between rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div>
              <h3 className="text-base font-bold text-neutral-900">Career tracks</h3>
              <p className="mt-1 text-sm font-medium text-neutral-500">
                Follow a guided path to a role.
              </p>
            </div>
            <Sparkles size={18} strokeWidth={1.5} className="text-blue-400" />
          </Link>
        </section>

        {/* CTA banners: labs and pacing. */}
        <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card className="rounded-3xl bg-black shadow-xl">
            <CardContent className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-white">Explore labs</h3>
              <p className="text-sm text-neutral-400">
                Hands-on environments. Practice by doing, not watching.
              </p>
              <Link
                href="/explore-labs"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-blue-400 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-neutral-800"
              >
                Go to labs
                <span className="flex size-6 items-center justify-center rounded-full bg-white text-black">
                  <ChevronRight size={14} strokeWidth={2} />
                </span>
              </Link>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-neutral-100 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-neutral-900">Set your pace</h3>
              <p className="text-sm font-medium text-neutral-500">
                Pick a track, plan your week, and watch your streak grow.
              </p>
              <Link
                href="/all-tracks"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-blue-400 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-neutral-800"
              >
                View tracks
                <span className="flex size-6 items-center justify-center rounded-full bg-white text-black">
                  <ChevronRight size={14} strokeWidth={2} />
                </span>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Discovery: backend-picked recommendation. */}
        <section className="mt-10">
          <Eyebrow>Recommended for you</Eyebrow>
          {data.recommendation ? (
            <Card className="mt-4 rounded-3xl border border-neutral-100 bg-white shadow-sm">
              <CardContent className="flex flex-col gap-2">
                <span className="w-fit rounded-full bg-neutral-100 px-4 py-1 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                  {data.recommendation.eyebrow}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-neutral-900">
                  {data.recommendation.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-500">
                  {data.recommendation.description}
                </p>
                <span className="mt-1 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                  {data.recommendation.reason}
                </span>
                <Link
                  href={data.recommendation.href}
                  className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-blue-400 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-neutral-800"
                >
                  {data.recommendation.ctaLabel}
                  <span className="flex size-6 items-center justify-center rounded-full bg-white text-black">
                    <ChevronRight size={14} strokeWidth={2} />
                  </span>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <p className="mt-4 text-sm font-medium text-neutral-500">
              Recommendations show up once you browse a few courses.
            </p>
          )}
        </section>

        {/* Discovery: featured courses. */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <Eyebrow>Discover courses</Eyebrow>
            <Link
              href="/browse-courses"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 transition-colors hover:text-neutral-600"
            >
              Browse all
              <ChevronRight
                size={16}
                strokeWidth={2}
                className="text-blue-400 transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.featuredCourses.map((course) => (
              <Link
                key={course.href}
                href={course.href}
                className="flex flex-col justify-between rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <Badge
                    variant="outline"
                    className="rounded-full bg-transparent text-xs font-semibold tracking-widest text-neutral-500 uppercase"
                  >
                    {course.kind}
                  </Badge>
                  <h3 className="mt-2 text-sm font-bold leading-snug text-neutral-900">
                    {course.title}
                  </h3>
                </div>
                <span className="mt-4 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                  {course.duration}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Keep going: in-progress work. */}
        {data.keepGoing.length > 0 && (
          <section className="mt-10">
            <Eyebrow>Keep going</Eyebrow>
            <div
              className={cn(
                "mt-4 flex flex-col rounded-3xl border border-neutral-100 bg-white px-2 py-1 shadow-sm"
              )}
            >
              {data.keepGoing.map((row) => (
                <LessonRow key={row.href} data={row} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
