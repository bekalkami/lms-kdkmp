"use client";
import { useState } from "react";
// Video baru dimuat saat tombol ditekan (hemat kuota). Hanya YouTube yang diizinkan.
function ytId(u: string) {
  try { const x = new URL(u);
    if (x.hostname === "youtu.be") return x.pathname.slice(1);
    if (/(^|\.)youtube\.com$/.test(x.hostname)) return x.searchParams.get("v");
  } catch {} return null;
}
export default function VideoOnDemand({ url }: { url: string }) {
  const [on, setOn] = useState(false);
  const id = ytId(url);
  if (!id) return <p className="rounded-xl bg-gray-100 p-3">Tautan video tidak valid.</p>;
  return on ? (
    <iframe className="aspect-video w-full rounded-xl" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`} title="Video pelajaran" allowFullScreen />
  ) : (
    <button onClick={() => setOn(true)} className="btn-alt">▶ Muat video (memakai kuota data)</button>
  );
}
