"use client";

import { useState } from "react";
import { SoraPixel, ShiroPixel } from "./PixelCharacters";

interface AssistantMessage {
  sender: "sora" | "shiro" | "user";
  text: string;
}

const QUICK_TIPS = [
  {
    title: "Sertifikasi",
    sora: "Selesaikan semua pelajaran dan lewati kuis modul sampai nilai di atas KKM!",
    shiro: "...Sertifikat diterbitkan secara otomatis dengan QR verifikasi resmi.",
  },
  {
    title: "Alur Kursus",
    sora: "Ikuti jalur belajar yang sudah dikhususkan sesuai tupoksi jabatanmu di koperasi desa.",
    shiro: "...Kalkulasi menunjukkan belajar 1 modul per hari memaksimalkan pemahaman 98.4%.",
  },
  {
    title: "Ujian & Kuis",
    sora: "Tenang saja saat mengerjakan! Baca soal dengan cermat dan pahami studi kasus kasir/stok.",
    shiro: "...Setiap soal kuis memiliki penjelasan pembahasan yang bisa dipelajari ulang.",
  },
];

export default function CompanionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"both" | "sora" | "shiro">("both");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      sender: "sora",
      text: "Yo! Kami siap menemani belajarmu di LMS KDKMP. Butuh panduan materi atau tips kuis hari ini?",
    },
    {
      sender: "shiro",
      text: "...Nn. Shiro standby memantau progres dan kalkulasi modul belajarmu.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  const sendQuick = (title: string, sora: string, shiro: string) => {
    const next: AssistantMessage[] = [...messages, { sender: "user", text: `Info seputar ${title}` }];
    if (activeTab === "both" || activeTab === "sora") next.push({ sender: "sora", text: sora });
    if (activeTab === "both" || activeTab === "shiro") next.push({ sender: "shiro", text: shiro });
    setMessages(next);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const txt = inputVal.trim();
    setInputVal("");

    const next: AssistantMessage[] = [...messages, { sender: "user", text: txt }];
    const lower = txt.toLowerCase();

    if (lower.includes("sertifikat") || lower.includes("lulus")) {
      next.push({ sender: "sora", text: "Semua sertifikat kelulusan bisa dicek langsung di menu 'Sertifikat Saya' setelah kamu lulus ujian modul!" });
      next.push({ sender: "shiro", text: "...Validitas sertifikat 100% terlindungi tanda tangan digital." });
    } else if (lower.includes("modul") || lower.includes("kursus") || lower.includes("belajar")) {
      next.push({ sender: "sora", text: "Modul pelatihan sudah disusun sesuai SOP kerja gerai koperasi desa. Cek katalog kursus ya!" });
      next.push({ sender: "shiro", text: "...Selesaikan video dan unduh lembar kerja untuk latihan praktis." });
    } else {
      next.push({ sender: "sora", text: `Pertanyaan bagus! Untuk "${txt}", pastikan kamu memeriksa panduan lengkap di katalog kursus.` });
      next.push({ sender: "shiro", text: `...Data terkait "${txt}" dapat kamu pelajari di modul terkait.` });
    }
    setMessages(next);
  };

  return (
    <>
      {/* Small 8-bit Screen Buddy Pill (Always On Screen at bottom right) */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Teman Belajar 8-bit Sora & Shiro"
            className="group flex items-center gap-2.5 rounded-pill border border-white/70 bg-white/80 px-3.5 py-2 shadow-[0_8px_25px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white dark:border-white/15 dark:bg-neutral-900/80 dark:shadow-[0_8px_25px_rgba(0,0,0,0.6)] dark:hover:bg-neutral-900"
          >
            {/* 8-bit Mini Sprite Avatars */}
            <div className="flex items-center -space-x-1.5 transition-transform group-hover:-translate-y-0.5">
              <div className="rounded-full bg-amber-100 p-0.5 dark:bg-amber-950/50">
                <SoraPixel size={24} />
              </div>
              <div className="rounded-full bg-indigo-100 p-0.5 dark:bg-indigo-950/50">
                <ShiroPixel size={24} />
              </div>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                Sora & Shiro
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Assistant 8-bit
              </span>
            </div>
          </button>
        )}

        {/* Floating Glass Chat Dialog */}
        {isOpen && (
          <div className="flex w-[90vw] max-w-sm flex-col rounded-glass border border-white/60 bg-white/85 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200/60 p-3.5 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center -space-x-1.5">
                  <div className="rounded-full bg-amber-100 p-0.5 dark:bg-amber-950/50">
                    <SoraPixel size={26} />
                  </div>
                  <div className="rounded-full bg-indigo-100 p-0.5 dark:bg-indigo-950/50">
                    <ShiroPixel size={26} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    Teman Belajar 『　　』
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Sora & Shiro Asisten Virtual
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-xs text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                ✕
              </button>
            </div>

            {/* Character Persona Switcher Pills */}
            <div className="flex gap-1.5 p-2 bg-neutral-100/50 dark:bg-neutral-950/40 text-[11px] font-semibold border-b border-neutral-200/40 dark:border-white/5">
              <button
                onClick={() => setActiveTab("both")}
                className={`flex-1 py-1 rounded-pill transition-all ${
                  activeTab === "both"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Duet
              </button>
              <button
                onClick={() => setActiveTab("sora")}
                className={`flex-1 py-1 rounded-pill transition-all ${
                  activeTab === "sora"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-neutral-500 hover:text-amber-600"
                }`}
              >
                Sora
              </button>
              <button
                onClick={() => setActiveTab("shiro")}
                className={`flex-1 py-1 rounded-pill transition-all ${
                  activeTab === "shiro"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-indigo-400"
                }`}
              >
                Shiro
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex max-h-72 min-h-[220px] flex-col gap-3 overflow-y-auto p-3.5 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {m.sender === "sora" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        <SoraPixel size={14} /> SORA
                      </span>
                    )}
                    {m.sender === "shiro" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                        <ShiroPixel size={14} /> SHIRO
                      </span>
                    )}
                    {m.sender === "user" && (
                      <span className="text-[10px] font-semibold text-neutral-400">
                        Anda
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[88%] rounded-2xl p-2.5 leading-relaxed shadow-sm ${
                      m.sender === "sora"
                        ? "bg-amber-50/90 text-amber-950 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/40"
                        : m.sender === "shiro"
                        ? "bg-indigo-50/90 text-indigo-950 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800/40"
                        : "bg-apple-blue text-white rounded-br-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Fast Question Pills */}
            <div className="border-t border-neutral-200/60 bg-white/40 p-2 dark:border-white/10 dark:bg-neutral-900/40">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TIPS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendQuick(q.title, q.sora, q.shiro)}
                    className="rounded-pill border border-neutral-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:border-apple-blue hover:text-apple-blue dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-300"
                  >
                    💡 {q.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-neutral-200/60 p-2 dark:border-white/10"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Tanya Sora atau Shiro..."
                className="flex-1 rounded-pill border border-neutral-200 bg-white/90 px-3.5 py-1.5 text-xs text-neutral-900 focus:border-apple-blue focus:outline-none dark:border-white/10 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                className="grid h-8 w-8 place-items-center rounded-full bg-apple-blue text-xs font-bold text-white shadow-sm hover:bg-apple-hover transition-transform active:scale-95"
              >
                ↑
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
