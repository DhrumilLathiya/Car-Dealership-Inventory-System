import React from 'react';

/**
 * AvailabilityMeter — a quiet, single-line capacity indicator.
 * Reads like a fuel gauge glanced at in passing rather than a dashboard
 * readout: a dot + count, and a thin fill line beneath it.
 *
 * Tone thresholds:
 *   0 units    -> "empty"   (oxblood)
 *   1-2 units  -> "low"     (brass)
 *   3+ units   -> "healthy" (verdigris)
 */
export const stockTone = (quantity) => {
  if (quantity <= 0) return 'empty';
  if (quantity <= 2) return 'low';
  return 'healthy';
};

const AvailabilityMeter = ({ quantity, max = 12 }) => {
  const tone = stockTone(quantity);
  const pct = quantity <= 0 ? 100 : Math.min(100, Math.max(8, (quantity / max) * 100));

  return (
    <div>
      <div className="availability-row">
        <span className="availability-label">
          <span className={`availability-dot tone-${tone}`} />
          {tone === 'empty' ? 'Sold out' : tone === 'low' ? 'Only a few left' : 'Available now'}
        </span>
        <span className={`availability-count tone-${tone}`}>
          {quantity <= 0 ? '0' : quantity} in stock
        </span>
      </div>
      <div className="availability-meter" style={{ marginTop: 8 }}>
        <div
          className={`availability-meter-fill tone-${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default AvailabilityMeter;
