import { getCareerPaths } from '@/actions/careers';
import CareersBannerTitle from '@/components/careers/CareersBannerTitle';
import CareerCard from '@/components/careers/CareerCard';

export default async function CareersPage() {
  const paths = await getCareerPaths();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <CareersBannerTitle />

      <div className="px-4 sm:px-6 lg:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          {paths.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
              No career paths available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paths.map((path) => (
                <CareerCard
                  key={path.slug}
                  slug={path.slug}
                  title={path.title}
                  description={path.description}
                  icon={path.icon}
                  duration_weeks={path.duration_weeks}
                  pace={path.pace}
                  includes_certificate={path.includes_certificate}
                  course_count={path.course_count}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
