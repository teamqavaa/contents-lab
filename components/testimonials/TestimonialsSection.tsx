import TestimonialCard, { Testimonial } from './TestimonialCard';

const testimonialsData: Testimonial[] = [
  {
    id: '1',
    quote: 'I came in writing my first loop and left defending a full app in front of hiring mentors. The labs did that.',
    author: {
      name: 'Mariam Ndiaye',
      avatar: '/career.jpg', // Placez l'image dans /public/images/
      cohort: 'Cohort 02',
      role: 'Junior Developer',
    },
  },
  {
    id: '2',
    quote: 'Every week ends with something that runs. No passive lectures, no busywork — just review, ship, repeat.',
    author: {
      name: 'Dev Patel',
      avatar: '/career.jpg',
      cohort: 'Cohort 03',
      role: 'Data Analyst',
    },
  },
  {
    id: '3',
    quote: 'The mentor reviews were brutal in the best way. My portfolio finally looked like real engineering work.',
    author: {
      name: 'Grace Abara',
      avatar: '/career.jpg',
      cohort: 'Cohort 01',
      role: 'Frontend Engineer',
    },
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-[#f3f3f3] py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* En-tête de la section */}
        <div className="flex flex-col gap-2">
          <span className="text-xs md:text-sm font-semibold tracking-widest text-neutral-500 uppercase">
            VOICES FROM THE LAB
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Graduates who ship
          </h2>
        </div>

        {/* Grille des cartes de témoignage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:px-12">
          {testimonialsData.map((item) => (
            <TestimonialCard key={item.id} testimonial={item} />
          ))}
        </div>

      </div>
    </section>
  );
}
