import { HelpCircle } from 'lucide-react';

function SectionTitle({ icon: Icon, title, tooltip }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
      {Icon && <Icon size={16} className="text-rose-400" />}
      <span>{title}</span>
      {tooltip && (
        <span className="relative inline-flex group">
          <button
            type="button"
            tabIndex={0}
            aria-label={`Info ${title}`}
            className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-200 focus:text-slate-200 focus:outline-none"
          >
            <HelpCircle size={14} />
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-60 -translate-x-1/2 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-normal leading-snug text-slate-200 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            {tooltip}
          </span>
        </span>
      )}
    </div>
  );
}

export default SectionTitle;
