"use client";

import { useEffect, useState } from "react";

const BG_THEMES = [
  { id: "default", name: "Classic Pure", color: "bg-red-500" },
  { id: "ocean", name: "Oceanic Blue", color: "bg-sky-500" },
  { id: "aurora", name: "Emerald Forest", color: "bg-emerald-500" },
  { id: "twilight", name: "Twilight Violet", color: "bg-purple-500" },
  { id: "sunset", name: "Warm Sunset", color: "bg-orange-500" },
];

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [bgTheme, setBgTheme] = useState("default");
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedDark = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkActive = storedDark === "dark" || (!storedDark && prefersDark);
    setIsDark(darkActive);
    if (darkActive) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const storedBg = localStorage.getItem("bg-theme") || "default";
    setBgTheme(storedBg);
    if (storedBg !== "default") {
      document.body.setAttribute("data-bg", storedBg);
    } else {
      document.body.removeAttribute("data-bg");
    }
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const selectBg = (id: string) => {
    setBgTheme(id);
    localStorage.setItem("bg-theme", id);
    if (id !== "default") {
      document.body.setAttribute("data-bg", id);
    } else {
      document.body.removeAttribute("data-bg");
    }
    setShowPalette(false);
  };

  if (!mounted) {
    return <div className="h-8 w-20" />;
  }

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Background Palette Selector */}
      <button
        onClick={() => setShowPalette(!showPalette)}
        aria-label="Pilih varian warna background"
        className="flex items-center gap-1.5 rounded-pill border border-neutral-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur-md transition-all hover:bg-white dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-sky-400 via-emerald-400 to-rose-400" />
        <span className="hidden sm:inline">Tema BG</span>
      </button>

      {/* Palette Dropdown Popover */}
      {showPalette && (
        <div className="absolute right-0 top-11 z-50 w-48 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/90 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Varian Warna Suasana
          </div>
          <div className="mt-1 space-y-1">
            {BG_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => selectBg(t.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
                  bgTheme === t.id
                    ? "bg-apple-blue text-white"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/80"
                }`}
              >
                <span className={`h-3 w-3 rounded-full ${t.color}`} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dark / Light Toggle */}
      <button
        onClick={toggleDark}
        aria-label="Toggle Dark Mode"
        className="grid h-8 w-8 place-items-center rounded-pill border border-neutral-200/80 bg-white/70 text-sm shadow-sm backdrop-blur-md transition-transform hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-neutral-800/70"
      >
        {isDark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
