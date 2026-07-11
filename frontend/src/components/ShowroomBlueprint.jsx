import React from 'react';

/**
 * ShowroomBlueprint — the app's signature illustration. A patent-drawing
 * style car outline rendered in fine brass linework, with a self-drawing
 * animation on mount. Appears large on the auth screens.
 */
const ShowroomBlueprint = () => (
  <svg className="auth-gauge-svg" viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* blueprint grid */}
    <g stroke="var(--border-hairline)" strokeWidth="1">
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="240" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 60} x2="420" y2={i * 60} />
      ))}
    </g>

    {/* body */}
    <path
      className="blueprint-draw"
      d="M30 170 L36 130 Q46 96 90 96 L150 96 Q170 96 184 112 L250 112 Q292 112 312 140 L376 156 L382 170"
      stroke="var(--accent)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="blueprint-draw"
      d="M30 170 L382 170"
      stroke="var(--accent)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      className="blueprint-draw"
      d="M100 96 L112 130 M172 96 L176 112"
      stroke="var(--accent)"
      strokeWidth="1.4"
      opacity="0.7"
    />

    {/* wheels */}
    <circle className="blueprint-draw" cx="108" cy="176" r="26" stroke="var(--accent)" strokeWidth="2" />
    <circle cx="108" cy="176" r="7" fill="var(--accent)" opacity="0.5" />
    <circle className="blueprint-draw" cx="312" cy="176" r="26" stroke="var(--accent)" strokeWidth="2" />
    <circle cx="312" cy="176" r="7" fill="var(--accent)" opacity="0.5" />

    {/* dimension marks */}
    <g stroke="var(--text-faint)" strokeWidth="1" opacity="0.6">
      <line x1="30" y1="200" x2="382" y2="200" />
      <line x1="30" y1="195" x2="30" y2="205" />
      <line x1="382" y1="195" x2="382" y2="205" />
    </g>
    <text x="206" y="216" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="2" fill="var(--text-faint)">
      EST. 2026 — THE COLLECTION
    </text>
  </svg>
);

export default ShowroomBlueprint;
