"use client";

import { useMemo, useState } from "react";

import CourseCard from "./CourseCard";
import FilterSidebar, { type FilterState } from "./FilterSidebar";
import type { CourseItem } from "./types";

type TabKey = "Discover" | "All courses" | "Favorites" | "In progress";

interface CourseExplorerProps {
  courses: CourseItem[];
  inProgressPercentById?: Record<number, number>;
  hrefBase: string;
}

export default function CourseExplorer({
  courses,
  inProgressPercentById = {},
  hrefBase,
}: CourseExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Discover");
  const [items, setItems] = useState<CourseItem[]>(() =>
    courses.map((c) => ({
      ...c,
      isInProgress: (inProgressPercentById[c.id] ?? 0) > 0,
    }))
  );
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedTypes: [],
    selectedDifficulties: [],
    selectedTopics: [],
  });

  const handleToggleFavorite = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const filteredCourses = useMemo(() => {
    return items.filter((course) => {
      if (activeTab === "Favorites" && !course.isFavorite) return false;
      if (activeTab === "In progress" && !course.isInProgress) return false;

      if (
        filters.searchQuery.trim() !== "" &&
        !course.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !course.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.selectedTypes.length > 0 &&
        !filters.selectedTypes.includes(course.courseType)
      ) {
        return false;
      }

      if (
        filters.selectedDifficulties.length > 0 &&
        !filters.selectedDifficulties.includes(course.difficulty)
      ) {
        return false;
      }

      if (
        filters.selectedTopics.length > 0 &&
        !filters.selectedTopics.includes(course.topic)
      ) {
        return false;
      }

      return true;
    });
  }, [items, activeTab, filters]);

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      selectedTypes: [],
      selectedDifficulties: [],
      selectedTopics: [],
    });
  };

  return (
    <div className="w-full bg-[#f8fafc] px-4 pb-8 pt-4 sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="static flex items-center gap-8 overflow-x-auto border-b border-neutral-200 bg-[#f8fafc] pb-2 pt-2 text-sm font-semibold text-neutral-500 no-scrollbar lg:sticky lg:top-20 lg:z-30">
          {(["Discover", "All courses", "Favorites", "In progress"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative shrink-0 cursor-pointer pb-3 transition-colors ${
                activeTab === tab ? "font-bold text-[#1677ff]" : "hover:text-neutral-800"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#1677ff]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <FilterSidebar filters={filters} setFilters={setFilters} onReset={resetFilters} />

          <main className="flex w-full flex-1 flex-col gap-4">
            <h2 className="text-xl font-bold text-neutral-900">Top Rated</h2>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    hrefBase={hrefBase}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
                No courses match your filter criteria.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export type { TabKey };
