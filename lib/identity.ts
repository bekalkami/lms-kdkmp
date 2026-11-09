// Nomor WA dipetakan ke email internal agar bisa login tanpa OTP.
export function normalizeIdentifier(raw: string): { email: string; phone: string | null } | null {
  const v = raw.trim().toLowerCase();
  if (v.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? { email: v, phone: null } : null;
  let d = v.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  if (!/^628\d{7,11}$/.test(d)) return null;
  return { email: `${d}@wa.lmskdkmp.local`, phone: d };
}
export const JABATAN = [["manajer","Manajer"],["pengurus","Pengurus"],["pengawas","Pengawas"],["staf_gerai","Staf Gerai"]] as const;
export const ROLE_LABEL: Record<string,string> = { peserta:"Peserta", fasilitator:"Fasilitator", admin_wilayah:"Admin Wilayah", admin_pusat:"Admin Pusat" };
