import Banner from "./banner/Banner";
import PopularCoursesSection from "./body/PopularCoursesSection";
import CourseGrid from "./courses/CourseGrid";
import CtaSection from "./CtaSection";
import KeyDatesSection from "./key-dates/KeyDateSection";
import TestimonialsSection from "./testimonials/TestimonialsSection";

export default function HomePage(){
    return(
    <>
        <Banner/>
        <PopularCoursesSection/>
        <CourseGrid/>
        <KeyDatesSection/>
        <TestimonialsSection/>
        <CtaSection/>
    </>
    )
}