// Staff-facing client for the courses-api backend. Every call carries
// the SSO access token from the httpOnly cookie; the backend rejects non-staff.
const COURSES_API_URL =
  process.env.COURSES_API_URL ?? "http://localhost:8001";

type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
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
      return { ok: false, data: null, error: `Request failed (${res.status})`, status: res.status };
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

// List endpoints are plain DRF routers without pagination.
export type CourseType = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_virtual: boolean;
  is_active: boolean;
};

// Flat, editable shape returned by /api/admin/courses/. PK fields are
// writable; slug/timestamps are server-managed.
export type Course = {
  id: number;
  type: number | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  language: string;
  level: "beginner" | "intermediate" | "advanced";
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

export type CourseCreateInput = Pick<
  Course,
  | "type"
  | "title"
  | "subtitle"
  | "description"
  | "language"
  | "level"
  | "is_active"
  | "thumbnail"
  | "instructor"
  | "duration_minutes"
  | "rating"
  | "review_count"
  | "price"
  | "original_price"
  | "cohort_label"
  | "audience"
  | "downloadable_files_count"
>;

export type CourseUpdateInput = Partial<CourseCreateInput>;

// The Django admin exposes course highlights/outcomes/learning-points/
// requirements as inlines. They map one-to-one onto four admin resources.
export type CourseRelatedKind =
  | "highlights"
  | "outcomes"
  | "learning_points"
  | "requirements";

export type CourseRelatedItem = {
  id: number;
  course: number;
  order: number;
  content: string;
};

export type CourseRelatedInput = {
  course: number;
  order: number;
  content: string;
};

export type LearningPath = {
  id: number;
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
  courses: number[];
};

export type Quiz = {
  id: number;
  type_quiz: number | null;
  title: string;
  description: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizType = {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
};

export type QuizQuestion = {
  id: number;
  quiz: number;
  type_question: number | null;
  text: string;
  order: number;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizOption = {
  id: number;
  question: number;
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
    update: (token: string, id: number, payload: Partial<T>) =>
      adminFetch<T>(token, `${basePath}${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    remove: (token: string, id: number) =>
      adminFetch<void>(token, `${basePath}${id}/`, { method: "DELETE" }),
  };
}

export const courseTypesApi = crud<CourseType>("/api/admin/course-types/");
export const coursesApi = crud<Course>("/api/admin/courses/");
export const learningPathsApi = crud<LearningPath>("/api/admin/learning-paths/");
export const quizzesApi = crud<Quiz>("/api/admin/quizzes/");
export const quizTypesApi = crud<QuizType>("/api/admin/quiz-types/");
export const questionsApi = crud<QuizQuestion>("/api/admin/questions/");
export const optionsApi = crud<QuizOption>("/api/admin/options/");

// Course inline resources. Each entry resolves the kind used by the manager
// to the admin endpoint holding its rows. All four share the same shape.
export const courseRelatedApis: Record<
  CourseRelatedKind,
  { list: (token: string) => Promise<ApiResult<CourseRelatedItem[]>>; create: (token: string, payload: CourseRelatedInput) => Promise<ApiResult<CourseRelatedItem>>; update: (token: string, id: number, payload: CourseRelatedInput) => Promise<ApiResult<CourseRelatedItem>>; remove: (token: string, id: number) => Promise<ApiResult<void>>; resource: string }
> = {
  highlights: { ...crud<CourseRelatedItem>("/api/admin/highlights/"), resource: "Highlight" },
  outcomes: { ...crud<CourseRelatedItem>("/api/admin/outcomes/"), resource: "Outcome" },
  learning_points: {
    ...crud<CourseRelatedItem>("/api/admin/learning-points/"),
    resource: "Learning point",
  },
  requirements: { ...crud<CourseRelatedItem>("/api/admin/requirements/"), resource: "Requirement" },
};
