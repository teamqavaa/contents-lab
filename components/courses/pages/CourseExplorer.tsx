'use client';

import { useState, useMemo, useEffect } from 'react';
import CourseCard, { CourseItem } from './CourseCard';
import FilterSidebar, { FilterState } from './FilterSidebar';
import { getPopularCourses } from '@/actions/courses';

export default function CourseExplorer({ initialQuery = "" }: { initialQuery?: string }) {
  const [activeTab, setActiveTab] = useState<'Discover' | 'All courses' | 'Favorites' | 'In progress'>('Discover');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: initialQuery,
    selectedTypes: [],
    selectedDifficulties: [],
    selectedTopics: [],
  });

  /*
    CHARGEMENT DES DONNÉES DEPUIS LE SERVER ACTION :
    Appel de getPopularCourses() et transformation au format CourseItem
  */
  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true);
        const data = await getPopularCourses();

        // Adaptation du format Server Action -> CourseItem
        const formattedCourses: CourseItem[] = data.map((item: any) => ({
          id: item.id,
          slug: item.slug || item.id, // <-- AJOUT DU SLUG ICI
          title: item.title,
          description: item.subtitle || item.description || '',
          badge: item.category_details?.name || 'Course',
          courseType: item.category_details?.name || 'Course',
          difficulty: item.level ? item.level.charAt(0).toUpperCase() + item.level.slice(1) : 'Beginner',
          topic: item.category_details?.name || 'General',
          orgName: 'E-Learning Platform',
          orgLogo: '/career.jpg',
          image: item.image || item.thumbnail || '/images/default-course.jpg',
          price: item.price ?? 0,
          originalPrice: item.originalPrice,
          isFavorite: false,
          isInProgress: false,
        }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // Toggle Favoris
  const handleToggleFavorite = (id: string) => {
    setCourses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  // Logique de filtrage dynamique
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // 1. Onglets
      if (activeTab === 'Favorites' && !course.isFavorite) return false;
      if (activeTab === 'In progress' && !course.isInProgress) return false;

      // 2. Recherche Textuelle
      if (
        filters.searchQuery.trim() !== '' &&
        !course.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !course.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // 3. Types de Cours
      if (filters.selectedTypes.length > 0 && !filters.selectedTypes.includes(course.courseType)) {
        return false;
      }

      // 4. Difficulté
      if (filters.selectedDifficulties.length > 0 && !filters.selectedDifficulties.includes(course.difficulty)) {
        return false;
      }

      // 5. Sujets / Topics
      if (filters.selectedTopics.length > 0 && !filters.selectedTopics.includes(course.topic)) {
        return false;
      }

      return true;
    });
  }, [courses, activeTab, filters]);

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedTypes: [],
      selectedDifficulties: [],
      selectedTopics: [],
    });
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen pt-14 pb-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* Navigation par Onglets Supérieurs */}
        <div className="static lg:sticky lg:top-20 z-30 bg-[#f8fafc] pt-2 flex items-center gap-8 border-b border-neutral-200 text-sm font-semibold text-neutral-500 overflow-x-auto no-scrollbar">
          {(['Discover', 'All courses', 'Favorites', 'In progress'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 relative transition-colors cursor-pointer shrink-0 ${
                activeTab === tab ? 'text-[#1677ff] font-bold' : 'hover:text-neutral-800'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1677ff] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Disposition Principale : Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Barre de Filtre */}
          <FilterSidebar filters={filters} setFilters={setFilters} onReset={resetFilters} />

          {/* Zone des Cartes */}
          <main className="flex-1 w-full flex flex-col gap-4">
            <h2 className="text-xl font-bold text-neutral-900">Top Rated</h2>

            {/* GESTION DU CHARGEMENT / AFFICHAGE */}
            {isLoading ? (
              <div className="p-8 text-center text-neutral-500 text-sm">
                Loading...
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} onToggleFavorite={handleToggleFavorite} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-sm">
                No courses match your filter criteria.
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
}
