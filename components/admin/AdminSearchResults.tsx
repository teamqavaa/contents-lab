"use client";

import { useMemo } from "react";
import Link from "next/link";

import type {
  Course,
  CourseType,
  LearningPath,
  Quiz,
} from "@/lib/api/courses-api";
import type { AdminUser, Lab, Skill } from "@/lib/api/lab-api";

type AdminSearchResultsProps = {
  initialQuery: string;
  hasError: boolean;
  skills: Skill[];
  labs: Lab[];
  users: AdminUser[];
  courses: Course[];
  courseTypes: CourseType[];
  quizzes: Quiz[];
  learningPaths: LearningPath[];
};

function matchesQuery(
  haystacks: (string | null | undefined)[],
  query: string
): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return haystacks.some((value) => !!value && value.toLowerCase().includes(needle));
}

type ResultGroup = {
  id: string;
  title: string;
  items: { id: string; label: string; meta: string; href: string }[];
};

export function AdminSearchResults({
  initialQuery,
  hasError,
  skills,
  labs,
  users,
  courses,
  courseTypes,
  quizzes,
  learningPaths,
}: AdminSearchResultsProps) {
  const query = initialQuery.trim();

  const groups = useMemo<ResultGroup[]>(() => {
    const out: ResultGroup[] = [];

    const skillHits = skills.filter((s) =>
      matchesQuery([s.title, s.slug, s.description], query)
    );
    if (skillHits.length > 0) {
      out.push({
        id: "skills",
        title: "Skills",
        items: skillHits.map((s) => ({
          id: s.id,
          label: s.title,
          meta: s.slug,
          href: "/admin/skills",
        })),
      });
    }

    const labHits = labs.filter((l) =>
      matchesQuery([l.title, l.description, l.language, l.skill_slug], query)
    );
    if (labHits.length > 0) {
      out.push({
        id: "labs",
        title: "Labs",
        items: labHits.map((l) => ({
          id: l.id,
          label: l.title,
          meta: l.language,
          href: "/admin/labs",
        })),
      });
    }

    const userHits = users.filter((u) =>
      matchesQuery([u.full_name, u.display_name, u.email, u.phone, u.role], query)
    );
    if (userHits.length > 0) {
      out.push({
        id: "users",
        title: "Users",
        items: userHits.map((u) => ({
          id: u.id,
          label: u.full_name || u.email || u.phone || "—",
          meta: `${u.role}${u.is_staff ? " · staff" : ""}`,
          href: "/admin/users",
        })),
      });
    }

    const courseHits = courses.filter((c) =>
      matchesQuery(
        [c.title, c.subtitle, c.instructor, c.audience, c.cohort_label],
        query
      )
    );
    if (courseHits.length > 0) {
      out.push({
        id: "courses",
        title: "Courses",
        items: courseHits.map((c) => ({
          id: String(c.id),
          label: c.title,
          meta: c.level,
          href: "/admin/courses",
        })),
      });
    }

    const categoryHits = courseTypes.filter((t) =>
      matchesQuery([t.name, t.slug, t.description], query)
    );
    if (categoryHits.length > 0) {
      out.push({
        id: "categories",
        title: "Course categories",
        items: categoryHits.map((t) => ({
          id: String(t.id),
          label: t.name,
          meta: t.slug,
          href: "/admin/categories",
        })),
      });
    }

    const quizHits = quizzes.filter((qz) =>
      matchesQuery([qz.title, qz.slug, qz.description], query)
    );
    if (quizHits.length > 0) {
      out.push({
        id: "quizzes",
        title: "Quizzes",
        items: quizHits.map((qz) => ({
          id: String(qz.id),
          label: qz.title,
          meta: qz.is_active ? "active" : "inactive",
          href: "/admin/quizzes",
        })),
      });
    }

    const pathHits = learningPaths.filter((p) =>
      matchesQuery([p.title, p.description, p.icon], query)
    );
    if (pathHits.length > 0) {
      out.push({
        id: "learning-paths",
        title: "Learning paths",
        items: pathHits.map((p) => ({
          id: String(p.id),
          label: p.title,
          meta: p.kind,
          href: "/admin/learning-paths",
        })),
      });
    }

    return out;
  }, [query, skills, labs, users, courses, courseTypes, quizzes, learningPaths]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  if (!query) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-muted-foreground">
        Type a query to search users, courses, skills, and the rest of the admin.
      </p>
    );
  }

  if (hasError) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Some sections could not be loaded, so results may be incomplete.
      </p>
    );
  }

  if (total === 0) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-muted-foreground">
        No admin records match this search.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {total} result{total === 1 ? "" : "s"} found.
      </p>
      {groups.map((group) => (
        <section key={group.id}>
          <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {group.title} · {group.items.length}
          </h2>
          <ul className="flex flex-col divide-y divide-zinc-100 rounded-xl border bg-white">
            {group.items.map((item) => (
              <li key={`${group.id}-${item.id}`}>
                <Link
                  href={item.href}
                  className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm transition-colors hover:bg-zinc-50"
                >
                  <span className="truncate font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {item.meta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}