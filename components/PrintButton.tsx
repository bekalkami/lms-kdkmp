"use client";
export default function PrintButton() { return <button onClick={() => window.print()} className="btn print:hidden">Cetak lembar kerja</button>; }
