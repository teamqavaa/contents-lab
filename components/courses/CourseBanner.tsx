import CourseBannerTitle from "./CourseBannerTitle";
import RecentlyAddedCourses from "./RecentlyAddedCourses";
import CourseExplorer from "./pages/CourseExplorer";

export default function CourseBanner(){
    return (
        <>
            <CourseBannerTitle/>
            <RecentlyAddedCourses/>
            <CourseExplorer/>
        </>
    )
}