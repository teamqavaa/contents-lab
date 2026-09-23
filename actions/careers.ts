'use server';

export interface CareerPath {
  id: string;
  kind: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string;
  duration_weeks: number;
  pace: string;
  includes_certificate: boolean;
  order: number;
  is_active: boolean;
  // The list/summary endpoint returns course slugs (string[]), while the detail
  // endpoint returns full course objects (CareerCourse[]). The derived
  // LearningPathDetails narrows this to CareerCourse[] for the detail page;
  // the union keeps both API shapes well-typed.
  courses: string[] | CareerCourse[];
  course_count: number;
  created_at: string;
  updated_at: string;
}

export interface PathBullet {
  id: number;
  order: number;
  content: string;
}

export interface CareerCourse {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  language: string;
  level: string;
  is_active: boolean;
  thumbnail: string | null;
  instructor: string;
  duration_minutes: number;
  rating: number | null;
  review_count: number;
  price: string;
  original_price: string | null;
  course_count?: number;
}

export interface LearningPathDetails extends CareerPath {
  outcomes: PathBullet[];
  prerequisites: PathBullet[];
  courses: CareerCourse[];
}

export async function getCareerPaths(): Promise<CareerPath[]> {
  try {
    const COURSES_API_URL = process.env.COURSES_API_URL ?? 'http://localhost:8000';
    const response = await fetch(`${COURSES_API_URL}/api/learning-paths/active/?kind=career`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Erreur HTTP! Statut: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur getCareerPaths:', error);
    return [];
  }
}

export async function getLearningPathDetails(slug: string): Promise<LearningPathDetails | null> {
  try {
    const COURSES_API_URL = process.env.COURSES_API_URL ?? 'http://localhost:8000';
    const response = await fetch(`${COURSES_API_URL}/api/learning-paths/${slug}/detail/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Erreur HTTP! Statut: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur getLearningPathDetails:', error);
    return null;
  }
}

