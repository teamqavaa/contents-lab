'use client';

export interface CareerFilterState {
  searchQuery: string;
  selectedPaces: string[];
}

interface CareerFilterSidebarProps {
  filters: CareerFilterState;
  setFilters: React.Dispatch<React.SetStateAction<CareerFilterState>>;
  uniquePaces: string[];
  onReset: () => void;
}

export default function CareerFilterSidebar({
  filters,
  setFilters,
  uniquePaces,
  onReset,
}: CareerFilterSidebarProps) {
  return (
    <aside className="w-full lg:w-72 flex flex-col gap-6 shrink-0 lg:sticky lg:top-32 max-h-[calc(100vh-11rem)] overflow-y-auto pr-1 pt-2 lg:pt-0">
      <div className="relative">
        <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={filters.searchQuery}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-sm text-neutral-800 focus:outline-none focus:border-neutral-400"
        />
      </div>

      {uniquePaces.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-neutral-900">Pace</h4>
          <div className="flex flex-col gap-2.5">
            {uniquePaces.map((pace) => (
              <label key={pace} className="flex items-center gap-2 text-xs font-medium text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.selectedPaces.includes(pace)}
                  onChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      selectedPaces: prev.selectedPaces.includes(pace)
                        ? prev.selectedPaces.filter((p) => p !== pace)
                        : [...prev.selectedPaces, pace],
                    }))
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-0 accent-neutral-900"
                />
                <span>{pace}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="text-xs text-neutral-500 underline text-left hover:text-neutral-800 transition-colors"
      >
        Reset all filters
      </button>
    </aside>
  );
}
