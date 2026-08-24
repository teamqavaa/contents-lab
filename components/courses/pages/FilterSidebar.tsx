'use client';

export interface FilterState {
  searchQuery: string;
  selectedTypes: string[];
  selectedDifficulties: string[];
  selectedTopics: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
}

export default function FilterSidebar({ filters, setFilters, onReset }: FilterSidebarProps) {

  // Handler pour les checkboxes
  const toggleCheckbox = (key: keyof Omit<FilterState, 'searchQuery'>, value: string) => {
    setFilters((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((item) => item !== value) : [...current, value],
      };
    });
  };

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-6 shrink-0 lg:sticky lg:top-32 max-h-[calc(100vh-11rem)] overflow-y-auto pr-1 pt-2 lg:pt-0">

      {/* Input de recherche */}
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

      {/* Groupe 1: Course Type */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1">
          Course Type
          <span className="text-neutral-400 cursor-pointer text-xs">ⓘ</span>
        </h4>
        <div className="flex flex-col gap-2.5">
          {[
            { label: 'Short Course', count: '1-2 hrs' },
            { label: 'Course', count: '3-10 hrs' },
            { label: 'Professional Certificate', count: '10+ hrs' },
          ].map((type) => (
            <label key={type.label} className="flex items-center justify-between text-xs font-medium text-neutral-600 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.selectedTypes.includes(type.label)}
                  onChange={() => toggleCheckbox('selectedTypes', type.label)}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-0 accent-neutral-900"
                />
                <span>{type.label}</span>
              </div>
              <span className="text-neutral-400">{type.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Groupe 2: Difficulty */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-900">Difficulty</h4>
        <div className="flex flex-col gap-2.5">
          {['Beginner', 'Intermediate'].map((level) => (
            <label key={level} className="flex items-center gap-2 text-xs font-medium text-neutral-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.selectedDifficulties.includes(level)}
                onChange={() => toggleCheckbox('selectedDifficulties', level)}
                className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-0 accent-neutral-900"
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Groupe 3: Popular Topics */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-900">Popular Topics</h4>
        <div className="flex flex-col gap-2.5">
          {[
            { label: 'GenAI Applications', count: 59 },
            { label: 'Prompt Engineering', count: 46 },
            { label: 'Agents', count: 43 },
          ].map((topic) => (
            <label key={topic.label} className="flex items-center justify-between text-xs font-medium text-neutral-600 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.selectedTopics.includes(topic.label)}
                  onChange={() => toggleCheckbox('selectedTopics', topic.label)}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-0 accent-neutral-900"
                />
                <span>{topic.label}</span>
              </div>
              <span className="text-neutral-400">{topic.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bouton de réinitialisation */}
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
