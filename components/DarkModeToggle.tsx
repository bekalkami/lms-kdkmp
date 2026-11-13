"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex h-9 items-center gap-1.5 border-2 border-current px-2.5 text-xs font-bold uppercase tracking-wider transition-transform active:scale-95"
    >
      {theme === "dark" ? (
        <>
          <span className="text-amber-400">☀️</span>
          <span>LIGHT</span>
        </>
      ) : (
        <>
          <span className="text-neutral-900">🌙</span>
          <span>DARK</span>
        </>
      )}
    </button>
  );
}
