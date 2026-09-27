import React from 'react';
import { Award, CheckCircle2, RotateCcw } from 'lucide-react';

export function ProgressIndicator({ sessionStats, onResetStats }) {
  const { attemptsCount = 0, lettersAttempted = 0, bestAccuracy = 0 } = sessionStats || {};

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} />
          <span>Session Progress Indicator</span>
        </div>
        {attemptsCount > 0 && (
          <button
            onClick={onResetStats}
            title="Reset Session Stats"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      <div className="progress-grid">
        <div className="stat-box">
          <span className="stat-label">Total Attempts</span>
          <span className="stat-value">{attemptsCount}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Letters Practiced</span>
          <span className="stat-value">{lettersAttempted}</span>
        </div>

        <div className="stat-box" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Best Match Accuracy</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              {bestAccuracy > 0 ? `${bestAccuracy}%` : 'Not set'}
            </span>
          </div>
          <div style={{ marginTop: '0.4rem', height: '6px', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${bestAccuracy}%`,
                background: 'var(--accent-emerald)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
