import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

const ACCENT_CLASSES = ["theme-indigo", "theme-emerald", "theme-rose", "theme-amber", "theme-cyan"];

function applyAccent(accent) {
  const root = document.documentElement;
  ACCENT_CLASSES.forEach((c) => root.classList.remove(c));
  const cls = `theme-${accent}`;
  if (ACCENT_CLASSES.includes(cls)) root.classList.add(cls);
}

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

function getInitialAccent() {
  const saved = localStorage.getItem("accent");
  if (["indigo", "emerald", "rose", "amber", "cyan"].includes(saved)) return saved;
  return "indigo";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [accent, setAccent] = useState(() => getInitialAccent());

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    applyAccent(accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      accent,
      setAccent,
    }),
    [theme, accent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
