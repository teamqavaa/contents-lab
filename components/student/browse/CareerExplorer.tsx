"use client";

import { useMemo, useState } from "react";

import CareerCard from "./CareerCard";
import type { CareerItem } from "./types";

type TabKey = "Discover" | "All paths" | "Favorites" | "In progress";

interface CareerExplorerProps {
  careers: CareerItem[];
  inProgressSlugs?: Set<string>;
  hrefBase: string;
}

export default function CareerExplorer({
  careers,
  inProgressSlugs = new Set(),
  hrefBase,
}: CareerExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Discover");
  const [items, setItems] = useState<CareerItem[]>(() =>
    careers.map((c) => ({
      ...c,
      isInProgress: inProgressSlugs.has(c.slug),
    }))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaces, setSelectedPaces] = useState<string[]>([]);

  const uniquePaces = useMemo(
    () => Array.from(new Set(careers.map((c) => c.pace).filter(Boolean))),
    [careers]
  );

  const handleToggleFavorite = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const filteredCareers = useMemo(() => {
    return items.filter((career) => {
      if (activeTab === "Favorites" && !career.isFavorite) return false;
      if (activeTab === "In progress" && !career.isInProgress) return false;

      if (
        searchQuery.trim() !== "" &&
        !career.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !career.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (selectedPaces.length > 0 && !selectedPaces.includes(career.pace)) {
        return false;
      }

      return true;
    });
  }, [items, activeTab, searchQuery, selectedPaces]);

  return (
    <div className="w-full bg-[#f8fafc] px-4 pb-8 pt-4 sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="static flex items-center gap-8 overflow-x-auto border-b border-neutral-200 bg-[#f8fafc] pb-2 pt-2 text-sm font-semibold text-neutral-500 no-scrollbar lg:sticky lg:top-20 lg:z-30">
          {(["Discover", "All paths", "Favorites", "In progress"] as const).map((tab) => (
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
              />
            </div>

            {uniquePaces.length > 0 && (
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-neutral-900">Pace</h4>
                <div className="flex flex-col gap-2.5">
                  {uniquePaces.map((pace) => (
                    <label
                      key={pace}
                      className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPaces.includes(pace)}
                        onChange={() =>
                          setSelectedPaces((prev) =>
                            prev.includes(pace)
                              ? prev.filter((p) => p !== pace)
                              : [...prev, pace]
                          )
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-neutral-900 accent-neutral-900 focus:ring-0"
                      />
                      <span>{pace}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedPaces([]);
              }}
              className="text-left text-xs text-neutral-500 underline transition-colors hover:text-neutral-800"
            >
              Reset all filters
            </button>
          </aside>

          <main className="flex w-full flex-1 flex-col gap-4">
            <h2 className="text-xl font-bold text-neutral-900">All paths</h2>

            {filteredCareers.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredCareers.map((career) => (
                  <CareerCard
                    key={career.id}
                    career={career}
                    hrefBase={hrefBase}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
                No career paths match your filter criteria.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
