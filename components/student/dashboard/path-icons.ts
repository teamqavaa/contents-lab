import {
  BarChart3,
  BookOpen,
  Braces,
  Bug,
  ChartNoAxesCombined,
  Cloud,
  Container,
  Database,
  GitBranch,
  KeyRound,
  Monitor,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import type { PathKind } from "@/types/student/career-path";

// Keys match the ICON_CHOICES on the courses-api LearningPath model.
const skillPathIcons: Record<string, LucideIcon> = {
  git: GitBranch,
  api: Braces,
  sql: Database,
  cli: Terminal,
  docker: Container,
  "data-viz": ChartNoAxesCombined,
  testing: Bug,
  security: KeyRound,
};

const careerPathIcons: Record<string, LucideIcon> = {
  backend: Server,
  frontend: Monitor,
  data: BarChart3,
  cloud: Cloud,
  security: ShieldCheck,
  mobile: Smartphone,
};

// Exported for client components that map a stored icon name back to its
// Lucide component without a function call (which the lint rule rejects).
export { skillPathIcons, careerPathIcons };

// Falls back to BookOpen when admin picks no icon or an unknown value.
export function getPathIcon(kind: PathKind, icon: string): LucideIcon {
  const map = kind === "skill" ? skillPathIcons : careerPathIcons;
  return map[icon] ?? BookOpen;
}
