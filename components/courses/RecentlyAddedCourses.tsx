'use client';

import { useState, useEffect } from 'react';
import { getRecentCourses } from '@/actions/courses';
import CourseCard, { CourseItem } from './pages/CourseCard';

// Les 3 derniers cours publiés, affichés avec les mêmes cartes que la grille « Top Rated »
export default function RecentlyAddedCourses() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getRecentCourses(3);

        const formattedCourses: CourseItem[] = data.map((item) => ({
          id: item.id,
          slug: item.slug || item.id,
          title: item.title,
          description: item.subtitle || item.description || '',
          badge: item.category_details?.name || 'Course',
          courseType: 'Course',
          difficulty: (item.level
            ? item.level.charAt(0).toUpperCase() + item.level.slice(1)
            : 'Beginner') as CourseItem['difficulty'],
          topic: item.category_details?.name || 'General',
          orgName: 'E-Learning Platform',
          orgLogo: '/career.jpg',
          image: item.image || '/career.jpg',
          price: item.price ?? 0,
          originalPrice: item.originalPrice,
          isFavorite: false,
          isInProgress: false,
        }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error('Error loading recent courses:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleToggleFavorite = (id: string) => {
    setCourses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  if (!isLoading && courses.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
          Recently added
        </h2>

        {isLoading ? (
          <div className="p-8 text-center text-neutral-500 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
