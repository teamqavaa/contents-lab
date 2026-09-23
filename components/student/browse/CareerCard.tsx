"use client";

import Link from "next/link";
import { type LucideIcon, BookOpen } from "lucide-react";
import { careerPathIcons } from "@/components/student/dashboard/path-icons";
import type { CareerItem } from "./types";

interface CareerCardProps {
  career: CareerItem;
  hrefBase: string;
  onToggleFavorite?: (id: number) => void;
}

export default function CareerCard({ career, hrefBase, onToggleFavorite }: CareerCardProps) {
  const Icon: LucideIcon = careerPathIcons[career.icon] ?? BookOpen;
  const careerPath = `${hrefBase}/${career.slug}`;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-shadow hover:shadow-md">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
          <Link href={careerPath} className="relative block h-full w-full flex items-center justify-center">
            <Icon size={56} strokeWidth={1.5} className="text-white transition-transform duration-300 group-hover:scale-110" />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 backdrop-blur-md">
              Career Path
            </span>
          </div>

          {career.includesCertificate && (
            <div className="pointer-events-none absolute right-3 top-3 z-10">
              <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                Certificate
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <Link href={careerPath}>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-neutral-900 transition-colors hover:text-blue-600">
              {career.title}
            </h3>
          </Link>

          <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">
            {career.description || "A guided career path to help you break into a new role."}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 p-5 pt-0">
        <div className="flex items-center gap-3 pt-3 text-xs font-medium text-neutral-500">
          <span>{career.courseCount} courses</span>
          <span className="text-neutral-300">·</span>
          <span>{career.durationWeeks} weeks</span>
          <span className="text-neutral-300">·</span>
          <span>{career.pace}</span>
        </div>

        <Link
          href={careerPath}
          className="mt-3 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
        >
          View Path
        </Link>
      </div>
    </div>
  );
}
