import Link from "next/link";

import type { CoursePathContext } from "@/types/student/course";

export default function PathContextCard({ paths }: { paths: CoursePathContext[] }) {
  if (paths.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {paths.map((path) => (
        <div key={path.id} className="rounded-xl border border-zinc-200 bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Part of this learning path
          </p>
          <p className="mt-2 text-base font-semibold text-foreground">{path.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Course {path.position} of {path.total_courses} in this path
          </p>
          <Link
            href={`/learning-path/${path.kind}/${path.slug}`}
            className="mt-3 inline-block text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-zinc-600"
          >
            View the full path &rarr;
          </Link>
        </div>
      ))}
    </div>
  );
}
