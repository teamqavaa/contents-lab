import { getActivePathsAction } from "@/actions/student/learning-paths";
import { getMyPathProgressAction } from "@/actions/student/course-progress";
import CareerExplorer from "@/components/student/browse/CareerExplorer";
import { mapPathToCareerItem } from "@/components/student/browse/types";

export default async function CareerTracksPage() {
  const { paths, error } = await getActivePathsAction("career");

  const inProgressSlugs = new Set<string>();
  if (paths.length > 0) {
    const progressResults = await Promise.all(
      paths.map((p) => getMyPathProgressAction(p.slug))
    );
    paths.forEach((p, i) => {
      const hasStarted = progressResults[i].progress.some(
        (e) => e.status === "in_progress" || e.status === "completed"
      );
      if (hasStarted) inProgressSlugs.add(p.slug);
    });
  }

  const careers = paths.map(mapPathToCareerItem);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-30">
      <section className="w-full bg-[#f8fafc] px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-left sm:gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0f172a] sm:text-4xl lg:text-5xl">
            Career paths
          </h1>
          <p className="max-w-3xl text-base font-normal leading-relaxed text-neutral-600">
            Follow a structured sequence of courses that takes you from beginner
            to job-ready in one focus area.
          </p>
        </div>
      </section>

      {error ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            Failed to load career paths.
          </div>
        </div>
      ) : (
        <CareerExplorer
          careers={careers}
          inProgressSlugs={inProgressSlugs}
          hrefBase="/career-tracks"
        />
      )}
    </div>
  );
}
