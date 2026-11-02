// lib/courseTransfer.ts — import / export des cours et de toutes leurs tables liées :
// modules, leçons (+ vidéo), points forts, points d'apprentissage, résultats, ressources, codes promo, tags.
// Côté serveur uniquement : appelé par la route d'export et la server action d'import, qui
// vérifient que l'utilisateur est administrateur. courses-api revérifie chaque requête.
//
// Règles de l'import :
// - une ligne dont l'`id` (ou le `slug` pour un cours) existe déjà met l'élément à jour, sinon elle le crée ;
// - seules les colonnes présentes dans le fichier sont envoyées : une colonne absente n'efface rien ;
// - rien n'est supprimé : une ligne retirée du fichier reste dans la base ;
// - les références se font par `course_slug`, et par id **ou** titre pour un module / une leçon
//   (un module créé dans la feuille Modules peut donc être utilisé par son titre dans Lessons).
import type { CatalogCategory } from '@/actions/catalog';
import type { ManagedCourse } from '@/actions/manageCourses';
import { TABLE_KEYS, type ParsedTable, type ParsedWorkbook, type Row, type TableKey, type Workbook } from '@/lib/courseSpreadsheet';
import { apiCall, readErrors } from '@/lib/manageApi';

// ---------------------------------------------------------------------------
// Données de courses-api
// ---------------------------------------------------------------------------

interface ApiVideo { id: string; provider: string; video_url: string }
interface ApiLesson {
  id: string; title: string; description: string; lesson_type: string; duration_in_minutes: number;
  order: number; is_preview: boolean; is_published: boolean; video: ApiVideo | null;
}
interface ApiModule {
  id: string; title: string; description: string; order: number; is_published: boolean; is_free?: boolean;
  lessons: ApiLesson[];
}
interface ApiCourseDetail {
  id: string; slug: string; description: string; prerequisites: string; target_audience: string;
  promo_video_url: string | null; tags_details?: { id: string; name: string }[]; modules: ApiModule[];
}
interface ApiItem {
  id: string; course: string | null; title?: string; description?: string; icon?: string | null; order?: number;
  is_published?: boolean; category?: string; is_highlighted?: boolean;
}
interface ApiResource {
  id: string; course: string | null; module: string | null; lesson: string | null; title: string; description: string;
  resource_type: string; file: string | null; external_url: string | null; is_preview_allowed: boolean; is_published: boolean;
}
interface ApiDiscount {
  id: string; code: string; discount_percentage: number; course: string | null; active: boolean;
  valid_from: string; valid_to: string; max_uses: number | null; used_count: number;
}
interface ApiTag { id: string; name: string; slug: string }

/** Points d'entrée de courses-api pour chaque table liée. */
const ENDPOINTS = {
  modules: '/api/modules/',
  lessons: '/api/lessons/',
  highlights: '/api/course-highlights/',
  learning_points: '/api/course-learning-points/',
  outcomes: '/api/course-outcomes/',
  resources: '/api/resources/',
  discounts: '/api/discounts/',
} as const;

async function getList<T>(path: string): Promise<T[]> {
  const response = await apiCall(path);
  if (!response.ok) throw new Error(`${path}: ${readErrors(response.data).message}`);
  return Array.isArray(response.data) ? (response.data as T[]) : [];
}

/** Photo de la base : cours gérables, leur détail (programme) et les tables liées. */
async function loadSnapshot() {
  const [courses, highlights, learningPoints, outcomes, resources, discounts, tags] = await Promise.all([
    getList<ManagedCourse>('/api/courses/manage/'),
    getList<ApiItem>(ENDPOINTS.highlights),
    getList<ApiItem>(ENDPOINTS.learning_points),
    getList<ApiItem>(ENDPOINTS.outcomes),
    getList<ApiResource>(ENDPOINTS.resources),
    getList<ApiDiscount>(ENDPOINTS.discounts),
    getList<ApiTag>('/api/tags/'),
  ]);

  // La liste ne contient ni la description ni le programme : détail de chaque cours, 6 à la fois
  const details = new Map<string, ApiCourseDetail>();
  for (let i = 0; i < courses.length; i += 6) {
    const batch = courses.slice(i, i + 6);
    const responses = await Promise.all(batch.map((course) => apiCall(`/api/courses/${encodeURIComponent(course.slug)}/`)));
    responses.forEach((response, index) => {
      if (response.ok) details.set(batch[index].id, response.data as ApiCourseDetail);
    });
  }

  // Seules les lignes des cours gérables sont exportées / modifiables
  const courseIds = new Set(courses.map((course) => course.id));
  const ofManaged = <T extends { course: string | null }>(items: T[]) => items.filter((item) => item.course && courseIds.has(item.course));

  return {
    courses,
    details,
    highlights: ofManaged(highlights),
    learningPoints: ofManaged(learningPoints),
    outcomes: ofManaged(outcomes),
    resources,
    discounts,
    tags,
  };
}

type Snapshot = Awaited<ReturnType<typeof loadSnapshot>>;

const str = (value: unknown) => (value === null || value === undefined ? '' : String(value));

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export async function collectWorkbook(): Promise<Workbook> {
  const snapshot = await loadSnapshot();
  const slugById = new Map(snapshot.courses.map((course) => [course.id, course.slug]));

  // Pour les ressources : à quel cours / module appartient chaque module / leçon
  const moduleInfo = new Map<string, { courseId: string; title: string }>();
  const lessonInfo = new Map<string, { courseId: string; moduleId: string; title: string }>();

  const workbook: Workbook = {
    courses: [], modules: [], lessons: [], highlights: [], learning_points: [], outcomes: [], resources: [], discounts: [],
  };

  for (const course of snapshot.courses) {
    const detail = snapshot.details.get(course.id);
    workbook.courses.push({
      slug: course.slug,
      title: course.title,
      subtitle: str(course.subtitle),
      description: str(detail?.description),
      category: str(course.category_details?.slug),
      tags: (detail?.tags_details ?? []).map((tag) => tag.name).join(', '),
      level: str(course.level),
      language: str(course.language),
      price: str(course.price),
      discount_price: str(course.discount_price),
      status: course.status,
      thumbnail: str(course.thumbnail),
      promo_video_url: str(detail?.promo_video_url),
      prerequisites: str(detail?.prerequisites),
      target_audience: str(detail?.target_audience),
      author_email: str(course.user_email),
      students: str(course.total_students),
      updated_at: str(course.updated_at),
    });

    for (const mod of [...(detail?.modules ?? [])].sort((a, b) => a.order - b.order)) {
      moduleInfo.set(mod.id, { courseId: course.id, title: mod.title });
      workbook.modules.push({
        id: mod.id,
        course_slug: course.slug,
        title: mod.title,
        description: str(mod.description),
        order: str(mod.order),
        is_published: str(mod.is_published),
        is_free: str(mod.is_free ?? false),
        lessons: str(mod.lessons?.length ?? 0),
      });
      for (const lesson of [...(mod.lessons ?? [])].sort((a, b) => a.order - b.order)) {
        lessonInfo.set(lesson.id, { courseId: course.id, moduleId: mod.id, title: lesson.title });
        workbook.lessons.push({
          id: lesson.id,
          course_slug: course.slug,
          module_id: mod.id,
          module_title: mod.title,
          title: lesson.title,
          description: str(lesson.description),
          lesson_type: str(lesson.lesson_type),
          duration_in_minutes: str(lesson.duration_in_minutes),
          order: str(lesson.order),
          is_preview: str(lesson.is_preview),
          is_published: str(lesson.is_published),
          video_url: str(lesson.video?.video_url),
          video_provider: str(lesson.video?.provider),
        });
      }
    }
  }

  const sorted = <T extends ApiItem>(items: T[]) =>
    [...items].sort((a, b) => str(slugById.get(a.course!)).localeCompare(str(slugById.get(b.course!))) || (a.order ?? 0) - (b.order ?? 0));

  for (const [table, items] of [['highlights', snapshot.highlights], ['learning_points', snapshot.learningPoints]] as const) {
    workbook[table] = sorted(items).map((item) => ({
      id: item.id,
      course_slug: str(slugById.get(item.course!)),
      title: str(item.title),
      description: str(item.description),
      icon: str(item.icon),
      order: str(item.order),
      is_published: str(item.is_published),
    }));
  }

  workbook.outcomes = sorted(snapshot.outcomes).map((item) => ({
    id: item.id,
    course_slug: str(slugById.get(item.course!)),
    description: str(item.description),
    category: str(item.category),
    icon: str(item.icon),
    order: str(item.order),
    is_highlighted: str(item.is_highlighted),
    is_published: str(item.is_published),
  }));

  for (const resource of snapshot.resources) {
    const lesson = resource.lesson ? lessonInfo.get(resource.lesson) : undefined;
    const moduleId = resource.module ?? lesson?.moduleId ?? null;
    const mod = moduleId ? moduleInfo.get(moduleId) : undefined;
    const courseId = resource.course ?? mod?.courseId ?? lesson?.courseId;
    if (!courseId || !slugById.has(courseId)) continue;
    workbook.resources.push({
      id: resource.id,
      course_slug: str(slugById.get(courseId)),
      module_id: str(resource.module),
      module_title: resource.module ? str(moduleInfo.get(resource.module)?.title) : '',
      lesson_id: str(resource.lesson),
      lesson_title: str(lesson?.title),
      title: resource.title,
      description: str(resource.description),
      resource_type: str(resource.resource_type),
      external_url: str(resource.external_url),
      file: str(resource.file),
      is_preview_allowed: str(resource.is_preview_allowed),
      is_published: str(resource.is_published),
    });
  }

  workbook.discounts = snapshot.discounts.map((discount) => ({
    id: discount.id,
    code: discount.code,
    discount_percentage: str(discount.discount_percentage),
    course_slug: discount.course ? str(slugById.get(discount.course)) : '',
    active: str(discount.active),
    valid_from: str(discount.valid_from),
    valid_to: str(discount.valid_to),
    max_uses: str(discount.max_uses),
    used_count: str(discount.used_count),
  }));

  return workbook;
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export interface ImportFailure {
  table: TableKey;
  line: number;
  label: string;
  message: string;
}

export interface ImportReport {
  counts: { table: TableKey; created: number; updated: number }[];
  failures: ImportFailure[];
}

/** Erreur d'une ligne (valeur invalide, référence introuvable) : la ligne est ignorée. */
class RowError extends Error {}

function parseBool(value: string, field: string): boolean | undefined {
  if (!value) return undefined;
  if (/^(true|1|yes|y|oui|vrai|x)$/i.test(value)) return true;
  if (/^(false|0|no|n|non|faux)$/i.test(value)) return false;
  throw new RowError(`${field}: "${value}" is not true / false.`);
}

function parseInteger(value: string, field: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value.replace(',', '.'));
  if (!Number.isInteger(number)) throw new RowError(`${field}: "${value}" is not a whole number.`);
  return number;
}

/**
 * Corps de la requête : uniquement les colonnes présentes dans le fichier.
 * `text` : valeur telle quelle (vide = vide) ; `nullable` : vide = null ;
 * `bool` / `int` / `upper` / `lower` : une cellule vide n'envoie rien.
 */
function bodyBuilder(columns: Set<string>, values: Row) {
  const body: Record<string, unknown> = {};
  const has = (field: string) => columns.has(field);
  return {
    body,
    text(...fields: string[]) {
      for (const field of fields) if (has(field)) body[field] = values[field] ?? '';
    },
    nullable(...fields: string[]) {
      for (const field of fields) if (has(field)) body[field] = values[field] || null;
    },
    bool(...fields: string[]) {
      for (const field of fields) {
        const value = has(field) ? parseBool(values[field] ?? '', field) : undefined;
        if (value !== undefined) body[field] = value;
      }
    },
    int(...fields: string[]) {
      for (const field of fields) {
        const value = has(field) ? parseInteger(values[field] ?? '', field) : undefined;
        if (value !== undefined) body[field] = value;
      }
    },
    upper(...fields: string[]) {
      for (const field of fields) if (has(field) && values[field]) body[field] = values[field].toUpperCase();
    },
    lower(...fields: string[]) {
      for (const field of fields) if (has(field) && values[field]) body[field] = values[field].toLowerCase();
    },
  };
}

/** Exécute `task` sur chaque élément, `limit` à la fois (l'API n'est pas saturée, l'import reste rapide). */
async function runPool<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) await task(items[next++]);
    }),
  );
}

/** Catégories et sous-catégories, retrouvables par id, slug ou nom (sans tenir compte de la casse). */
async function categoryResolver(): Promise<(value: string) => string | null> {
  const lookup = new Map<string, string>();
  const visit = (categories: CatalogCategory[]) => {
    for (const category of categories) {
      for (const key of [category.id, category.slug, category.name]) lookup.set(String(key).toLowerCase(), category.id);
      if (category.subcategories) visit(category.subcategories);
    }
  };
  visit(await getList<CatalogCategory>('/api/categories/'));
  return (value) => lookup.get(value.toLowerCase()) ?? null;
}

/** Tags par nom ou slug ; un tag inconnu est créé (POST /api/tags/). */
async function tagResolver() {
  const lookup = new Map<string, string>();
  for (const tag of await getList<ApiTag>('/api/tags/')) {
    lookup.set(tag.name.toLowerCase(), tag.id);
    lookup.set(tag.slug.toLowerCase(), tag.id);
  }
  return async (names: string[]): Promise<string[]> => {
    const ids: string[] = [];
    for (const name of names) {
      let id = lookup.get(name.toLowerCase());
      if (!id) {
        const created = await apiCall('/api/tags/', { method: 'POST', body: JSON.stringify({ name }) });
        if (!created.ok) throw new RowError(`tag "${name}": ${readErrors(created.data).message}`);
        id = (created.data as ApiTag).id;
        lookup.set(name.toLowerCase(), id);
      }
      ids.push(id);
    }
    return ids;
  };
}

/** Modules et leçons d'un cours, retrouvables par id ou par titre. */
interface CourseIndex {
  modules: Map<string, string>;
  lessons: Map<string, string>;
  /** leçon → sa vidéo actuelle (null si aucune) */
  videos: Map<string, ApiVideo | null>;
}

function buildIndexes(snapshot: Snapshot) {
  const courseIdBySlug = new Map(snapshot.courses.map((course) => [course.slug, course.id]));
  const byCourse = new Map<string, CourseIndex>();
  const existing: Record<Exclude<TableKey, 'courses'>, Set<string>> = {
    modules: new Set(), lessons: new Set(),
    highlights: new Set(snapshot.highlights.map((item) => item.id)),
    learning_points: new Set(snapshot.learningPoints.map((item) => item.id)),
    outcomes: new Set(snapshot.outcomes.map((item) => item.id)),
    resources: new Set(snapshot.resources.map((item) => item.id)),
    discounts: new Set(snapshot.discounts.map((item) => item.id)),
  };

  for (const course of snapshot.courses) {
    const index: CourseIndex = { modules: new Map(), lessons: new Map(), videos: new Map() };
    for (const mod of snapshot.details.get(course.id)?.modules ?? []) {
      index.modules.set(mod.id, mod.id);
      index.modules.set(mod.title.toLowerCase(), mod.id);
      existing.modules.add(mod.id);
      for (const lesson of mod.lessons ?? []) {
        index.lessons.set(lesson.id, lesson.id);
        index.lessons.set(lesson.title.toLowerCase(), lesson.id);
        index.videos.set(lesson.id, lesson.video ?? null);
        existing.lessons.add(lesson.id);
      }
    }
    byCourse.set(course.id, index);
  }
  return { courseIdBySlug, byCourse, existing };
}

const VIDEO_PROVIDERS = ['VIMEO', 'CLOUDFLARE', 'YOUTUBE', 'BUNNY', 'S3_HLS', 'OTHER'];

export async function importWorkbook(parsed: ParsedWorkbook): Promise<ImportReport> {
  const report: ImportReport = { counts: [], failures: [] };

  /** Importe une table : `prepare` renvoie le corps de la requête (ou lève RowError), `after` suit l'enregistrement. */
  async function importTable(
    table: TableKey,
    sheet: ParsedTable | undefined,
    options: {
      label: (values: Row) => string;
      isUpdate: (values: Row) => string | null;
      endpoint: string;
      prepare: (values: Row, columns: Set<string>) => Promise<Record<string, unknown>> | Record<string, unknown>;
      after?: (values: Row, saved: { id?: string; slug?: string }, isUpdate: boolean) => Promise<void> | void;
      concurrency?: number;
    },
  ) {
    if (!sheet || sheet.rows.length === 0) return;
    const count = { table, created: 0, updated: 0 };
    report.counts.push(count);

    await runPool(sheet.rows, options.concurrency ?? 4, async ({ line, values }) => {
      const label = options.label(values) || '(untitled)';
      try {
        const body = await options.prepare(values, sheet.columns);
        const target = options.isUpdate(values);
        const response = await apiCall(target ? `${options.endpoint}${encodeURIComponent(target)}/` : options.endpoint, {
          method: target ? 'PATCH' : 'POST',
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new RowError(readErrors(response.data).message);
        await options.after?.(values, (response.data ?? {}) as { id?: string; slug?: string }, Boolean(target));
        if (target) count.updated++;
        else count.created++;
      } catch (error) {
        if (!(error instanceof RowError)) console.error(`Import ${table} ligne ${line} :`, error);
        report.failures.push({ table, line, label, message: error instanceof Error ? error.message : 'Unexpected error.' });
      }
    });
  }

  // ---- 1. Cours -----------------------------------------------------------
  const managed = await getList<ManagedCourse>('/api/courses/manage/');
  const slugs = new Set(managed.map((course) => course.slug));
  const resolveCategory = await categoryResolver();
  const resolveTags = await tagResolver();

  await importTable('courses', parsed.courses, {
    label: (v) => v.title || v.slug,
    isUpdate: (v) => (v.slug && slugs.has(v.slug) ? v.slug : null),
    endpoint: '/api/courses/',
    // Une requête à la fois : deux lignes ne peuvent pas créer le même slug en parallèle
    concurrency: 1,
    prepare: async (v, columns) => {
      const b = bodyBuilder(columns, v);
      b.text('title', 'subtitle', 'description', 'prerequisites', 'target_audience');
      b.lower('level', 'language', 'status');
      b.nullable('thumbnail', 'promo_video_url');
      // Excel en français écrit « 19,99 »
      for (const field of ['price', 'discount_price']) if (columns.has(field)) b.body[field] = (v[field] ?? '').replace(',', '.');
      if (columns.has('discount_price') && !b.body.discount_price) b.body.discount_price = '0';
      if (columns.has('category') && v.category) {
        const id = resolveCategory(v.category);
        if (!id) throw new RowError(`Unknown category "${v.category}".`);
        b.body.category = id;
      }
      if (columns.has('tags')) {
        b.body.tags = await resolveTags(v.tags.split(/[,;]/).map((name) => name.trim()).filter(Boolean));
      }
      if (!(v.slug && slugs.has(v.slug))) {
        if (!v.title) throw new RowError('A title is required to create a course.');
        if (!b.body.category) throw new RowError('A category is required to create a course.');
        if (!b.body.price) throw new RowError('A price is required to create a course.');
      }
      return b.body;
    },
    after: (_, saved) => {
      if (saved.slug) slugs.add(saved.slug);
    },
  });

  const hasChildren = TABLE_KEYS.some((table) => table !== 'courses' && parsed[table]?.rows.length);
  if (!hasChildren) return report;

  // ---- 2. Tables liées : nouvelle photo (les cours créés à l'étape 1 ont maintenant un id) ----
  const { courseIdBySlug, byCourse, existing } = buildIndexes(await loadSnapshot());

  const courseOf = (v: Row, required = true): string | null => {
    if (!v.course_slug) {
      if (required) throw new RowError('course_slug is required.');
      return null;
    }
    const id = courseIdBySlug.get(v.course_slug);
    if (!id) throw new RowError(`Unknown course "${v.course_slug}".`);
    return id;
  };
  const indexOf = (courseId: string) => byCourse.get(courseId)!;
  const findIn = (map: Map<string, string>, id: string | undefined, title: string | undefined, what: string): string | null => {
    if (!id && !title) return null;
    const found = (id && map.get(id)) || (title && map.get(title.toLowerCase()));
    if (!found) throw new RowError(`Unknown ${what} "${id || title}" in this course.`);
    return found;
  };
  const updateTarget = (table: Exclude<TableKey, 'courses'>) => (v: Row) => (v.id && existing[table].has(v.id) ? v.id : null);

  await importTable('modules', parsed.modules, {
    label: (v) => v.title,
    isUpdate: updateTarget('modules'),
    endpoint: ENDPOINTS.modules,
    prepare: (v, columns) => {
      const b = bodyBuilder(columns, v);
      b.body.course = courseOf(v);
      b.text('title', 'description');
      b.int('order');
      b.bool('is_published', 'is_free');
      return b.body;
    },
    // Un module créé devient utilisable par son titre dans la feuille Lessons
    after: (v, saved) => {
      if (!saved.id) return;
      const index = indexOf(courseOf(v)!);
      index.modules.set(saved.id, saved.id);
      if (v.title) index.modules.set(v.title.toLowerCase(), saved.id);
    },
  });

  await importTable('lessons', parsed.lessons, {
    label: (v) => v.title,
    isUpdate: updateTarget('lessons'),
    endpoint: ENDPOINTS.lessons,
    prepare: (v, columns) => {
      const b = bodyBuilder(columns, v);
      const courseId = courseOf(v)!;
      const moduleId = findIn(indexOf(courseId).modules, v.module_id, v.module_title, 'module');
      if (moduleId) b.body.module = moduleId;
      else if (!updateTarget('lessons')(v)) throw new RowError('module_id or module_title is required to create a lesson.');
      b.text('title', 'description');
      b.upper('lesson_type');
      b.int('duration_in_minutes', 'order');
      b.bool('is_preview', 'is_published');
      return b.body;
    },
    // Vidéo : même logique que l'éditeur (saveLessonAction) — URL = créer / modifier, vide = supprimer
    after: async (v, saved, isUpdate) => {
      const lessonId = isUpdate ? v.id : saved.id;
      const columns = parsed.lessons!.columns;
      const index = indexOf(courseOf(v)!);
      if (!isUpdate && lessonId) {
        index.lessons.set(lessonId, lessonId);
        if (v.title) index.lessons.set(v.title.toLowerCase(), lessonId);
      }
      if (!columns.has('video_url') || !lessonId) return;

      const url = v.video_url ?? '';
      const current = isUpdate ? index.videos.get(lessonId) ?? null : null;
      const videoId = current?.id ?? null;
      let response = { ok: true, data: null as unknown };
      if (url) {
        const given = (v.video_provider ?? '').toUpperCase();
        const provider = VIDEO_PROVIDERS.includes(given) ? given : /youtu\.?be/.test(url) ? 'YOUTUBE' : /vimeo\.com/.test(url) ? 'VIMEO' : 'OTHER';
        // Vidéo inchangée : aucune requête
        if (current && current.video_url === url && current.provider === provider) return;
        response = await apiCall(videoId ? `/api/videos/${videoId}/` : '/api/videos/', {
          method: videoId ? 'PATCH' : 'POST',
          body: JSON.stringify({ lesson: lessonId, title: v.title || 'Video', provider, video_url: url }),
        });
      } else if (videoId) {
        response = await apiCall(`/api/videos/${videoId}/`, { method: 'DELETE' });
      }
      if (!response.ok) throw new RowError(`Lesson saved, but the video was rejected — ${readErrors(response.data).message}`);
    },
  });

  for (const table of ['highlights', 'learning_points'] as const) {
    await importTable(table, parsed[table], {
      label: (v) => v.title,
      isUpdate: updateTarget(table),
      endpoint: ENDPOINTS[table],
      prepare: (v, columns) => {
        const b = bodyBuilder(columns, v);
        b.body.course = courseOf(v);
        b.text('title', 'description');
        b.nullable('icon');
        b.int('order');
        b.bool('is_published');
        return b.body;
      },
    });
  }

  await importTable('outcomes', parsed.outcomes, {
    label: (v) => v.description,
    isUpdate: updateTarget('outcomes'),
    endpoint: ENDPOINTS.outcomes,
    prepare: (v, columns) => {
      const b = bodyBuilder(columns, v);
      b.body.course = courseOf(v);
      b.text('description');
      b.upper('category');
      b.nullable('icon');
      b.int('order');
      b.bool('is_highlighted', 'is_published');
      return b.body;
    },
  });

  await importTable('resources', parsed.resources, {
    label: (v) => v.title,
    isUpdate: updateTarget('resources'),
    endpoint: ENDPOINTS.resources,
    prepare: (v, columns) => {
      const b = bodyBuilder(columns, v);
      const courseId = courseOf(v)!;
      const index = indexOf(courseId);
      // Rattachement : au cours, à un module ou à une leçon de ce cours
      b.body.course = courseId;
      if (columns.has('module_id') || columns.has('module_title')) b.body.module = findIn(index.modules, v.module_id, v.module_title, 'module');
      if (columns.has('lesson_id') || columns.has('lesson_title')) b.body.lesson = findIn(index.lessons, v.lesson_id, v.lesson_title, 'lesson');
      b.text('title', 'description');
      b.upper('resource_type');
      // Le fichier lui-même ne s'importe pas : seulement un lien externe
      b.nullable('external_url');
      b.bool('is_preview_allowed', 'is_published');
      return b.body;
    },
  });

  await importTable('discounts', parsed.discounts, {
    label: (v) => v.code,
    isUpdate: updateTarget('discounts'),
    endpoint: ENDPOINTS.discounts,
    prepare: (v, columns) => {
      const b = bodyBuilder(columns, v);
      // Pas de cours = code valable sur tous les cours
      if (columns.has('course_slug')) b.body.course = courseOf(v, false);
      b.text('code');
      b.int('discount_percentage', 'max_uses');
      b.bool('active');
      for (const field of ['valid_from', 'valid_to']) if (columns.has(field) && v[field]) b.body[field] = v[field];
      return b.body;
    },
  });

  report.failures.sort((a, b) => TABLE_KEYS.indexOf(a.table) - TABLE_KEYS.indexOf(b.table) || a.line - b.line);
  return report;
}
