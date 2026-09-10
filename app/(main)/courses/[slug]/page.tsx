import { getCourseDetails } from '@/actions/courseDetail';
import CourseHeaderCard from '@/components/courses/details/CourseHeaderCard';
import CourseSidebarCard from '@/components/courses/details/CourseSidebarCard';
import CourseTabsCard from '@/components/courses/details/CourseTabsCard';

interface PageProps {
  params: Promise<{ slug: string }>; // <-- Changé de 'id' à 'slug'
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params; // <-- Récupération du slug

  // On passe le slug à la fonction de fetch
  const course = await getCourseDetails(slug);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-mono text-neutral-500">
        Course not found or server error.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne Gauche : Header + Onglets */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <CourseHeaderCard course={course} />
          <CourseTabsCard course={course} />
        </div>

        {/* Colonne Droite : Carte Vidéo & Achat */}
        <div className="lg:col-span-4">
          <CourseSidebarCard course={course} />
        </div>
      </div>
    </div>
  );
}
