"use client";

import React, { useState } from "react";

// Inline text renderer for bold, italic, and code snippets
function renderInline(text: string): React.ReactNode[] {
  // Regex to match **bold**, *italic*, and `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={i}
          className="font-bold text-neutral-900 dark:text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em
          key={i}
          className="italic text-neutral-700 dark:text-neutral-300"
        >
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-md bg-neutral-200/60 dark:bg-white/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-apple-blue"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Section categories for specialized styling
type SectionType =
  | "warning"
  | "summary"
  | "objective"
  | "policy"
  | "example"
  | "steps"
  | "default";

function getSectionType(heading: string): { type: SectionType; badge: string; icon: string } {
  const lower = heading.toLowerCase();
  if (
    lower.includes("catatan") ||
    lower.includes("ingat") ||
    lower.includes("perlu diingat") ||
    lower.includes("waspada") ||
    lower.includes("hindari") ||
    lower.includes("perhatian")
  ) {
    return { type: "warning", badge: "PENTING & PERHATIAN", icon: "📌" };
  }
  if (
    lower.includes("kesimpulan") ||
    lower.includes("ringkasan") ||
    lower.includes("poin penting") ||
    lower.includes("takeaway")
  ) {
    return { type: "summary", badge: "RINGKASAN & INTI PEMBELAJARAN", icon: "💡" };
  }
  if (lower.includes("tujuan") || lower.includes("sasaran") || lower.includes("target")) {
    return { type: "objective", badge: "TARGET KOMPETENSI", icon: "🎯" };
  }
  if (
    lower.includes("dasar kebijakan") ||
    lower.includes("legalitas") ||
    lower.includes("regulasi") ||
    lower.includes("hukum") ||
    lower.includes("inpres") ||
    lower.includes("uu")
  ) {
    return { type: "policy", badge: "DASAR REGULASI & KEBIJAKAN", icon: "📜" };
  }
  if (lower.includes("contoh") || lower.includes("studi kasus")) {
    return { type: "example", badge: "CONTOH PENERAPAN NYATA", icon: "🔍" };
  }
  if (
    lower.includes("langkah") ||
    lower.includes("prosedur") ||
    lower.includes("alur") ||
    lower.includes("tahap")
  ) {
    return { type: "steps", badge: "PANDUAN LANGKAH KERJA", icon: "⚡" };
  }
  return { type: "default", badge: "TOPIK PEMBELAJARAN", icon: "📘" };
}

interface ParsedSection {
  heading: string | null;
  blocks: string[];
}

export function Md({ text }: { text: string }) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Normalize line endings
  const normalized = (text || "").replace(/\r\n/g, "\n").trim();
  const rawBlocks = normalized.split(/\n{2,}/);

  // Group raw blocks into logical sections divided by "## "
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = { heading: null, blocks: [] };

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      if (currentSection.heading !== null || currentSection.blocks.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        heading: trimmed.slice(3).trim(),
        blocks: [],
      };
    } else {
      currentSection.blocks.push(trimmed);
    }
  }
  if (currentSection.heading !== null || currentSection.blocks.length > 0) {
    sections.push(currentSection);
  }

  return (
    <div className="space-y-6">
      {sections.map((section, sIdx) => {
        const { heading, blocks } = section;
        const meta = heading ? getSectionType(heading) : null;

        // Container styles based on section type
        let containerStyle =
          "glass-panel p-6 sm:p-7 border border-white/60 dark:border-white/10 transition-all";
        let headerAccent = "text-apple-blue dark:text-blue-400";
        let badgeStyle =
          "bg-apple-blue/10 text-apple-blue dark:bg-apple-blue/20 dark:text-blue-300";

        if (meta?.type === "warning") {
          containerStyle =
            "rounded-glass border border-amber-300/60 bg-amber-500/5 p-6 sm:p-7 backdrop-blur-xl dark:border-amber-500/20 dark:bg-amber-950/20 shadow-sm";
          headerAccent = "text-amber-700 dark:text-amber-300";
          badgeStyle =
            "bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300";
        } else if (meta?.type === "summary") {
          containerStyle =
            "rounded-glass border border-indigo-300/60 bg-indigo-500/5 p-6 sm:p-7 backdrop-blur-xl dark:border-indigo-500/25 dark:bg-indigo-950/20 shadow-md";
          headerAccent = "text-indigo-700 dark:text-indigo-300";
          badgeStyle =
            "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300";
        } else if (meta?.type === "objective") {
          containerStyle =
            "rounded-glass border border-emerald-300/60 bg-emerald-500/5 p-6 sm:p-7 backdrop-blur-xl dark:border-emerald-500/20 dark:bg-emerald-950/20 shadow-sm";
          headerAccent = "text-emerald-700 dark:text-emerald-300";
          badgeStyle =
            "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300";
        } else if (meta?.type === "policy") {
          containerStyle =
            "rounded-glass border border-purple-300/60 bg-purple-500/5 p-6 sm:p-7 backdrop-blur-xl dark:border-purple-500/20 dark:bg-purple-950/20 shadow-sm";
          headerAccent = "text-purple-700 dark:text-purple-300";
          badgeStyle =
            "bg-purple-500/15 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300";
        } else if (meta?.type === "example") {
          containerStyle =
            "rounded-glass border border-cyan-300/60 bg-cyan-500/5 p-6 sm:p-7 backdrop-blur-xl dark:border-cyan-500/20 dark:bg-cyan-950/20 shadow-sm";
          headerAccent = "text-cyan-700 dark:text-cyan-300";
          badgeStyle =
            "bg-cyan-500/15 text-cyan-700 dark:bg-cyan-500/25 dark:text-cyan-300";
        } else if (meta?.type === "steps") {
          containerStyle =
            "rounded-glass border border-teal-300/60 bg-teal-500/5 p-6 sm:p-7 backdrop-blur-xl dark:border-teal-500/20 dark:bg-teal-950/20 shadow-sm";
          headerAccent = "text-teal-700 dark:text-teal-300";
          badgeStyle =
            "bg-teal-500/15 text-teal-700 dark:bg-teal-500/25 dark:text-teal-300";
        }

        return (
          <div key={sIdx} className={containerStyle}>
            {heading && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[10px] font-bold tracking-wider uppercase ${badgeStyle}`}>
                    <span>{meta?.icon}</span>
                    <span>{meta?.badge}</span>
                  </span>
                </div>
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${headerAccent}`}>
                  {heading}
                </h2>
              </div>
            )}

            <div className="space-y-4">
              {blocks.map((block, bIdx) => {
                const lines = block.split("\n").filter((l) => l.trim().length > 0);

                // Check for blockquote
                if (lines.every((l) => l.startsWith("> "))) {
                  return (
                    <blockquote
                      key={bIdx}
                      className="my-3 rounded-2xl border-l-4 border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 p-4 pl-5 text-sm sm:text-base italic text-neutral-800 dark:text-neutral-200 backdrop-blur-sm"
                    >
                      {lines.map((l, lIdx) => (
                        <p key={lIdx}>{renderInline(l.slice(2))}</p>
                      ))}
                    </blockquote>
                  );
                }

                // Check for Numbered List (1. 2. 3.)
                if (lines.every((l) => /^\d+\. /.test(l))) {
                  return (
                    <div key={bIdx} className="my-3 space-y-2.5">
                      {lines.map((line, lIdx) => {
                        const numMatch = line.match(/^(\d+)\. /);
                        const num = numMatch ? numMatch[1] : `${lIdx + 1}`;
                        const content = line.replace(/^\d+\. /, "");
                        return (
                          <div
                            key={lIdx}
                            className="group flex items-start gap-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/5 p-3.5 sm:p-4 transition-all hover:bg-white/80 dark:hover:bg-white/10"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-apple-blue font-bold text-xs text-white shadow-sm shadow-apple-blue/30">
                              {num}
                            </span>
                            <div className="text-sm sm:text-base leading-relaxed text-neutral-800 dark:text-neutral-200 pt-0.5">
                              {renderInline(content)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // Check for Bullet List (- or *)
                if (lines.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
                  return (
                    <div key={bIdx} className="my-3 space-y-2.5">
                      {lines.map((line, lIdx) => {
                        const rawContent = line.slice(2);
                        // Check if it's formatted as **Key**: Value
                        const roleMatch = rawContent.match(/^\*\*([^*]+)\*\*:\s*(.+)$/);

                        if (roleMatch) {
                          const [, roleTitle, roleDesc] = roleMatch;
                          return (
                            <div
                              key={lIdx}
                              className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5 p-4 transition-all hover:bg-white/80 dark:hover:bg-white/10"
                            >
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-apple-blue" />
                                <span className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                                  {roleTitle}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 pl-4">
                                {renderInline(roleDesc)}
                              </p>
                            </div>
                          );
                        }

                        // Standard bullet item with interactive feel
                        const checkId = `check-${sIdx}-${bIdx}-${lIdx}`;
                        const isChecked = !!checkedItems[checkId];

                        return (
                          <div
                            key={lIdx}
                            onClick={() => toggleCheck(checkId)}
                            className="cursor-pointer group flex items-start gap-3 rounded-2xl border border-black/5 dark:border-white/5 bg-white/30 dark:bg-white/5 p-3 sm:p-3.5 transition-all hover:bg-white/70 dark:hover:bg-white/10"
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border text-xs transition-colors mt-0.5 ${
                                isChecked
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800 text-transparent group-hover:border-apple-blue"
                              }`}
                            >
                              ✓
                            </span>
                            <span
                              className={`text-sm sm:text-base leading-relaxed transition-opacity ${
                                isChecked
                                  ? "line-through opacity-60 text-neutral-500"
                                  : "text-neutral-800 dark:text-neutral-200"
                              }`}
                            >
                              {renderInline(rawContent)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // Subheadings (### Subheading)
                if (block.startsWith("### ")) {
                  return (
                    <h3
                      key={bIdx}
                      className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white pt-2 flex items-center gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-apple-blue" />
                      {renderInline(block.slice(4))}
                    </h3>
                  );
                }

                // Standard Paragraph
                return (
                  <p
                    key={bIdx}
                    className="text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300"
                  >
                    {renderInline(block)}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

