import { getPopularCourses } from '@/actions/courses';
import { getMyCart } from '@/actions/cart';
import CourseCard from './CourseCard';

export default async function CourseGrid() {
  // Récupération en parallèle des cours et du panier de l'utilisateur
  const [courses, cart] = await Promise.all([
    getPopularCourses(3),
    getMyCart()
  ]);

  // Utilisation de course_details.id ou course (selon votre interface CartItem)
  const cartCourseIds = new Set(
    cart?.items?.map((item: any) => item.course_details?.id || item.course || item.id) || []
  );

  return (
    <section className="w-full bg-[#f3f3f3] py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto px-4 md:px-12 lg:px-20">
        {courses.map((course) => {
          // Vérifie si ce cours spécifique est dans le panier
          const isInCart = cartCourseIds.has(course.id);

          return (
            <CourseCard
              key={course.id}
              course={course}
              initialInCart={isInCart}
            />
          );
        })}
      </div>
    </section>
  );
}
