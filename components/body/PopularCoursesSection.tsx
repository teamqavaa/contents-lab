import SectionHeader from './SectionHeader';

export default function PopularCoursesSection() {
  return (
    <section className="w-full bg-[#f3f3f3] py-8 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* En-tête de la section */}
        <SectionHeader
          subtitle="TRY BEFORE YOU COMMIT"
          title="Popular Courses"
          linkText="Browse all courses"
          linkHref="/courses"
        />

        {/* C'est ici que vous pourrez insérer la grille de cartes de vos cours */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"> ... </div> */}
      </div>
    </section>
  );
}
