import KeyDateCard, { IconType } from './KeyDateCard';

interface DateItem {
  id: string;
  iconType: IconType;
  label: string;
  value: string;
}

const keyDatesData: DateItem[] = [
  {
    id: '1',
    iconType: 'calendar',
    label: 'Start Date',
    value: '12 October 2026',
  },
  {
    id: '2',
    iconType: 'clock',
    label: 'Duration',
    value: '8 Weeks · Part-time',
  },
  {
    id: '3',
    iconType: 'graduation',
    label: 'Defense & Graduation',
    value: '6 December 2026',
  },
];

export default function KeyDatesSection() {
  return (
    <section className="w-full bg-[#f3f3f3] py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        {/* En-tête de la section */}
        <div className="flex flex-col gap-2">
          <span className="text-xs md:text-sm font-semibold tracking-widest text-neutral-500 uppercase">
            MARK YOUR CALENDAR
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
            Key dates
          </h2>
        </div>

        {/* Grille des Cartes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:px-12 ">
          {keyDatesData.map((item) => (
            <KeyDateCard
              key={item.id}
              iconType={item.iconType}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
