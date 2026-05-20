import { useToast } from "../state/ToastContext.jsx";

const styles = {
  info: "bg-white ring-slate-200 text-slate-900 dark:bg-slate-900/70 dark:text-white dark:ring-white/10",
  success: "bg-emerald-500/10 ring-emerald-600/20 text-emerald-800 dark:text-emerald-200",
  error: "bg-rose-500/10 ring-rose-600/20 text-rose-800 dark:text-rose-200",
};

export function Toasts() {
  const { toasts, remove } = useToast();
  return (
    <div className="pointer-events-none fixed right-4 top-16 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto card animate-scale-in p-3 ring-1 ${styles[t.kind] || styles.info}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{t.title}</div>
              <div className="mt-0.5 text-sm opacity-90">{t.message}</div>
            </div>
            <button className="btn-secondary px-2 py-1 text-xs" onClick={() => remove(t.id)}>
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

