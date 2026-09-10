'use server';

import { getMyEnrolledCourses } from "./cart";

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiTag {
  id: string;
  name: string;
  slug: string;
}

export interface ApiLesson {
  id: string;
  title: string;
  duration_in_minutes: number;
}

export interface ApiModule {
  id: string;
  title: string;
  lessons_count: number;
  lessons: ApiLesson[];
}

export interface ApiCourse {
  id: string;
  category_details: ApiCategory;
  tags_details: ApiTag[];
  modules: ApiModule[]; // 👈 Ajout des modules renvoyés par l'API
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  language: string;
  level: string;
  status: string;
  price: string;
  discount_price: string;
  thumbnail: string;
  promo_video_url: string;
  average_rating: number;
  total_students: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  duration: string;
  lessonsCount: number;
  rating: number;
  price: number;
  originalPrice?: number;
  level: string;
  slug: string;
  category_details?: ApiCategory;
  modules?: ApiModule[]; // 👈 Ajouté pour CourseCard
}

export interface CourseWithEnrollment extends Course {
  isEnrolled: boolean;
}

export async function getPopularCourses(limit?: number): Promise<CourseWithEnrollment[]> {
  try {
    const [response, enrolledCourses] = await Promise.all([
      fetch('http://127.0.0.1:8080/api/courses/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
      getMyEnrolledCourses().catch(() => [])
    ]);

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des cours: ${response.statusText}`);
    }

    const apiCourses: ApiCourse[] = await response.json();

    const enrollmentsList = Array.isArray(enrolledCourses) ? enrolledCourses : (enrolledCourses?.results || []);
    const enrolledCourseIds = new Set(
      enrollmentsList.map((course: any) => course.id || course.course_id || course.course?.id)
    );

    const sortedCourses = apiCourses.sort((a, b) => b.total_students - a.total_students);
    const coursesToReturn = limit ? sortedCourses.slice(0, limit) : sortedCourses;

    return coursesToReturn.map((course) => {
      const currentPrice = parseFloat(course.discount_price) > 0
        ? parseFloat(course.discount_price)
        : parseFloat(course.price);

      const originalPrice = parseFloat(course.discount_price) > 0
        ? parseFloat(course.price)
        : undefined;

      // Calcul dynamique de la durée totale en minutes et du nombre de leçons
      let totalMinutes = 0;
      let calculatedLessonsCount = 0;

      if (course.modules && Array.isArray(course.modules)) {
        course.modules.forEach((mod) => {
          calculatedLessonsCount += mod.lessons_count || mod.lessons?.length || 0;
          if (mod.lessons && Array.isArray(mod.lessons)) {
            mod.lessons.forEach((lesson) => {
              totalMinutes += lesson.duration_in_minutes || 0;
            });
          }
        });
      }

      // Formatage propre de la durée (ex: "45m" ou "1h 15m")
      const formatDuration = (mins: number) => {
        if (mins === 0) return "N/A";
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;
      };

      return {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        image: course.thumbnail,
        duration: formatDuration(totalMinutes),
        lessonsCount: calculatedLessonsCount,
        rating: course.average_rating,
        price: currentPrice,
        originalPrice: originalPrice,
        level: course.level,
        slug: course.slug,
        category_details: course.category_details,
        modules: course.modules, // 👈 Transmis au frontend
        isEnrolled: enrolledCourseIds.has(course.id),
      };
    });
  } catch (error) {
    console.error('Erreur getPopularCourses:', error);
    return [];
  }
}
