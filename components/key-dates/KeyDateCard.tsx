// components/key-dates/KeyDateCard.tsx

export type IconType = 'calendar' | 'clock' | 'graduation';

interface KeyDateCardProps {
  iconType: IconType;
  label: string;
  value: string;
}

export default function KeyDateCard({ iconType, label, value }: KeyDateCardProps) {
  // Sélection dynamique des icônes SVG
  const renderIcon = () => {
    switch (iconType) {
      case 'calendar':
        return (
          <svg className="w-5 h-5 stroke-current stroke-[1.8] text-blue-400" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M8.25 12h.008v.008H8.25V12zm0 3.75h.008v.008H8.25v-.008zm3.75-3.75h.008v.008H12V12zm0 3.75h.008v.008H12v-.008zm3.75-3.75h.008v.008h-.008V12zm0 3.75h.008v.008h-.008v-.008z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-5 h-5 stroke-current stroke-[1.8] text-blue-400" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'graduation':
        return (
          <svg className="w-5 h-5 stroke-current stroke-[1.8] text-blue-400" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147L12 14.625l7.74-4.478a.75.75 0 000-1.294L12 4.375 4.26 8.853a.75.75 0 000 1.294z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v4.125c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V12" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col justify-between bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm min-h-[200px]">
      {/* Cercle contenant l'icône */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full border border-neutral-200 text-neutral-800">
        {renderIcon()}
      </div>

      {/* Libellé et Valeur */}
      <div className="flex flex-col gap-1 mt-6">
        <span className="text-sm font-medium text-neutral-500">
          {label}
        </span>
        <span className="text-2xl md:text-[26px] font-bold text-neutral-900 tracking-tight">
          {value}
        </span>
      </div>
    </div>
  );
}
