import CourseExplorer from "./CourseExplorer";
import type { CourseItem } from "./types";

function CourseBannerTitle() {
  return (
    <section className="w-full bg-[#f8fafc] px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-left sm:gap-4">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0f172a] sm:text-4xl lg:text-5xl">
          AI courses
        </h1>
        <p className="max-w-3xl text-base font-normal leading-relaxed text-neutral-600">
          Grow your AI career with foundational specializations and skill-specific short courses
          taught by leaders in the field.
        </p>
      </div>
    </section>
  );
}

export default function BrowsePage({
  courses,
  inProgressPercentById,
  hrefBase,
}: {
  courses: CourseItem[];
  inProgressPercentById: Record<number, number>;
  hrefBase: string;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <CourseBannerTitle />
      <CourseExplorer
        courses={courses}
        inProgressPercentById={inProgressPercentById}
        hrefBase={hrefBase}
      />
    </div>
  );
}
