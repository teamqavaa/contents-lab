'use client';

import { useState, useMemo } from 'react';
import CareerCard from './CareerCard';
import CareerFilterSidebar, { type CareerFilterState } from './CareerFilterSidebar';
import type { CareerPath } from '@/actions/careers';

interface CareerExplorerProps {
  careers: CareerPath[];
}

type CareerWithFavorite = CareerPath & { _isFavorite?: boolean };

export default function CareerExplorer({ careers }: CareerExplorerProps) {
  const [activeTab, setActiveTab] = useState<'Discover' | 'All paths' | 'Favorites' | 'In progress'>('Discover');
  const [items, setItems] = useState<CareerPath[]>(careers);
  const [filters, setFilters] = useState<CareerFilterState>({
    searchQuery: '',
    selectedPaces: [],
  });

  const uniquePaces = useMemo(
    () => Array.from(new Set(careers.map((c) => c.pace).filter(Boolean))),
    [careers]
  );

  const handleToggleFavorite = (slug: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.slug === slug ? { ...item, _isFavorite: !(item as CareerWithFavorite)._isFavorite } : item
      )
    );
  };

  const filteredCareers = useMemo(() => {
    return items.filter((career) => {
      if (activeTab === 'Favorites' && !(career as CareerWithFavorite)._isFavorite) return false;

      if (
        filters.searchQuery.trim() !== '' &&
        !career.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !(career.description || '').toLowerCase().includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (filters.selectedPaces.length > 0 && !filters.selectedPaces.includes(career.pace)) {
        return false;
      }

      return true;
    });
  }, [items, activeTab, filters]);

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedPaces: [],
    });
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen pt-14 pb-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        <div className="static lg:sticky lg:top-20 z-30 bg-[#f8fafc] pt-2 flex items-center gap-8 border-b border-neutral-200 text-sm font-semibold text-neutral-500 overflow-x-auto no-scrollbar">
          {(['Discover', 'All paths', 'Favorites', 'In progress'] as const).map((tab) => (
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

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <CareerFilterSidebar
            filters={filters}
            setFilters={setFilters}
            uniquePaces={uniquePaces}
            onReset={resetFilters}
          />

          <main className="flex-1 w-full flex flex-col gap-4">
            <h2 className="text-xl font-bold text-neutral-900">All paths</h2>

            {filteredCareers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCareers.map((career) => (
                  <CareerCard
                    key={career.slug}
                    career={career}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-sm">
                No career paths match your filter criteria.
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
}
