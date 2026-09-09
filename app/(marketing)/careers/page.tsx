import { getCareerPaths } from '@/actions/careers';
import CareersBannerTitle from '@/components/careers/CareersBannerTitle';
import CareerExplorer from '@/components/careers/CareerExplorer';

export default async function CareersPage() {
  const paths = await getCareerPaths();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <CareersBannerTitle />
      <CareerExplorer careers={paths} />
    </div>
  );
}
