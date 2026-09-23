import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getActivePathsAction } from "@/actions/student/learning-paths";
import { getMyPathProgressAction } from "@/actions/student/course-progress";
import { getPathDetailAction } from "@/actions/student/path-detail";
import { ChecklistItem } from "@/components/student/dashboard/path-detail/ChecklistItem";
import { RoadmapStep } from "@/components/student/dashboard/path-detail/RoadmapStep";
import {
  SidebarCard,
  StatMiniBlock,
} from "@/components/student/dashboard/path-detail/SidebarCard";
import { PathIconBadge } from "@/components/student/dashboard/path-detail/PathIconBadge";
import { getPathIcon } from "@/components/student/dashboard/path-icons";
import PageBreadcrumbs, {
  type PageCrumb,
} from "@/components/student/dashboard/PageBreadcrumbs";
import { buildProgressMap, deriveSteps } from "@/lib/student/path-status";

// One detail view for every path kind; routes only pick the kind. Overrides
// let the student-home shell reuse the same view with its own breadcrumbs and
// course-detail links (e.g. routed through the browse-courses student page).
export default async function PathDetailView({
  kind,
  slug,
  crumbs,
  courseLinkBase = "/courses",
}: {
  kind: "career" | "skill";
  slug: string;
  crumbs?: PageCrumb[];
  courseLinkBase?: string;
}) {
  // Unknown slug is only a real 404 when the API answered; an API outage
  // must degrade to the coming-soon state instead of a broken page.
  const { paths, error } = await getActivePathsAction(kind);
  if (error) {
    return <ComingSoon />;
  }
  const summary = paths.find((item) => item.slug === slug);
  if (!summary) {
    notFound();
  }

  const crumbsToRender =
    crumbs ??
    [
      { label: "Tracks", href: "/learning-path" },
      { label: kind === "career" ? "Career" : "Skill", href: `/learning-path/${kind}` },
      { label: summary.title, href: `/learning-path/${kind}/${slug}` },
    ];

  const { detail } = await getPathDetailAction(summary.id);
  if (!detail) {
    return <ComingSoon breadcrumbs={<PageBreadcrumbs className="mb-6" items={crumbsToRender} />} />;
  }

  const { progress } = await getMyPathProgressAction(slug);
  const steps = deriveSteps(detail.courses, buildProgressMap(progress));

  const totalMinutes = detail.courses.reduce(
    (sum, course) => sum + (course.duration_minutes ?? 0),
    0
  );
  const sortedOutcomes = [...detail.outcomes].sort((a, b) => a.order - b.order);
  const sortedPrerequisites = [...detail.prerequisites].sort((a, b) => a.order - b.order);

  const metaBits = [
    `${steps.length} COURSES`,
    detail.duration_weeks > 0 ? `${detail.duration_weeks} WEEKS` : null,
    detail.pace || "Self-paced",
    detail.includes_certificate ? "Certificate" : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <PageBreadcrumbs className="mb-6" items={crumbsToRender} />
      {/* Header */}
      <PathIconBadge icon={getPathIcon(detail.kind, detail.icon)} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {detail.title}
      </h1>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
        {detail.description}
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {metaBits.join(" · ")}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <main className="min-w-0 space-y-12">
          <section>
            <h2 className="border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              PATH ROADMAP
            </h2>

            <div className="relative mt-6">
              <div aria-hidden className="absolute bottom-5 left-[17px] top-5 w-px bg-zinc-200" />
              <ol className="space-y-4">
                {steps.map((step) => (
                  <RoadmapStep key={step.course.id} step={step} courseLinkBase={courseLinkBase} />
                ))}
              </ol>
            </div>
          </section>
        </main>

        {/* Sticky sidebar */}
        <aside className="space-y-4 self-start lg:sticky lg:top-8">
          {sortedOutcomes.length > 0 && (
            <SidebarCard label="WHAT YOU'LL BE ABLE TO DO">
              <ul className="space-y-3">
                {sortedOutcomes.map((outcome) => (
                  <ChecklistItem key={outcome.id}>{outcome.content}</ChecklistItem>
                ))}
              </ul>
            </SidebarCard>
          )}

          {sortedPrerequisites.length > 0 && (
            <SidebarCard label="PREREQUISITES">
              <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
                {sortedPrerequisites.map((item) => (
                  <li key={item.id}>{item.content}</li>
                ))}
              </ul>
            </SidebarCard>
          )}

          <SidebarCard label="TIME COMMITMENT">
            <div className="grid grid-cols-2 gap-3">
              <StatMiniBlock
                label="TOTAL HOURS"
                value={`${Math.round(totalMinutes / 60)} hours`}
              />
              <StatMiniBlock label="COURSES" value={String(steps.length)} />
              <StatMiniBlock label="PACE" value={detail.pace || "Self-paced"} />
              <StatMiniBlock
                label="CERTIFICATE"
                value={detail.includes_certificate ? "Yes" : "No"}
              />
            </div>
          </SidebarCard>
        </aside>
      </div>
    </div>
  );
}

function ComingSoon({
  breadcrumbs,
}: {
  breadcrumbs?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      {breadcrumbs}
      <div className="rounded-xl border border-zinc-200 bg-card p-6 text-sm text-muted-foreground">
        This path&apos;s curriculum is coming soon.
      </div>
    </div>
  );
}
