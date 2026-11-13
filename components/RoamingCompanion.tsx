"use client";

import { useEffect, useRef, useState } from "react";
import { SoraPixel, ShiroPixel } from "./PixelCharacters";

interface AssistantMessage {
  sender: "sora" | "shiro" | "user";
  text: string;
}

const DIALOG_POOL = {
  sora: [
    "Ayo fokus! Satu modul sehari bikin kamu jadi manajer pro!",
    "SOP kasir dan stok gudang itu gampang kalau udah paham polanya.",
    "Jangan lupa unduh lembar kerja buat latihan praktis ya!",
    "Kuisnya santai aja, baca soalnya teliti sampai tuntas!",
    "KDKMP maju berawal dari pengelola yang terlatih!",
  ],
  shiro: [
    "...Probabilitas kelulusan meningkat 98.4% jika modul selesai.",
    "...Kalkulasi sistem: data sertifikat tersinkronisasi sempurna.",
    "...Shiro sedang mengawasi kestabilan server dan kuis.",
    "...Jika ada materi yang sulit, klik Shiro untuk panduan.",
    "...Status belajar: optimal. Lanjutkan belajarmu, Senpai.",
  ],
};

export default function RoamingCompanion() {
  // Sora position & state
  const [soraPos, setSoraPos] = useState({ x: 80, y: 120 });
  const [soraDir, setSoraDir] = useState<"left" | "right">("right");
  const [soraAction, setSoraAction] = useState<"walk" | "idle" | "jump">("walk");

  // Shiro position & state (follows or wanders close to Sora)
  const [shiroPos, setShiroPos] = useState({ x: 30, y: 120 });
  const [shiroDir, setShiroDir] = useState<"left" | "right">("right");
  const [shiroAction, setShiroAction] = useState<"walk" | "idle" | "sit">("walk");

  // Speech bubble above characters
  const [bubble, setBubble] = useState<{ sender: "sora" | "shiro"; text: string } | null>({
    sender: "sora",
    text: "Halo! Kami teman belajarmu di KDKMP!",
  });

  // Chat Modal Dialog state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"both" | "sora" | "shiro">("both");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      sender: "sora",
      text: "Yo! Aku Sora, asisten strategi belajarmu di LMS KDKMP. Butuh panduan materi atau tips kuis hari ini?",
    },
    {
      sender: "shiro",
      text: "...Nn. Shiro standby mengawasi progres modul dan kalkulasi kelulusanmu.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  // Target wandering coordinates
  const soraTarget = useRef({ x: 150, y: 120 });
  const isPaused = useRef(false);

  // Autonomous walking loop
  useEffect(() => {
    // Pick random destination along the bottom of the viewport
    const pickNewDestination = () => {
      if (typeof window === "undefined" || isPaused.current) return;
      const marginX = 60;
      const maxX = Math.max(200, window.innerWidth - marginX - 100);
      const newX = Math.floor(Math.random() * (maxX - marginX)) + marginX;
      // keep y bounded near the bottom (40px to 90px from bottom)
      const newY = Math.floor(Math.random() * 50) + 40;

      soraTarget.current = { x: newX, y: newY };
      setSoraAction("walk");
      setShiroAction("walk");

      // Random chatter chance (35%)
      if (Math.random() < 0.35) {
        const who = Math.random() < 0.5 ? "sora" : "shiro";
        const pool = DIALOG_POOL[who];
        const phrase = pool[Math.floor(Math.random() * pool.length)];
        setBubble({ sender: who, text: phrase });
        setTimeout(() => setBubble(null), 5000);
      }
    };

    const destTimer = setInterval(pickNewDestination, 6000);
    pickNewDestination();

    // Movement frame loop
    const moveTimer = setInterval(() => {
      if (isPaused.current) return;

      setSoraPos((curr) => {
        const dx = soraTarget.current.x - curr.x;
        const dy = soraTarget.current.y - curr.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 4) {
          setSoraAction("idle");
          return curr;
        }

        const speed = 2.2;
        const nextX = curr.x + (dx / dist) * speed;
        const nextY = curr.y + (dy / dist) * speed;

        setSoraDir(dx >= 0 ? "right" : "left");
        return { x: nextX, y: nextY };
      });

      // Shiro softly follows Sora with a slight delay and offset (-35px)
      setShiroPos((curr) => {
        setSoraPos((sora) => {
          const targetX = soraDir === "right" ? sora.x - 38 : sora.x + 38;
          const targetY = sora.y + 2;
          const dx = targetX - curr.x;
          const dy = targetY - curr.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 4) {
            setShiroAction("idle");
            return curr;
          }

          const speed = 2.0;
          const nextX = curr.x + (dx / dist) * speed;
          const nextY = curr.y + (dy / dist) * speed;

          setShiroDir(dx >= 0 ? "right" : "left");
          return { x: nextX, y: nextY };
        });
        return curr;
      });
    }, 30);

    return () => {
      clearInterval(destTimer);
      clearInterval(moveTimer);
    };
  }, [soraDir]);

  const handleCharacterClick = (char: "sora" | "shiro") => {
    isPaused.current = true;
    setSoraAction("jump");
    setShiroAction("sit");
    setIsChatOpen(true);
    setActiveTab(char);
    setTimeout(() => {
      isPaused.current = false;
    }, 1000);
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
      next.push({ sender: "shiro", text: "...Validitas sertifikat 100% terlindungi tanda tangan digital QR." });
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
      {/* Roaming Interactive 8-bit Characters Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        style={{ zIndex: 999 }}
      >
        {/* Speech Bubble when chatting / idle thought */}
        {bubble && !isChatOpen && (
          <div
            className="pointer-events-auto absolute transition-all duration-300 animate-in fade-in zoom-in-90"
            style={{
              left: `${Math.min(soraPos.x, shiroPos.x) - 10}px`,
              bottom: `${Math.max(soraPos.y, shiroPos.y) + 48}px`,
              maxWidth: "220px",
            }}
          >
            <div className="relative rounded-2xl border border-neutral-800/80 bg-neutral-900/90 px-3 py-1.5 text-[11px] font-medium text-white shadow-xl backdrop-blur-md dark:border-white/20 dark:bg-black/90">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-400">
                {bubble.sender === "sora" ? "Sora" : "Shiro"}:
              </span>
              <span>{bubble.text}</span>
              {/* Little speech tail */}
              <div className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-neutral-800 bg-neutral-900 dark:border-white/20 dark:bg-black" />
            </div>
          </div>
        )}

        {/* Sora Interactive Sprite */}
        <div
          onClick={() => handleCharacterClick("sora")}
          onMouseEnter={() => {
            isPaused.current = true;
            setSoraAction("jump");
          }}
          onMouseLeave={() => {
            isPaused.current = false;
            setSoraAction("walk");
          }}
          className="pointer-events-auto absolute cursor-pointer select-none transition-transform duration-150 hover:scale-125"
          style={{
            left: `${soraPos.x}px`,
            bottom: `${soraPos.y}px`,
            transform: `scaleX(${soraDir === "left" ? -1 : 1})`,
          }}
          title="Klik Sora untuk ngobrol!"
        >
          <div className={`${soraAction === "walk" ? "animate-bounce" : ""}`}>
            <SoraPixel size={36} />
          </div>
        </div>

        {/* Shiro Interactive Sprite */}
        <div
          onClick={() => handleCharacterClick("shiro")}
          onMouseEnter={() => {
            isPaused.current = true;
            setShiroAction("sit");
          }}
          onMouseLeave={() => {
            isPaused.current = false;
            setShiroAction("walk");
          }}
          className="pointer-events-auto absolute cursor-pointer select-none transition-transform duration-150 hover:scale-125"
          style={{
            left: `${shiroPos.x}px`,
            bottom: `${shiroPos.y}px`,
            transform: `scaleX(${shiroDir === "left" ? -1 : 1})`,
          }}
          title="Klik Shiro untuk tanya materi!"
        >
          <div className={`${shiroAction === "walk" ? "animate-bounce" : ""}`}>
            <ShiroPixel size={34} />
          </div>
        </div>
      </div>

      {/* Floating Chat Panel when Clicked on Character */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[92vw] max-w-sm flex-col rounded-glass border border-white/60 bg-white/85 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200">
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
              onClick={() => setIsChatOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-xs text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              ✕
            </button>
          </div>

          {/* Character Filter Pills */}
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

          {/* Chat Messages */}
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
    </>
  );
}
