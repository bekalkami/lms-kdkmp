"use client";

import { useState } from "react";
import Link from "next/link";

interface AssistantMessage {
  sender: "sora" | "shiro" | "user";
  text: string;
}

const FAQ_PROMPTS = [
  {
    q: "Apa itu LMS KDKMP?",
    replySora: "LMS KDKMP adalah portal resmi pelatihan bagi seluruh jajaran Koperasi Desa & Kelurahan Merah Putih. Target kita adalah menciptakan tata kelola koperasi yang tangguh dan mandiri!",
    replyShiro: "...Peluang kelulusan peserta yang menyelesaikan seluruh modul: 99.8%. Kurikulum terbagi menurut tupoksi masing-masing jabatan.",
  },
  {
    q: "Bagaimana cara dapat sertifikat?",
    replySora: "Gampang banget! Pelajari semua materi di katalog kursus, lalu ikuti kuis dan ujian kelulusannya. Begitu nilai memenuhi standar kelulusan, sertifikat resmi langsung terbit!",
    replyShiro: "...Sertifikat digital dilengkapi QR verifikasi kriptografis. Dapat divalidasi langsung melalui halaman /verifikasi.",
  },
  {
    q: "Apa bedanya akun Peserta dan Admin?",
    replySora: "Peserta fokus belajar modul jabatan dan mengumpulkan sertifikat. Sedangkan Admin Wilayah atau Admin Pusat punya dashboard khusus untuk monitor laporan dan impor data peserta!",
    replyShiro: "...Hak akses dikontrol ketat oleh Row Level Security (RLS) Supabase berdasarkan kolom role di profil.",
  },
  {
    q: "Bagaimana tips lulus ujian kuis?",
    replySora: "Jangan buru-buru! Baca modul dan catat poin penting tentang SOP operasional gerai, kasir, dan pengawasan stok.",
    replyShiro: "...Kalkulasi kami: peserta yang membaca lembar kerja sebelum kuis memiliki probabilitas kelulusan 100%.",
  },
];

export default function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"both" | "sora" | "shiro">("both");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      sender: "sora",
      text: "Yo! Aku Sora, asisten strategi belajarmu di LMS KDKMP. Siap menaklukkan semua modul pelatihan hari ini?",
    },
    {
      sender: "shiro",
      text: "...Nn. Shiro di sini. Shiro akan memandu kalkulasi ujian, materi teknis, dan verifikasi sertifikatmu.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  const handleAsk = (q: string, replySora: string, replyShiro: string) => {
    const newMsgs: AssistantMessage[] = [...messages, { sender: "user", text: q }];
    if (activeTab === "both" || activeTab === "sora") {
      newMsgs.push({ sender: "sora", text: replySora });
    }
    if (activeTab === "both" || activeTab === "shiro") {
      newMsgs.push({ sender: "shiro", text: replyShiro });
    }
    setMessages(newMsgs);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const txt = inputVal.trim();
    setInputVal("");

    const newMsgs: AssistantMessage[] = [...messages, { sender: "user", text: txt }];

    // Smart reactive responder based on keywords
    const lower = txt.toLowerCase();
    if (lower.includes("sertifikat") || lower.includes("lulus")) {
      newMsgs.push({
        sender: "sora",
        text: "Semua sertifikat kelulusan bisa dicek langsung di menu 'Sertifikat Saya' setelah kamu lulus ujian modul!",
      });
      newMsgs.push({
        sender: "shiro",
        text: "...Status sertifikat terikat nomor registrasi unik. Validitas 100%.",
      });
    } else if (lower.includes("kursus") || lower.includes("materi") || lower.includes("belajar")) {
      newMsgs.push({
        sender: "sora",
        text: "Katalog kursus sudah disusun sesuai jabatanmu di koperasi desa. Mulai dari Modul 1 ya!",
      });
      newMsgs.push({
        sender: "shiro",
        text: "...Selesaikan video dan kuis interaktif secara berurutan agar persentase progres tercatat di server.",
      });
    } else if (lower.includes("halo") || lower.includes("hai") || lower.includes("siapa")) {
      newMsgs.push({
        sender: "sora",
        text: "Halo! Kami berdua adalah tim asisten virtual 『　　』 (Kuuhaku) yang mendampingi belajarmu di KDKMP!",
      });
      newMsgs.push({
        sender: "shiro",
        text: "...Kalkulasi menunjukkan kamu siap memulai pelajaran hari ini. Ada yang ingin ditanyakan...?",
      });
    } else {
      newMsgs.push({
        sender: "sora",
        text: `Pertanyaan bagus! Untuk topik "${txt}", pastikan kamu memeriksa panduan lengkap di katalog kursus atau hubungi fasilitator wilayahmu ya.`,
      });
      newMsgs.push({
        sender: "shiro",
        text: `...Data terkait "${txt}" dapat diakses melalui Dasbor Peserta atau modul kurikulum terkait.`,
      });
    }

    setMessages(newMsgs);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Buka Asisten Virtual Sora & Shiro"
            className="group relative flex items-center gap-3 border-2 border-neutral-900 bg-white p-2.5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#C8102E] dark:border-neutral-200 dark:bg-neutral-900 dark:shadow-[4px_4px_0px_0px_#fff]"
          >
            {/* Avatars */}
            <div className="flex -space-x-2">
              <div className="grid h-9 w-9 place-items-center border-2 border-neutral-900 bg-amber-500 text-xs font-black text-white dark:border-white">
                空
              </div>
              <div className="grid h-9 w-9 place-items-center border-2 border-neutral-900 bg-indigo-600 text-xs font-black text-white dark:border-white">
                白
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-left pr-2">
              <span className="font-bebas text-base uppercase tracking-wider text-neutral-900 dark:text-white leading-tight">
                Sora & Shiro
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-merah">
                Asisten Virtual
              </span>
            </div>
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-merah opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-merah" />
            </span>
          </button>
        )}

        {/* Modal / Panel */}
        {isOpen && (
          <div className="flex w-[90vw] max-w-md flex-col border-2 border-neutral-900 bg-white shadow-[8px_8px_0px_0px_#000] dark:border-neutral-200 dark:bg-neutral-950 dark:shadow-[8px_8px_0px_0px_#fff] transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-neutral-900 bg-neutral-100 p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <span className="grid h-7 w-7 place-items-center border border-neutral-900 bg-amber-500 text-[10px] font-black text-white">
                    SORA
                  </span>
                  <span className="grid h-7 w-7 place-items-center border border-neutral-900 bg-indigo-600 text-[10px] font-black text-white">
                    SHIRO
                  </span>
                </div>
                <div>
                  <h3 className="font-bebas text-lg uppercase tracking-wider text-neutral-900 dark:text-white leading-none">
                    Asisten Virtual KDKMP
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    ● Siap Membantu
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="grid h-7 w-7 place-items-center border border-neutral-900 bg-white font-mono text-xs font-bold hover:bg-merah hover:text-white dark:border-neutral-700 dark:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            {/* Character Selector Filter */}
            <div className="flex border-b-2 border-neutral-200 text-xs font-bebas uppercase tracking-wider dark:border-neutral-800">
              <button
                onClick={() => setActiveTab("both")}
                className={`flex-1 py-1.5 text-center transition-colors ${
                  activeTab === "both"
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                Duet (Sora & Shiro)
              </button>
              <button
                onClick={() => setActiveTab("sora")}
                className={`flex-1 py-1.5 text-center transition-colors ${
                  activeTab === "sora"
                    ? "bg-amber-500 text-white"
                    : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                Sora (Motivasi & Alur)
              </button>
              <button
                onClick={() => setActiveTab("shiro")}
                className={`flex-1 py-1.5 text-center transition-colors ${
                  activeTab === "shiro"
                    ? "bg-indigo-600 text-white"
                    : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                Shiro (Data & Logika)
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex max-h-80 min-h-[240px] flex-col gap-3 overflow-y-auto p-4 text-sm">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {m.sender === "sora" && (
                      <span className="border border-amber-600 bg-amber-500 px-1 text-[9px] font-black uppercase text-white tracking-wider">
                        SORA
                      </span>
                    )}
                    {m.sender === "shiro" && (
                      <span className="border border-indigo-700 bg-indigo-600 px-1 text-[9px] font-black uppercase text-white tracking-wider">
                        SHIRO
                      </span>
                    )}
                    {m.sender === "user" && (
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">
                        Peserta
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] border-2 p-2.5 text-xs leading-relaxed ${
                      m.sender === "sora"
                        ? "border-amber-500 bg-amber-50/70 text-amber-950 dark:bg-amber-950/30 dark:text-amber-200"
                        : m.sender === "shiro"
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-200"
                        : "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestions / FAQ */}
            <div className="border-t border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Pilih Pertanyaan Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FAQ_PROMPTS.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(f.q, f.replySora, f.replyShiro)}
                    className="border border-neutral-300 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:border-merah hover:text-merah dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-merah"
                  >
                    {f.q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleCustomSend}
              className="flex border-t-2 border-neutral-900 dark:border-neutral-800"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Tanya Sora atau Shiro seputar KDKMP..."
                className="flex-1 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none dark:bg-neutral-950 dark:text-white"
              />
              <button
                type="submit"
                className="border-l-2 border-neutral-900 bg-merah px-4 font-bebas text-sm uppercase tracking-wider text-white hover:bg-merah-tua dark:border-neutral-800"
              >
                Kirim
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
