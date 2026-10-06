import { notFound, redirect } from 'next/navigation';
import { getMyEnrolledCourses } from '@/actions/cart';
import CoursePlayerClient from '@/components/courses/CoursePlayerClient';
import { checkUserEnrollment } from '@/lib/enrollmentCheck';
import { getCourseBySlug } from '@/lib/courseService';


interface LearnPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseLearnPage({ params }: LearnPageProps) {
  const { slug } = await params;

  // 1. Récupérer les cours auxquels l'utilisateur est inscrit
  const enrolledCourses = await getMyEnrolledCourses().catch(() => []);

  // 2. Vérifier si l'utilisateur est inscrit à ce cours
  const isEnrolled = checkUserEnrollment(enrolledCourses, slug);

  // 3. Rediriger si non inscrit
  if (!isEnrolled) {
    redirect(`/course/${slug}`);
  }

  // 4. Charger les détails complets du cours depuis l'API Cloud Run
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  // 5. Rendu du lecteur interactif client
  return <CoursePlayerClient course={course} />;
}
