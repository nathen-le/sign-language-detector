import React from 'react';
import { Camera, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

export function Header({ activeMode, onChangeMode, isCameraActive, isPracticeActive }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-icon">
          <span>🤟</span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="brand-title">SignSense</h1>
            <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 700, background: 'var(--primary-light)', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
              MVP
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Browser ASL Recognition & Academy
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mode-tabs">
        <button
          className={`mode-tab ${activeMode === 'detector' ? 'active' : ''}`}
          onClick={() => onChangeMode('detector')}
        >
          <Camera size={16} />
          <span>Detector Mode</span>
        </button>

        <button
          className={`mode-tab ${activeMode === 'learn' ? 'active' : ''}`}
          onClick={() => onChangeMode('learn')}
        >
          <BookOpen size={16} />
          <span>Learn Mode</span>
        </button>
      </div>

      <div className="header-actions">
        <div className="status-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.8rem', background: 'var(--bg-card-alt)', borderRadius: '99px', fontSize: '0.8rem', border: '1px solid var(--border-light)' }}>
          <span className={`status-dot ${isCameraActive ? 'active' : isPracticeActive ? 'waiting' : ''}`}></span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isCameraActive ? 'Camera Live' : isPracticeActive ? 'Initializing...' : 'Camera Standby'}
          </span>
        </div>
      </div>
    </header>
  );
}
