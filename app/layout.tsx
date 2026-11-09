import "./globals.css";
export const metadata = { title: "LMS KDKMP", description: "Pelatihan pengelola Koperasi Desa/Kelurahan Merah Putih" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="id"><body>
    <header className="bg-merah text-white"><div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-sm font-black text-merah">LMS</div>
      <b className="text-xl">LMS KDKMP</b></div></header>
    <main className="mx-auto max-w-xl px-4 py-6">{children}</main>
  </body></html>);
}
