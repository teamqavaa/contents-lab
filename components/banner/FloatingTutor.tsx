// components/banner/FloatingTutor.tsx

interface FloatingTutorProps {
  image: string;
}

export default function FloatingTutor({ image }: FloatingTutorProps) {
  return (
    <img
      src={image}
      alt="Tutor"
      className="w-16 h-16 rounded-2xl object-cover shadow-2xl shadow-gray-300/60 border-2 border-white"
    />
  );
}
