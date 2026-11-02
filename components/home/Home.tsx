// components/home/Home.tsx — page d'accueil des visiteurs
import { getPublishedCourses } from "@/actions/catalog";
import { getLabs } from "@/actions/lab-sessions";
import Banner from "../banner/Banner";
import PopularCoursesSection from "../body/PopularCoursesSection";
import CourseGrid from "../courses/CourseGrid";
import CareerPathsSection from "./CareerPathsSection";
import PracticeLabSection from "./PracticeLabSection";
import ReadyToLearnSection from "./ReadyToLearnSection";

export default async function HomePage(){
    // Cours publiés (= career tracks) et labs publics de courses-api, chargés une seule fois
    const [courses, labs] = await Promise.all([getPublishedCourses(), getLabs()]);
    const categories = new Set(courses.map((course) => course.category_details?.name).filter(Boolean)).size;

    return(
    <>
        <Banner/>
        <PopularCoursesSection/>
        <CourseGrid/>
        <PracticeLabSection labs={labs.ok ? labs.labs : []} courses={courses}/>
        <CareerPathsSection courses={courses}/>
        <ReadyToLearnSection courses={courses.length} categories={categories}/>
    </>
    )
}
