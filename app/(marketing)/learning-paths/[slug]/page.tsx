import { getLearningPathDetails } from '@/actions/careers';
import LearningPathHeaderCard from '@/components/careers/details/LearningPathHeaderCard';
import LearningPathTabsCard from '@/components/careers/details/LearningPathTabsCard';
import LearningPathSidebarCard from '@/components/careers/details/LearningPathSidebarCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LearningPathDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const path = await getLearningPathDetails(slug);

  if (!path) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-mono text-neutral-500">
        Career path not found or server error.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <LearningPathHeaderCard path={path} />
          <LearningPathTabsCard path={path} />
        </div>

        <div className="lg:col-span-4">
          <LearningPathSidebarCard path={path} />
        </div>
      </div>
    </div>
  );
}
