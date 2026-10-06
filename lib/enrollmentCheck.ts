export function checkUserEnrollment(enrolledCourses: any, slug: string): boolean {
  const enrollmentsList = Array.isArray(enrolledCourses)
    ? enrolledCourses
    : (enrolledCourses?.results || []);

  return enrollmentsList.some((course: any) => {
    const courseSlug = course.slug || course.course?.slug || course.course_details?.slug;
    return courseSlug === slug;
  });
}
