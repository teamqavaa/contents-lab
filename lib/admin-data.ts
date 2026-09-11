export type UserStatus = "active" | "pending" | "suspended";
export type CourseStatus = "published" | "under_review" | "draft";
export type InstructorStatus = "approved" | "pending" | "suspended";
export type LearningPathStatus = "published" | "draft";

export type Status =
  | UserStatus
  | CourseStatus
  | InstructorStatus
  | LearningPathStatus;

export type StatusTone = "green" | "gray" | "amber" | "red";

const STATUS_TONE: Record<Status, StatusTone> = {
  active: "green",
  pending: "gray",
  suspended: "red",
  published: "green",
  under_review: "amber",
  draft: "gray",
  approved: "green",
};

export function statusTone(status: Status): StatusTone {
  return STATUS_TONE[status];
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Instructor" | "Student" | "Editor";
  status: UserStatus;
  joined: string;
};

export type Course = {
  id: string;
  title: string;
  instructor: string;
  category: string;
  status: CourseStatus;
  enrolled: number;
};

export type Instructor = {
  id: string;
  name: string;
  email: string;
  status: InstructorStatus;
  courses: number;
};

export type LearningPath = {
  id: string;
  name: string;
  targetRole: string;
  status: LearningPathStatus;
  courses: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  courses: number;
};

export const users: User[] = [
  { id: "u1", name: "Amina Diallo", email: "amina.diallo@qavaa.io", role: "Admin", status: "active", joined: "Jan 12, 2025" },
  { id: "u2", name: "Kwame Mensah", email: "kwame.mensah@qavaa.io", role: "Instructor", status: "active", joined: "Feb 03, 2025" },
  { id: "u3", name: "Layla Benali", email: "layla.benali@qavaa.io", role: "Student", status: "pending", joined: "Mar 28, 2025" },
  { id: "u4", name: "Thabo Nkosi", email: "thabo.nkosi@qavaa.io", role: "Student", status: "active", joined: "Apr 11, 2025" },
  { id: "u5", name: "Grace Osei", email: "grace.osei@qavaa.io", role: "Editor", status: "suspended", joined: "May 02, 2025" },
  { id: "u6", name: "Yusuf Traoré", email: "yusuf.traore@qavaa.io", role: "Student", status: "active", joined: "Jun 19, 2025" },
  { id: "u7", name: "Nadia Haddad", email: "nadia.haddad@qavaa.io", role: "Instructor", status: "pending", joined: "Jul 08, 2025" },
];

export const courses: Course[] = [
  { id: "c1", title: "SQL Fundamentals", instructor: "Kwame Mensah", category: "Data Analytics", status: "published", enrolled: 1240 },
  { id: "c2", title: "Python for Beginners", instructor: "Nadia Haddad", category: "Programming", status: "under_review", enrolled: 862 },
  { id: "c3", title: "Data Visualization with Tableau", instructor: "Kwame Mensah", category: "Data Analytics", status: "published", enrolled: 731 },
  { id: "c4", title: "Introduction to AI & ML", instructor: "Amina Diallo", category: "AI & Machine Learning", status: "draft", enrolled: 0 },
  { id: "c5", title: "Excel for Business", instructor: "Yusuf Traoré", category: "Business", status: "published", enrolled: 1503 },
  { id: "c6", title: "Cybersecurity Essentials", instructor: "Thabo Nkosi", category: "Security", status: "under_review", enrolled: 415 },
];

export const instructors: Instructor[] = [
  { id: "i1", name: "Kwame Mensah", email: "kwame.mensah@qavaa.io", status: "approved", courses: 3 },
  { id: "i2", name: "Nadia Haddad", email: "nadia.haddad@qavaa.io", status: "pending", courses: 1 },
  { id: "i3", name: "Amina Diallo", email: "amina.diallo@qavaa.io", status: "approved", courses: 2 },
  { id: "i4", name: "Thabo Nkosi", email: "thabo.nkosi@qavaa.io", status: "approved", courses: 1 },
  { id: "i5", name: "Fatima Zahra", email: "fatima.zahra@qavaa.io", status: "pending", courses: 0 },
  { id: "i6", name: "Daniel Okafor", email: "daniel.okafor@qavaa.io", status: "suspended", courses: 4 },
];

export const learningPaths: LearningPath[] = [
  { id: "p1", name: "Data Analyst Career Path", targetRole: "Data Analyst", status: "published", courses: 6 },
  { id: "p2", name: "Machine Learning Engineer", targetRole: "ML Engineer", status: "published", courses: 8 },
  { id: "p3", name: "Cloud & DevOps Foundations", targetRole: "DevOps Engineer", status: "draft", courses: 4 },
  { id: "p4", name: "Business Intelligence", targetRole: "BI Analyst", status: "draft", courses: 5 },
];

export const categories: Category[] = [
  { id: "cat1", name: "Data Analytics", slug: "data-analytics", courses: 12 },
  { id: "cat2", name: "Programming", slug: "programming", courses: 18 },
  { id: "cat3", name: "AI & Machine Learning", slug: "ai-ml", courses: 9 },
  { id: "cat4", name: "Business", slug: "business", courses: 14 },
  { id: "cat5", name: "Security", slug: "security", courses: 6 },
  { id: "cat6", name: "Cloud & DevOps", slug: "cloud-devops", courses: 7 },
];

export const adminStats = [
  { label: "Total Users", value: 7 },
  { label: "Total Courses", value: 6 },
  { label: "Total Instructors", value: 6 },
  { label: "Learning Paths", value: 4 },
];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}