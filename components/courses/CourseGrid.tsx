// components/courses/CourseGrid.tsx
import { getPopularCourses } from '@/actions/courses';
import CourseCard from './CourseCard';

export default async function CourseGrid() {
  // Récupération des cours côté serveur via la Server Action
  const courses = await getPopularCourses(3);

  return (
    /* 1. Conteneur externe : Prend 100% de la largeur avec le fond gris */
    <section className="w-full bg-[#f3f3f3] py-8">

      {/* 2. Conteneur interne : Limite la largeur et centre la grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto px-4 md:px-12 lg:px-20">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

    </section>
  );
}