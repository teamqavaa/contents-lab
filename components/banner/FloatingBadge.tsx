import { User, Video } from "lucide-react";
interface FloatingBadgeProps {
  icon: "tutor" | "video";
  title: string;
  text: string;
}

export default function FloatingBadge({
  icon,
  title,
  text,
}: FloatingBadgeProps) {
  return (
    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl p-3 shadow-xl shadow-gray-100/40">
      {/* Icône */}
      <div className="flex items-center justify-center w-11 h-11 bg-gray-100 rounded-lg text-blue-400">
        {icon === "tutor" ? <User size={22} /> : <Video size={22} />}
      </div>
      {/* Texte */}
      <div className="flex flex-col">
        <span className="text-black text-base font-bold">{title}</span>
        <span className="text-gray-500 text-xs font-medium">{text}</span>
      </div>
    </div>
  );
}
