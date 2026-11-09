"use client";
import { useFormState, useFormStatus } from "react-dom";
import { imporPeserta, type State } from "@/app/admin/peserta/impor/actions";
import { toCsv } from "@/lib/csv";
function Kirim() { const { pending } = useFormStatus(); return <button disabled={pending} className="btn disabled:opacity-60">{pending ? "Memproses… jangan tutup halaman" : "Unggah dan buat akun"}</button>; }
export default function ImporForm() {
  const [st, act] = useFormState<State, FormData>(imporPeserta, null);
  const unduh = () => { // dibuat di browser; kata sandi tidak disimpan di server
    const blob = new Blob([toCsv([["Baris", "Nama", "No WA/Email", "Status", "Keterangan", "Kata sandi awal"], ...st!.hasil!.map((h) => [h.baris, h.nama, h.identitas, h.status, h.pesan, h.sandi ?? ""])])], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "hasil-impor-peserta.csv"; a.click(); URL.revokeObjectURL(a.href); };
  const ok = st?.hasil?.filter((h) => h.status === "ok").length ?? 0;
  return (<div className="space-y-4">
    <form action={act} className="space-y-3"><input type="file" name="berkas" accept=".csv,text/csv" required className="input" /><Kirim /></form>
    {st?.error && <p role="alert" className="rounded-xl bg-merah-muda p-3 font-semibold text-merah-tua">{st.error}</p>}
    {st?.hasil && (<div className="space-y-3">
      <p className="rounded-xl bg-merah-muda p-3 font-bold">{ok} akun dibuat, {st.hasil.length - ok} gagal.</p>
      {ok > 0 && <><button onClick={unduh} className="btn-alt">⬇ Unduh hasil + kata sandi awal (CSV)</button>
        <p className="text-base font-semibold text-merah-tua">Kata sandi awal hanya muncul sekarang dan tidak disimpan. Bagikan lewat saluran aman, dan minta peserta menggantinya lewat menu “Ganti kata sandi”.</p></>}
      <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-base"><thead><tr className="border-b-2 border-merah"><th className="py-2">Baris</th><th>Nama</th><th>Status</th><th>Sandi awal</th></tr></thead>
        <tbody>{st.hasil.map((h) => (<tr key={h.baris} className="border-b"><td className="py-2">{h.baris}</td><td>{h.nama}<span className="block text-sm text-gray-500">{h.identitas}</span></td>
          <td className={h.status === "ok" ? "font-bold text-green-700" : "font-bold text-merah"}>{h.status === "ok" ? "✅" : "❌"} {h.pesan}</td><td className="font-mono">{h.sandi ?? ""}</td></tr>))}</tbody></table></div></div>)}
  </div>);
}
