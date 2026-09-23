"use client";

import { useState, type ReactNode } from "react";

export type CourseTab = {
  key: string;
  label: string;
  content: ReactNode;
};

// Controlled tab state lives here; panels arrive prebuilt from the server.
export default function CourseTabs({ tabs }: { tabs: CourseTab[] }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? "");
  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  if (!active) {
    return null;
  }

  return (
    <section className="w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white font-mono shadow-xs">
      <div
        role="tablist"
        aria-label="Course sections"
        className="flex gap-8 border-b border-neutral-200 px-6 pt-4"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActiveKey(tab.key)}
              className={`relative cursor-pointer pb-4 text-xs font-bold tracking-wider transition-colors ${
                isActive ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-neutral-900" />}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="flex flex-col gap-8 p-6 sm:p-10">
        {active.content}
      </div>
    </section>
  );
}
