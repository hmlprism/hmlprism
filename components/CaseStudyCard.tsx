import { Icon, type IconName } from "./Icon";

interface CaseStudyCardProps {
  name: string;
  url: string;
  domain: string;
  category: string;
  blurb: string;
  tags: string[];
  icon: IconName;
}

/** Portfolio / case-study card with a faux browser header and a live-site link. */
export function CaseStudyCard({
  name,
  url,
  domain,
  category,
  blurb,
  tags,
  icon,
}: CaseStudyCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
    >
      {/* Faux browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </span>
        <span className="ml-2 truncate rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
          {domain}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-600">
            <Icon name={icon} size={22} />
          </span>
          <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-500">
            {category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-navy">{name}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{blurb}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 transition-colors group-hover:text-accent">
          Visit live site
          <Icon
            name="external"
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </a>
  );
}
