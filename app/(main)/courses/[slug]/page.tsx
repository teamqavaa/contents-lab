// app/(main)/courses/[slug]/page.tsx — page détail d'un cours (données de courses-api)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, Star, Users } from "lucide-react";

import { getPublishedCourses } from "@/actions/catalog";
import { getCourseDetails, type CourseDetails } from "@/actions/courseDetail";
import CourseTabs, {
  type CourseTabsData,
} from "@/components/courses/details/CourseTabs";
import PromoVideo from "@/components/courses/details/PromoVideo";
import PurchaseCard from "@/components/courses/details/PurchaseCard";
import { courseTotals, publishedModules } from "@/lib/curriculum";
import { capitalize, formatMinutes, plural } from "@/lib/format";
import { getInitials } from "@/lib/initials";
import { toVideoSource } from "@/lib/video";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all: "All levels",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const course = await getCourseDetails((await params).slug);
  return course
    ? {
        title: `${course.title} · Ignite`,
        description: course.subtitle || course.description.slice(0, 160),
      }
    : { title: "Course not found · Ignite" };
}

/** Questions fréquentes construites uniquement à partir des données du cours. */
function buildFaq(
  course: CourseDetails,
  totals: ReturnType<typeof courseTotals>,
): CourseTabsData["faq"] {
  const previews = course.modules
    .flatMap((m) => m.lessons || [])
    .filter((l) => l.is_preview && l.is_published !== false).length;
  const level = LEVEL_LABELS[course.level] ?? capitalize(course.level);
  const faq = [
    {
      question: "How long is the course?",
      answer:
        totals.lessons > 0
          ? `${plural(totals.lessons, "lesson")} in ${plural(totals.modules, "section")}, ${formatMinutes(totals.minutes)} of content in total. You follow it at your own pace.`
          : "The curriculum is being prepared: lessons will appear here as soon as they are published.",
    },
    {
      question: "What level do I need?",
      answer: course.prerequisites
        ? `Level: ${level}. Prerequisites: ${course.prerequisites}`
        : `Level: ${level}. No specific prerequisite is listed for this course.`,
    },
    {
      question: "In which language is it taught?",
      answer: `The course is taught in ${capitalize(course.language)}.`,
    },
    {
      question: "Can I preview the course before buying it?",
      answer:
        previews > 0
          ? `Yes: watch the presentation video above and ${plural(previews, "free preview lesson")} marked “Preview” in the curriculum.`
          : "Yes: the presentation video at the top of this page gives an overview of the course.",
    },
    {
      question: "How do I start after my purchase?",
      answer:
        "Once your order is confirmed, the course appears in your dashboard under “My courses” and you can start right away. Your progress is saved lesson by lesson.",
    },
  ];
  if (course.resources.length > 0) {
    faq.splice(3, 0, {
      question: "Are there resources to download?",
      answer: `Yes: ${course.resources.map((r) => r.title).join(", ")}.`,
    });
  }
  return faq;
}

export default async function CourseDetailPage({ params }: Params) {
  const { slug } = await params;
  const [course, catalog] = await Promise.all([
    getCourseDetails(slug),
    getPublishedCourses(),
  ]);
  if (!course) notFound();

  const modules = publishedModules(course);
  const totals = courseTotals(course);
  const byInstructor = catalog.filter((c) => c.user_id === course.user_id);
  const updated = new Date(course.updated_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const category = course.category_details?.name;
  const level = LEVEL_LABELS[course.level] ?? capitalize(course.level);

  const tabs: CourseTabsData = {
    learn: [
      ...course.learning_points.map((p) => p.title),
      ...course.outcomes.map((o) => o.description),
    ],
    highlights: course.highlights.map((h) => h.title),
    description: course.description,
    prerequisites: course.prerequisites,
    audience: course.target_audience,
    modules,
    totals,
    instructor: {
      name: course.instructor_name,
      courses: byInstructor.map((c) => ({
        slug: c.slug,
        title: c.title,
        category: c.category_details?.name ?? "",
      })),
      learners: byInstructor.reduce(
        (sum, c) => sum + (c.total_students || 0),
        0,
      ),
    },
    reviews: {
      rating: course.average_rating,
      count: course.total_reviews,
      students: course.total_students,
    },
    faq: buildFaq(course, totals),
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] pb-20">
      {/* Bandeau : fil d'Ariane, badges, titre et informations clés */}
      <section className="bg-[#0f172a] px-4 pb-10 pt-28 text-white md:px-8 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="text-sm text-neutral-300">
            <Link
              href="/courses"
              className="underline underline-offset-2 hover:text-white"
            >
              Catalog
            </Link>
            {category && (
              <>
                {" / "}
                <Link
                  href={`/career-tracks?q=${encodeURIComponent(category)}`}
                  className="underline underline-offset-2 hover:text-white"
                >
                  {category}
                </Link>
              </>
            )}
            {" / "}
            <span className="text-neutral-400">{course.title}</span>
          </nav>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded bg-white/10 px-2.5 py-1 text-xs font-semibold">
              {level}
            </span>
            {totals.modules > 0 && (
              <Link
                href={`/career-tracks/${course.slug}`}
                className="rounded bg-white/10 px-2.5 py-1 text-xs font-semibold hover:bg-white/20"
              >
                Career track · {plural(totals.modules, "module")}
              </Link>
            )}
            {course.status !== "published" && (
              <span className="rounded bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-200">
                {course.status === "review" ? "Pending review" : "Draft"} · only
                visible to you
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="mt-3 max-w-2xl text-base text-neutral-300">
              {course.subtitle}
            </p>
          )}

          <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-200">
            {course.total_reviews > 0 && (
              <li className="flex items-center gap-1.5">
                <Star
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
                <span className="font-semibold text-white">
                  {course.average_rating.toFixed(1)}
                </span>
                <span>
                  ({course.total_reviews.toLocaleString("en-US")} reviews)
                </span>
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden="true" />{" "}
              {course.total_students.toLocaleString("en-US")} learners
            </li>
            {course.instructor_name && (
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold">
                  {getInitials(course.instructor_name)}
                </span>
                By{" "}
                <span className="font-semibold text-white">
                  {course.instructor_name}
                </span>
              </li>
            )}
            <li>Updated {updated}</li>
            <li className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" aria-hidden="true" />{" "}
              {capitalize(course.language)}
            </li>
          </ul>
        </div>
      </section>

      {/* Mobile : vidéo, achat, onglets. Desktop : achat dans une colonne de droite collante */}
      <div className="px-4 md:px-8">
        <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <PromoVideo
              source={toVideoSource(course.promo_video_url, { autoplay: true })}
              poster={course.thumbnail}
              title={course.title}
            />
          </div>
          <div className="self-start lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <PurchaseCard course={course} />
          </div>
          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <CourseTabs data={tabs} />
          </div>
        </div>
      </div>
    </main>
  );
}
