import CourseBanner from "@/components/courses/CourseBanner";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <>
      <CourseBanner initialQuery={q ?? ""} />
    </>
  );
}
