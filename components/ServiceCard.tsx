import { Card } from "./Card";
import { Icon, type IconName } from "./Icon";

interface ServiceCardProps {
  title: string;
  blurb: string;
  points: string[];
  icon: IconName;
}

/** Service overview card with icon, blurb and a short feature checklist. */
export function ServiceCard({ title, blurb, points, icon }: ServiceCardProps) {
  return (
    <Card interactive className="flex h-full flex-col">
      <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent-600">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="text-xl font-bold text-navy">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{blurb}</p>
      <ul className="mt-5 space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-sm text-navy">
            <Icon name="check" size={16} className="shrink-0 text-accent" />
            {point}
          </li>
        ))}
      </ul>
    </Card>
  );
}
