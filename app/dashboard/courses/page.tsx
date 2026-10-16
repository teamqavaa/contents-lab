import type { Metadata } from 'next';

import MyCourses from '@/components/dashboard/MyCourses';

export const metadata: Metadata = {
  title: 'My courses · Ignite',
};

export default async function DashboardCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>;
}) {
  const { q, status } = await searchParams;
  const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) || '';
  return <MyCourses query={first(q)} status={first(status)} />;
}
