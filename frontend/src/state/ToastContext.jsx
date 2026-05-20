import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let idSeq = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((toast) => {
    const id = idSeq++;
    const t = { id, kind: "info", title: "", message: "", ...toast };
    setToasts((prev) => [t, ...prev].slice(0, 4));
    window.setTimeout(() => remove(id), t.durationMs || 3200);
    return id;
  }, [remove]);

  const api = useMemo(
    () => ({
      toasts,
      push,
      remove,
      success: (message, title = "Success") => push({ kind: "success", title, message }),
      error: (message, title = "Error") => push({ kind: "error", title, message, durationMs: 4500 }),
      info: (message, title = "Info") => push({ kind: "info", title, message }),
    }),
    [toasts, push, remove]
  );

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

