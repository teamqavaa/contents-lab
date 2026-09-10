import { notFound, redirect } from 'next/navigation';
import { getMyEnrolledCourses } from '@/actions/cart';
import CoursePlayerClient from '@/components/courses/CoursePlayerClient';

interface LearnPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fonction pour récupérer les détails complets du cours avec modules, leçons, vidéos et ressources
async function getCourseBySlug(slug: string) {
  try {
    const res = await fetch(`http://127.0.0.1:8080/api/courses/${slug}/`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function CourseLearnPage({ params }: LearnPageProps) {
  const { slug } = await params;

  // 1. Récupérer les cours auxquels l'utilisateur est inscrit
  const enrolledCourses = await getMyEnrolledCourses().catch(() => []);
  const enrollmentsList = Array.isArray(enrolledCourses)
    ? enrolledCourses
    : (enrolledCourses?.results || []);

  // 2. Vérifier si l'utilisateur est inscrit à ce cours spécifique
  const isEnrolled = enrollmentsList.some((course: any) => {
    const courseSlug = course.slug || course.course?.slug || course.course_details?.slug;
    return courseSlug === slug;
  });

  // 3. Rediriger si non inscrit
  if (!isEnrolled) {
    redirect(`/course/${slug}`);
  }

  // 4. Charger les détails du cours
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  // 5. Rendu du lecteur interactif client
  return <CoursePlayerClient course={course} />;
}