import React from 'react';
import { Gauge } from 'lucide-react';

export function AccuracyMeter({ accuracyScore = 0 }) {
  const roundedScore = Math.round(accuracyScore);

  return (
    <div className="card">
      <div className="card-title">
        <Gauge size={20} />
        <span>Accuracy Meter</span>
      </div>

      <div className="accuracy-meter-container">
        <div className="accuracy-header">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Pose Accuracy Match
          </span>
          <span className="accuracy-value">{roundedScore}%</span>
        </div>

        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${roundedScore}%` }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
