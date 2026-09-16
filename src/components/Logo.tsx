'use client';

import React from 'react';

/**
 * ScriptOS inline SVG logo — a film-clapper + play-triangle mark on an
 * emerald gradient rounded square. Inlined (not <img>) so it's crisp at
 * any size, adds zero network requests, and avoids the next/image warning.
 */
export function Logo({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="ScriptOS"
    >
      <defs>
        <linearGradient id="scriptos-logo-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="scriptos-logo-stroke" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="1" stopColor="#ecfdf5" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#scriptos-logo-bg)" />
      <rect x="14" y="14" width="484" height="484" rx="100" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="2" />
      {/* Clapper bar with stripes */}
      <rect x="120" y="132" width="272" height="44" rx="10" fill="url(#scriptos-logo-stroke)" />
      <polygon points="148,132 168,176 188,176 168,132" fill="#10b981" opacity="0.85" />
      <polygon points="208,132 228,176 248,176 228,132" fill="#10b981" opacity="0.85" />
      <polygon points="268,132 288,176 308,176 288,132" fill="#10b981" opacity="0.85" />
      <polygon points="328,132 348,176 368,176 348,132" fill="#10b981" opacity="0.85" />
      {/* Script body */}
      <rect x="120" y="188" width="272" height="208" rx="14" fill="url(#scriptos-logo-stroke)" />
      {/* Script lines */}
      <rect x="146" y="218" width="150" height="8" rx="4" fill="#10b981" opacity="0.45" />
      <rect x="146" y="238" width="220" height="8" rx="4" fill="#10b981" opacity="0.35" />
      <rect x="146" y="258" width="180" height="8" rx="4" fill="#10b981" opacity="0.35" />
      {/* Play triangle */}
      <path d="M210 290 L300 336 L210 382 Z" fill="#10b981" />
    </svg>
  );
}

export default Logo;
