export default function CourseBannerTitle() {
  return (
    <section className="w-full bg-[#f8fafc]  border-neutral-200/60 pt-20 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Conteneur aligné avec le reste de la page */}
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:gap-4 text-left">

        {/* Titre responsive */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-tight">
          AI courses
        </h1>

        {/* Sous-titre avec largeur contrôlée pour une meilleure lisibilité */}
        <p className="text-neutral-600 text-base  font-normal leading-relaxed max-w-3xl">
          Grow your AI career with foundational specializations and skill-specific short courses taught by leaders in the field.
        </p>

      </div>
    </section>
  );
}
