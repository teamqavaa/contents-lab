'use server';

// Interface représentant la réponse exacte de votre API Django / REST
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

export interface ApiCourse {
  id: string;
  category_details: ApiCategory;
  tags: string[];
  tags_details: ApiTag[];
  instructor_id: string;
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

// Interface utilisée côté Frontend
export interface Course {
  id: string;
  title: string;
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
}

export interface CourseWithEnrollment extends Course {
  isEnrolled: boolean;
}

/**
 * @param limit Nombre de cours max à retourner (ex: 3 pour la page d'accueil).
 * Si non fourni, retourne tous les cours.
 */
export async function getPopularCourses(limit?: number): Promise<CourseWithEnrollment[]> {
  try {
    // 1. Appel API à votre backend
    const response = await fetch('http://127.0.0.1:8080/api/courses/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des cours: ${response.statusText}`);
    }

    const apiCourses: ApiCourse[] = await response.json();

    // 2. Mock des IDs de cours auxquels le user est déjà inscrit
    const enrolledCourseIds = new Set(['3ba19122-bdda-4265-9e43-35be1261125e']);

    // 3. Tri par popularité
    const sortedCourses = apiCourses.sort((a, b) => b.total_students - a.total_students);

    // 4. Application de la limite si elle est spécifiée
    const coursesToReturn = limit ? sortedCourses.slice(0, limit) : sortedCourses;

    // 5. Transformation des données de l'API vers le format React
    return coursesToReturn.map((course) => {
      const currentPrice = parseFloat(course.discount_price) > 0
        ? parseFloat(course.discount_price)
        : parseFloat(course.price);

      const originalPrice = parseFloat(course.discount_price) > 0
        ? parseFloat(course.price)
        : undefined;

      return {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        image: course.thumbnail,
        duration: '20 hours 30 min',
        lessonsCount: course.total_reviews || 0,
        rating: course.average_rating,
        price: currentPrice,
        originalPrice: originalPrice,
        level: course.level,
        slug: course.slug,
        category_details: course.category_details,
        isEnrolled: enrolledCourseIds.has(course.id),
      };
    });
  } catch (error) {
    console.error('Erreur getPopularCourses:', error);
    return [];
  }
}


