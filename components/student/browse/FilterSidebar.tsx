"use client";

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

const COURSE_TYPES = [
  { label: "Short Course", count: "1-2 hrs" },
  { label: "Course", count: "3-10 hrs" },
  { label: "Professional Certificate", count: "10+ hrs" },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function FilterSidebar({ filters, setFilters, onReset }: FilterSidebarProps) {
  const toggleCheckbox = (
    key: keyof Omit<FilterState, "searchQuery">,
    value: string
  ) => {
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
    <aside className="flex w-full shrink-0 flex-col gap-6 overflow-y-auto pr-1 pt-2 lg:sticky lg:top-32 lg:w-72 lg:max-h-[calc(100vh-11rem)] lg:pt-0">
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 stroke-current stroke-[2]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={filters.searchQuery}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="flex items-center gap-1 text-sm font-bold text-neutral-900">
          Course Type <span className="cursor-pointer text-xs text-neutral-400">ⓘ</span>
        </h4>
        <div className="flex flex-col gap-2.5">
          {COURSE_TYPES.map((type) => (
            <label
              key={type.label}
              className="flex cursor-pointer items-center justify-between text-xs font-medium text-neutral-600"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.selectedTypes.includes(type.label)}
                  onChange={() => toggleCheckbox("selectedTypes", type.label)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 accent-neutral-900 focus:ring-0"
                />
                <span>{type.label}</span>
              </div>
              <span className="text-neutral-400">{type.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-neutral-900">Difficulty</h4>
        <div className="flex flex-col gap-2.5">
          {DIFFICULTIES.map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600"
            >
              <input
                type="checkbox"
                checked={filters.selectedDifficulties.includes(level)}
                onChange={() => toggleCheckbox("selectedDifficulties", level)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 accent-neutral-900 focus:ring-0"
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-left text-xs text-neutral-500 underline transition-colors hover:text-neutral-800"
      >
        Reset all filters
      </button>
    </aside>
  );
}
