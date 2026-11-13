"use client";

import React from "react";

// 8-bit Sora Sprite (Brown/amber hair, yellow king shirt, confident pixel smirk)
export function SoraPixel({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pixelated drop-shadow-sm select-none"
    >
      {/* Hair (Spiky Reddish-Brown) */}
      <rect x="5" y="1" width="6" height="2" fill="#8B4513" />
      <rect x="3" y="2" width="10" height="2" fill="#A0522D" />
      <rect x="2" y="3" width="12" height="3" fill="#8B4513" />
      <rect x="1" y="4" width="3" height="3" fill="#6B3410" />
      <rect x="12" y="4" width="3" height="3" fill="#6B3410" />

      {/* Face Skin */}
      <rect x="4" y="5" width="8" height="6" fill="#FCD34D" />
      <rect x="3" y="6" width="10" height="4" fill="#FDE68A" />

      {/* Eyes (Ruby Red anime eyes) */}
      <rect x="5" y="7" width="2" height="2" fill="#DC2626" />
      <rect x="9" y="7" width="2" height="2" fill="#DC2626" />
      <rect x="5" y="7" width="1" height="1" fill="#FFFFFF" />
      <rect x="9" y="7" width="1" height="1" fill="#FFFFFF" />

      {/* Smirk */}
      <rect x="8" y="10" width="2" height="1" fill="#78350F" />

      {/* Crown Hairpin hint */}
      <rect x="4" y="2" width="2" height="1" fill="#F59E0B" />

      {/* Yellow Shirt / King Outfit */}
      <rect x="4" y="11" width="8" height="4" fill="#FBBF24" />
      <rect x="3" y="12" width="10" height="3" fill="#F59E0B" />
      <rect x="7" y="11" width="2" height="4" fill="#4B5563" />
    </svg>
  );
}

// 8-bit Shiro Sprite (Long pale purple/white hair, big red eyes, sailor crown)
export function ShiroPixel({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pixelated drop-shadow-sm select-none"
    >
      {/* Crown */}
      <rect x="6" y="0" width="4" height="1" fill="#F59E0B" />
      <rect x="5" y="1" width="6" height="1" fill="#FBBF24" />
      <rect x="7" y="1" width="2" height="1" fill="#DC2626" />

      {/* Long Hair (Pale pastel lilac-white with blue/pink gradient vibe) */}
      <rect x="4" y="2" width="8" height="3" fill="#E0E7FF" />
      <rect x="3" y="3" width="10" height="3" fill="#EDE9FE" />
      <rect x="2" y="4" width="12" height="9" fill="#DDD6FE" />
      <rect x="1" y="6" width="2" height="9" fill="#C4B5FD" />
      <rect x="13" y="6" width="2" height="9" fill="#C4B5FD" />

      {/* Face Skin */}
      <rect x="4" y="5" width="8" height="5" fill="#FFFBEB" />
      <rect x="5" y="6" width="6" height="4" fill="#FEF3C7" />

      {/* Big Anime Eyes (Crimson / Gold Shiro Eyes) */}
      <rect x="4" y="7" width="2" height="3" fill="#EF4444" />
      <rect x="10" y="7" width="2" height="3" fill="#EF4444" />
      <rect x="4" y="7" width="1" height="1" fill="#FFFFFF" />
      <rect x="10" y="7" width="1" height="1" fill="#FFFFFF" />
      <rect x="5" y="9" width="1" height="1" fill="#F59E0B" />
      <rect x="11" y="9" width="1" height="1" fill="#F59E0B" />

      {/* Mouth (Little quiet dot) */}
      <rect x="7" y="10" width="2" height="1" fill="#FCA5A5" />

      {/* Sailor Uniform (Navy & White Sailor Collar) */}
      <rect x="4" y="11" width="8" height="4" fill="#312E81" />
      <rect x="6" y="11" width="4" height="2" fill="#FFFFFF" />
      <rect x="7" y="12" width="2" height="3" fill="#DC2626" />
    </svg>
  );
}
