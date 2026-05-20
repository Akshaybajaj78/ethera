export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600/10 text-brand-700 ring-1 ring-brand-600/20 dark:text-brand-200">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="mt-4 text-base font-semibold">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</div> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

