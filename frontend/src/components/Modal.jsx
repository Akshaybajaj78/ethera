import { useEffect } from "react";

export function Modal({ open, title, description, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm dark:bg-slate-950/60"
        onMouseDown={onClose}
      />
      <div className="absolute inset-0 overflow-auto p-4">
        <div className="mx-auto mt-10 w-full max-w-2xl animate-scale-in">
          <div className="card overflow-hidden">
            <div className="border-b border-slate-200 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{title}</div>
                  {description ? <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</div> : null}
                </div>
                <button className="btn-secondary px-3" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
            <div className="p-5">{children}</div>
            {footer ? <div className="border-t border-slate-200 p-4 dark:border-white/10">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

