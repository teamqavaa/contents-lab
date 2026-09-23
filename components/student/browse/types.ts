import type { Course } from "@/types/student/course";
import type { LearningPath } from "@/types/student/career-path";

export type CourseItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  badge: string;
  courseType: "Short Course" | "Course" | "Professional Certificate" | string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | string;
  topic: string;
  orgName: string;
  orgLogo: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  isFavorite?: boolean;
  isInProgress?: boolean;
  inProgressPercent?: number;
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function mapCourseToItem(course: Course): CourseItem {
  const typeName = course.type === 0 ? "Short Course" : "Course";
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.subtitle || course.description || "",
    badge: typeName,
    courseType: typeName,
    difficulty: LEVEL_LABELS[course.level] ?? "Beginner",
    topic: "General",
    orgName: "QI",
    orgLogo: "/placeholder-course.svg",
    image: course.thumbnail ?? "",
    price: Number(course.price) || 0,
    originalPrice: course.original_price != null ? Number(course.original_price) : null,
    isFavorite: false,
    isInProgress: false,
  };
}

export type CareerItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  courseCount: number;
  durationWeeks: number;
  pace: string;
  includesCertificate: boolean;
  isFavorite?: boolean;
  isInProgress?: boolean;
};

export function mapPathToCareerItem(path: LearningPath): CareerItem {
  return {
    id: path.id,
    slug: path.slug,
    title: path.title,
    description: path.description || "",
    icon: path.icon,
    courseCount: path.course_count,
    durationWeeks: path.duration_weeks,
    pace: path.pace,
    includesCertificate: path.includes_certificate,
    isFavorite: false,
    isInProgress: false,
  };
}
