import "./globals.css";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";
import VirtualAssistant from "@/components/VirtualAssistant";

const bebas = Bebas_Neue({

  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "LMS KDKMP · Merah Putih",
  description: "Platform Pelatihan & Sertifikasi Pengelola Koperasi Desa/Kelurahan Merah Putih",
};

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${bebas.variable} ${jakarta.variable}`}>
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
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-merah selection:text-white">
        <header className="sticky top-0 z-50 border-b-2 border-neutral-900 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="grid h-9 w-9 place-items-center border-2 border-neutral-900 bg-merah text-base font-bebas tracking-wider text-white transition-transform group-hover:-translate-y-0.5 dark:border-white">
                KDKMP
              </div>
              <div className="flex flex-col">
                <span className="font-bebas text-2xl leading-none tracking-wide text-neutral-900 dark:text-white">
                  LMS KDKMP
                </span>
                <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
                  Koperasi Merah Putih
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <DarkModeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>

        <VirtualAssistant />

        <footer className="border-t-2 border-neutral-200 bg-white py-6 dark:border-neutral-800 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 text-xs">

          <div className="mx-auto flex max-w-4xl flex-col sm:flex-row items-center justify-between gap-4 px-4">
            <p className="font-medium">
              © {new Date().getFullYear()} LMS KDKMP · Portal Resmi Pelatihan Koperasi Desa
            </p>
            <div className="flex items-center gap-4 font-semibold">
              <Link href="/verifikasi" className="hover:text-merah transition-colors">
                Verifikasi Sertifikat
              </Link>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Sistem Aktif
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

