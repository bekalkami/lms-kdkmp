import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import RoamingCompanion from "@/components/RoamingCompanion";
import { SoraPixel, ShiroPixel } from "@/components/PixelCharacters";


const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "LMS KDKMP · Koperasi Merah Putih",
  description: "Platform Pelatihan & Sertifikasi Digital Pengelola Koperasi Desa/Kelurahan Merah Putih",
};

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                var bg = localStorage.getItem('bg-theme');
                if (bg && bg !== 'default') {
                  document.body.setAttribute('data-bg', bg);
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans selection:bg-merah selection:text-white">
        {/* Floating Glassmorphism Navbar */}
        <header className="sticky top-4 z-40 mx-auto w-full max-w-4xl px-4">
          <nav className="glass-nav flex items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-merah to-merah-tua text-xs font-black text-white shadow-sm transition-transform group-hover:scale-105">
                K
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                  LMS KDKMP
                </span>
                <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Koperasi Merah Putih
                </span>
              </div>
            </Link>

            {/* Middle: 8-bit Mini Companion Pill in Nav */}
            <div className="hidden sm:flex items-center gap-2 rounded-pill bg-white/50 px-3 py-1 border border-black/5 dark:bg-white/5 dark:border-white/5">
              <div className="flex -space-x-1">
                <SoraPixel size={18} />
                <ShiroPixel size={18} />
              </div>
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                Sora & Shiro Active
              </span>
            </div>

            {/* Right: Theme & Color Palette Switcher */}
            <ThemeSwitcher />
          </nav>
        </header>

        {/* Main Workspace */}
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>

        {/* 8-bit Interactive Roaming Assistant (Walks & wanders autonomously across screen) */}
        <RoamingCompanion />

        {/* Apple-styled Glass Footer */}

        <footer className="mt-auto border-t border-black/5 bg-white/40 py-8 text-xs text-neutral-500 backdrop-blur-md dark:border-white/5 dark:bg-black/40 dark:text-neutral-400">
          <div className="mx-auto flex max-w-4xl flex-col sm:flex-row items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                © {new Date().getFullYear()} LMS KDKMP · Portal Pembelajaran Resmi Koperasi Desa
              </span>
            </div>
            <div className="flex items-center gap-4 font-medium">
              <Link href="/verifikasi" className="hover:text-apple-blue transition-colors">
                Verifikasi Sertifikat
              </Link>
              <span>·</span>
              <Link href="/kursus" className="hover:text-apple-blue transition-colors">
                Katalog Kursus
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}


