"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function PollBayar({ id }: { id: string }) {
  const router = useRouter();
  useEffect(() => {
    let stop = false;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/pesanan/${id}`, { cache: "no-store" });
        const j = await r.json();
        if (!stop && j.status && j.status !== "pending") { stop = true; clearInterval(t); router.refresh(); }
      } catch {}
    }, 5000);
    return () => { stop = true; clearInterval(t); };
  }, [id, router]);
  return <p className="text-center text-sm text-gray-500">Menunggu pembayaran… halaman ini berubah otomatis setelah lunas.</p>;
}
