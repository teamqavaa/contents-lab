import CourseCard from "./CourseCard";
import CtaButton from "./CtaButton";
import FloatingBadge from "./FloatingBadge";
import StudentReview from "./StudentReview";
import Image from 'next/image';
import bannerImg from "@/images/bannerImg.jpg"


// Vos données d'exemples (vous pourrez les mettre dans un fichier séparé plus tard)
const tutors = [
  { id: 1, img: '/tutor-small-1.png', top: '35%', left: '10%' },
  { id: 2, img: '/tutor-small-2.png', top: '28%', right: '15%' },
];

const mainCourses = [
  {
    id: 1,
    image: '/career.jpg',
    stat: '92%',
    text: 'Career Outcome Success',
    author: null,
    video: false,
  },
  {
    id: 2,
    image: '/ceo.jpg',
    stat: null,
    text: null,
    author: { name: 'Mark Jhongson', title: 'See curriculum' },
    video: true,
  },
  {
    id: 3,
    image: '/tutors.jpg',
    stat: '100+',
    text: 'Experienced tutor',
    author: null,
    video: false,
  },
];

export default function Banner() {
  return (
    <section className="relative w-full min-h-screen bg-white py-16 px-4 md:px-10">
      {/* 1. Background Grid (Optimisé avec Next.js Image) */}
<div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
  <Image
    src={bannerImg} // Chemin dans le dossier /public
    alt="Grid Background"
    fill
    priority // Permet de charger l'image de fond immédiatement
    className="object-cover object-center opacity-30"
  />
</div>

{/* 2. Conteneur de Contenu Principal */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        {/* -- Partie Haute : Texte et CTA -- */}
        <div className="relative flex flex-col items-center text-center w-full max-w-4xl mb-16 mt-6">
          {/* Composant Review Etudiants */}
          <StudentReview />

          {/* Titre Principal (H1) */}
          <h1 className="text-5xl md:text-[68px] leading-tight font-extrabold text-black mt-5 mb-5 tracking-tight">
            Build skills<br />New opportunities.
          </h1>

          {/* Sous-titre (H2/P) */}
          <p className="text-gray-600 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-10">
           Qavaa Innovate gives you a complete learning experience that helps you gain real,<br />
            job-ready skills and take the next step in your career.
          </p>

          {/* Composant Bouton CTA */}
          <CtaButton />

          {/* -- Éléments Flottants en Absolute -- */}
          {/* Badge 1 (Expert Tutor) */}
          <div className="absolute top-[30%] -left-12 hidden lg:block">
            <FloatingBadge icon="tutor" title="100+" text="Expert tutor" />
          </div>


          {/* Badge 2 (Video Courses) */}
          <div className="absolute top-[21%] -right-16 hidden lg:block">
            <FloatingBadge icon="video" title="120+" text="Video courses" />
          </div>

        </div>

        {/* -- Partie Basse : Cartes de Cours -- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {mainCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
}
