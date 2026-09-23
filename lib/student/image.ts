import { COURSES_API_URL } from "@/lib/student/courses-api";

// Courses-api serves uploads under MEDIA_URL (/media/...) from its own origin.
// Absolute https URLs (downloaded thumbnails) pass through unchanged; anything
// else falls back to a local placeholder so <img> never renders an empty src.
export function resolveThumbnail(src: string | null | undefined): string {
  if (!src) return "/placeholder-course.svg";
  if (src.startsWith("/") && !src.startsWith("/media/")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/media/")) return `${COURSES_API_URL}${src}`;
  return src;
}
