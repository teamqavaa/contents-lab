import CourseBannerTitle from "./CourseBannerTitle";
import MostPopularCard from "./MostPopularCard";
import CourseExplorer from "./pages/CourseExplorer";

export default function CourseBanner({ initialQuery = "" }: { initialQuery?: string }) {
    return (
        <>
            <CourseBannerTitle/>
            <MostPopularCard/>
            <CourseExplorer initialQuery={initialQuery}/>
        </>
    )
}