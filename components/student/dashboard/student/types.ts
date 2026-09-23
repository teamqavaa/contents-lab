export type Stat = {
  label: string;
  value: string;
  meta: string;
};

export type ContinueMeta = {
  icon: "clock" | "star" | "calendar";
  text: string;
};

export type ContinueCardData = {
  tags: string[];
  title: string;
  description: string;
  progress: number;
  progressLabel: string;
  meta: ContinueMeta[];
  primaryCta: string;
  secondaryCta: string;
};

export type LessonRowData = {
  title: string;
  kind: string;
  progress: number;
  href: string;
};

// Backend-picked next step shown in the continue section's empty state.
export type FeaturedRecommendationData = {
  eyebrow: string;
  title: string;
  description: string;
  reason: string;
  href: string;
  ctaLabel: string;
};

export type CourseSuggestionData = {
  title: string;
  kind: string;
  duration: string;
  href: string;
};

// Wired to courses-api progress rows: active shows the newest-touched course,
// empty offers the backend recommendation plus random untouched starters.
export type ContinueSectionData =
  | { kind: "active"; card: ContinueCardData; cardHref: string; rows: LessonRowData[] }
  | {
      kind: "empty";
      featured: FeaturedRecommendationData | null;
      title: string;
      message: string;
      ctaLabel: string;
      suggestions: CourseSuggestionData[];
    };

export type StreakDayState = "done" | "today" | "upcoming";

export type StreakDay = {
  label: string;
  state: StreakDayState;
};

export type StreakData = {
  summary: string;
  days: StreakDay[];
};

export type StudentDashboardData = {
  greetingName: string;
  greetingSubtitle: string;
  stats: Stat[];
  continueSection: ContinueSectionData;
  streak: StreakData;
};