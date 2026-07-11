import React from 'react';

/**
 * VehicleGlyph — minimal brass line-art silhouettes used on each showroom
 * placard. Category is free text from the API, so we match loosely by
 * keyword and fall back to a generic sedan silhouette.
 */
const strokeProps = {
  fill: 'none',
  stroke: 'var(--accent)',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

const Sedan = () => (
  <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
    <path {...strokeProps} d="M10 50 L14 34 Q24 22 40 22 L58 22 Q66 22 72 28 L92 28 Q104 28 112 38 L128 42 L130 50" />
    <path {...strokeProps} d="M10 50 L130 50" />
    <circle cx="34" cy="52" r="8" {...strokeProps} />
    <circle cx="104" cy="52" r="8" {...strokeProps} />
  </svg>
);

const SUV = () => (
  <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
    <path {...strokeProps} d="M8 50 L10 30 Q14 20 26 20 L100 20 Q114 20 122 32 L132 40 L132 50" />
    <path {...strokeProps} d="M8 50 L132 50" />
    <path {...strokeProps} d="M44 20 L48 34 M84 20 L86 34" />
    <circle cx="34" cy="52" r="9" {...strokeProps} />
    <circle cx="108" cy="52" r="9" {...strokeProps} />
  </svg>
);

const Sports = () => (
  <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
    <path {...strokeProps} d="M6 52 L18 40 Q30 26 50 26 L78 26 Q92 26 100 34 L134 44 L134 52" />
    <path {...strokeProps} d="M6 52 L134 52" />
    <circle cx="36" cy="54" r="7" {...strokeProps} />
    <circle cx="108" cy="54" r="7" {...strokeProps} />
  </svg>
);

const Truck = () => (
  <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
    <path {...strokeProps} d="M6 50 L8 26 L54 26 L54 50" />
    <path {...strokeProps} d="M54 34 L92 34 L112 50" />
    <path {...strokeProps} d="M6 50 L132 50 L132 40 L112 40" />
    <circle cx="30" cy="52" r="9" {...strokeProps} />
    <circle cx="108" cy="52" r="9" {...strokeProps} />
  </svg>
);

const Electric = () => (
  <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
    <path {...strokeProps} d="M10 50 L14 34 Q24 22 40 22 L58 22 Q66 22 72 28 L92 28 Q104 28 112 38 L128 42 L130 50" />
    <path {...strokeProps} d="M10 50 L130 50" />
    <circle cx="34" cy="52" r="8" {...strokeProps} />
    <circle cx="104" cy="52" r="8" {...strokeProps} />
    <path
      fill="var(--accent)"
      stroke="none"
      d="M71 20 L60 34 L67 34 L64 46 L78 30 L70 30 Z"
    />
  </svg>
);

const glyphFor = (category = '') => {
  const c = category.toLowerCase();
  if (/electric|ev|hybrid/.test(c)) return Electric;
  if (/suv|crossover/.test(c)) return SUV;
  if (/truck|pickup/.test(c)) return Truck;
  if (/sport|coupe|convertible|super/.test(c)) return Sports;
  return Sedan;
};

const VehicleGlyph = ({ category }) => {
  const Glyph = glyphFor(category);
  return <Glyph />;
};

export default VehicleGlyph;
