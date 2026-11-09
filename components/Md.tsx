import React from "react";
// Renderer markdown mini (## judul, **tebal**, daftar). Tanpa dangerouslySetInnerHTML -> aman dari XSS.
const inline = (t: string) => t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : p));
export function Md({ text }: { text: string }) {
  return (<div className="space-y-4 leading-relaxed">{text.trim().split(/\n{2,}/).map((b, i) => {
    if (b.startsWith("## ")) return <h2 key={i} className="pt-2 text-xl font-black text-merah">{inline(b.slice(3))}</h2>;
    const L = b.split("\n");
    if (L.every((l) => l.startsWith("- "))) return <ul key={i} className="list-disc space-y-1 pl-6">{L.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
    if (L.every((l) => /^\d+\. /.test(l))) return <ol key={i} className="list-decimal space-y-1 pl-6">{L.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\. /, ""))}</li>)}</ol>;
    return <p key={i}>{inline(b)}</p>;
  })}</div>);
}
