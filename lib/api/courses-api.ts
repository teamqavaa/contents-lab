// Staff-facing client for the courses-api backend. Every call carries
// the SSO access token from the httpOnly cookie; the backend rejects non-staff.
const COURSES_API_URL =
  process.env.COURSES_API_URL ?? "http://localhost:8000";

export { COURSES_API_URL };

type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
  detail?: unknown;
};

async function adminFetch<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${COURSES_API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      let detail: unknown = null;
      try {
        detail = await res.json();
      } catch {
        // Non-JSON error body
      }
      return { ok: false, data: null, error: `Request failed (${res.status})`, status: res.status, detail };
    }
    if (res.status === 204) {
      return { ok: true, data: null, error: null, status: 204 };
    }
    const body = (await res.json()) as T;
    return { ok: true, data: body, error: null, status: res.status };
  } catch (e) {
    return {
      ok: false,
      data: null,
      error: e instanceof Error ? e.message : "Network error",
      status: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Legacy types (kept for backward compatibility with other admin pages)
//
// These now describe the real Django model-aligned payloads (`id` is a string:
// a UUID for most resources, the course slug for courses / learning paths).
// The legacy tier points at the same /api/{model}/ routers as the Django-
// aligned tier but with simplified, dashboard-shaped field names.
// ---------------------------------------------------------------------------

export type CourseType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_virtual: boolean;
  is_active: boolean;
};

// Matches the courses API list shape. The list endpoint returns the real PK
// (`id`) plus the `slug`; course detail CRUD and every learning-path link are
// keyed on the slug (the CourseViewSet lookup_field), so pickers below submit
// `course.slug`, not the UUID.
export type Course = {
  id: string;
  type: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  language: string;
  level: "beginner" | "intermediate" | "advanced" | "all";
  slug: string;
  is_active: boolean;
  thumbnail: string | null;
  instructor: string;
  duration_minutes: number;
  rating: number | null;
  review_count: number;
  price: string;
  original_price: string | null;
  cohort_label: string;
  audience: string;
  downloadable_files_count: number;
  created_at: string;
  updated_at: string;
};

export type BulkCourseRow = {
  type?: string;
  title: string;
  subtitle?: string;
  description?: string;
  language?: string;
  level?: string;
  slug?: string;
  is_active?: boolean;
  thumbnail?: string;
  instructor?: string;
  duration_minutes?: number;
  rating?: number | null;
  review_count?: number;
  price?: number;
  original_price?: number | null;
  cohort_label?: string;
  audience?: string;
  downloadable_files_count?: number;
};

export type BulkCourseError = {
  row: number;
  field: string;
  message: string;
};

export type BulkCoursesResult = {
  created: number;
  updated: number;
  errors: BulkCourseError[];
};

export async function apiBulkCourses(
  token: string,
  payload: { mode: "create" | "upsert"; rows: Record<string, unknown>[] }
): Promise<ApiResult<BulkCoursesResult>> {
  return adminFetch<BulkCoursesResult>(token, "/api/courses/bulk/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LearningPath = {
  id: string;
  kind: "skill" | "career";
  title: string;
  slug: string;
  description: string | null;
  icon: string;
  duration_weeks: number;
  pace: string;
  includes_certificate: boolean;
  order: number;
  is_active: boolean;
  courses: string[];
};

export type Quiz = {
  id: string;
  type_quiz: string | null;
  title: string;
  description: string | null;
  slug: string;
  is_active: boolean;
  content_type: number | null;
  object_id: number | null;
  created_at: string;
  updated_at: string;
};

export type Module = {
  id: string;
  course: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  is_published: boolean;
  is_free: boolean;
  lessons_count: number;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  module: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  is_preview: boolean;
  is_published: boolean;
  duration_in_minutes: number;
  created_at: string;
  updated_at: string;
};

export type LessonVideo = {
  id: string;
  lesson: string;
  title: string;
  provider: string;
  video_url: string;
  external_id: string | null;
  thumbnail_url: string | null;
  duration_in_seconds: number;
  created_at: string;
  updated_at: string;
};

export type ContentTypeRow = {
  id: number;
  app_label: string;
  model: string;
};

export type QuizType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
};

export type QuizQuestion = {
  id: string;
  quiz: string;
  type_question: string | null;
  text: string;
  order: number;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizOption = {
  id: string;
  question: string;
  text: string;
  is_correct: boolean;
  order: number;
};

function crud<T>(basePath: string) {
  return {
    list: (token: string) => adminFetch<T[]>(token, basePath),
    create: (token: string, payload: Partial<T>) =>
      adminFetch<T>(token, basePath, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (token: string, id: string, payload: Partial<T>) =>
      adminFetch<T>(token, `${basePath}${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    remove: (token: string, id: string) =>
      adminFetch<void>(token, `${basePath}${id}/`, { method: "DELETE" }),
  };
}

// The legacy tier is now backed by the real Django routers (verified against
// courses-api :8000). Detail lookups are keyed on the route's lookup_field:
// - courses and learning paths: the slug (their `id` in payloads)
// - everything else: the UUID from the payload `id`
export const courseTypesApi = crud<CourseType>("/api/course-types/");
// Course detail routes are slug-keyed (lookup_field = 'slug'), unlike the other
// dashboards which use payload `id`, so courses get slug-aware update/remove.
export const coursesApi = {
  list: (token: string) => adminFetch<Course[]>(token, "/api/courses/"),
  create: (token: string, payload: Partial<Course>) =>
    adminFetch<Course>(token, "/api/courses/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (token: string, id: string, payload: Partial<Course>) =>
    adminFetch<Course>(token, `/api/courses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (token: string, id: string) =>
    adminFetch<void>(token, `/api/courses/${id}/`, { method: "DELETE" }),
};
export const modulesApi = crud<Module>("/api/modules/");
export const lessonsApi = crud<Lesson>("/api/lessons/");
export const videosApi = crud<LessonVideo>("/api/videos/");
export const contentTypesApi = crud<ContentTypeRow>("/api/content-types/");
export const learningPathsApi = crud<LearningPath>("/api/learning-paths/");
export const quizzesApi = crud<Quiz>("/api/quizzes/");
export const quizTypesApi = crud<QuizType>("/api/quiz-types/");
export const questionsApi = crud<QuizQuestion>("/api/quiz-questions/");
export const optionsApi = crud<QuizOption>("/api/quiz-options/");

// ---------------------------------------------------------------------------
// Django model-aligned types (source of truth: courses-api models.py)
// ---------------------------------------------------------------------------

export type DjangoTypeCourse = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_virtual: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DjangoCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  subcategories: DjangoCategory[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DjangoTag = {
  id: string;
  name: string;
  slug: string;
};

export type DjangoCourse = {
  id: string;
  category: string;
  category_details?: { id: string; name: string; slug: string };
  instructor_id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  language: "english" | "french";
  level: "beginner" | "intermediate" | "advanced" | "all";
  status: "draft" | "published";
  price: string;
  discount_price: string;
  tags: string[];
  tags_details?: DjangoTag[];
  thumbnail: string | null;
  promo_video_url: string | null;
  average_rating: number;
  total_students: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
};

export type DjangoModule = {
  id: string;
  course: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  is_published: boolean;
  is_free: boolean;
  lessons_count: number;
  created_at: string;
  updated_at: string;
};

export type DjangoLessonType = "VIDEO" | "ARTICLE" | "DOCUMENT" | "QUIZ";

export type DjangoLesson = {
  id: string;
  module: string;
  title: string;
  slug: string;
  description: string;
  lesson_type: DjangoLessonType;
  duration_in_minutes: number;
  order: number;
  is_preview: boolean;
  is_published: boolean;
  video?: DjangoVideo | null;
  created_at: string;
  updated_at: string;
};

export type DjangoVideoProvider =
  | "VIMEO"
  | "CLOUDFLARE"
  | "YOUTUBE"
  | "BUNNY"
  | "S3_HLS"
  | "OTHER";

export type DjangoVideo = {
  id: string;
  lesson: string;
  title: string;
  provider: DjangoVideoProvider;
  video_url: string;
  external_id: string | null;
  thumbnail_url: string | null;
  duration_in_seconds: number;
  duration_in_minutes: number;
  created_at: string;
  updated_at: string;
};

export type DjangoOutcomeCategory =
  | "SKILL"
  | "KNOWLEDGE"
  | "TOOL"
  | "CERTIFICATION"
  | "OTHER";

export type DjangoCourseOutcome = {
  id: string;
  course: string;
  description: string;
  category: DjangoOutcomeCategory;
  icon: string | null;
  order: number;
  is_highlighted: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type DjangoCourseHighlight = {
  id: string;
  course: string;
  title: string;
  description: string;
  icon: string | null;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type DjangoCourseLearningPoint = {
  id: string;
  course: string;
  title: string;
  description: string;
  icon: string | null;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type DjangoResourceType =
  | "DOCUMENT"
  | "ARCHIVE"
  | "CODE"
  | "AUDIO"
  | "IMAGE"
  | "EXTERNAL_LINK";

export type DjangoResource = {
  id: string;
  course: string | null;
  module: string | null;
  lesson: string | null;
  title: string;
  description: string;
  resource_type: DjangoResourceType;
  file: string | null;
  external_url: string | null;
  file_size_bytes: number;
  is_preview_allowed: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Django-aligned CRUD helpers (use UUID string IDs, correct /api/ paths)
// ---------------------------------------------------------------------------

function djangoCrud<T>(basePath: string) {
  return {
    list: (token: string) => adminFetch<T[]>(token, basePath),
    create: (token: string, payload: Record<string, unknown>) =>
      adminFetch<T>(token, basePath, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (token: string, id: string, payload: Record<string, unknown>) =>
      adminFetch<T>(token, `${basePath}${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    remove: (token: string, id: string) =>
      adminFetch<void>(token, `${basePath}${id}/`, { method: "DELETE" }),
  };
}

export const djangoTypeCoursesApi = djangoCrud<DjangoTypeCourse>("/api/course-types/");
export const djangoCoursesApi = djangoCrud<DjangoCourse>("/api/courses/");
export const djangoModulesApi = djangoCrud<DjangoModule>("/api/modules/");
export const djangoLessonsApi = djangoCrud<DjangoLesson>("/api/lessons/");
export const djangoVideosApi = djangoCrud<DjangoVideo>("/api/videos/");
export const djangoCategoriesApi = djangoCrud<DjangoCategory>("/api/categories/");
export const djangoTagsApi = djangoCrud<DjangoTag>("/api/tags/");
export const djangoOutcomesApi = djangoCrud<DjangoCourseOutcome>("/api/course-outcomes/");
export const djangoHighlightsApi = djangoCrud<DjangoCourseHighlight>("/api/course-highlights/");
export const djangoLearningPointsApi = djangoCrud<DjangoCourseLearningPoint>("/api/course-learning-points/");
export const djangoResourcesApi = djangoCrud<DjangoResource>("/api/resources/");

// Slug-based update/delete for courses (lookup_field = 'slug')
export const djangoCoursesSlugApi = {
  update: (token: string, slug: string, payload: Record<string, unknown>) =>
    adminFetch<DjangoCourse>(token, `/api/courses/${slug}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (token: string, slug: string) =>
    adminFetch<void>(token, `/api/courses/${slug}/`, { method: "DELETE" }),
};
