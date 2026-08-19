import { PageHeader } from "@/components/admin/PageHeader";
import { CoursesTable } from "@/components/admin/tables/CoursesTable";
import { courses } from "@/lib/admin-data";

export default function CoursesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Courses" count={courses.length} />

      <CoursesTable rows={courses} />
    </div>
  );
}