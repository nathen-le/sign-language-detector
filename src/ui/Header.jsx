import React from 'react';
import { Camera, BookOpen, Sun, Moon } from 'lucide-react';

export function Header({
  activeMode,
  onChangeMode,
  isCameraActive,
  isPracticeActive,
  theme = 'light',
  onToggleTheme
}) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-icon">
          <span>🤟</span>
        </div>
        <div>
          <h1 className="brand-title">SignoLingo</h1>
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

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Theme Switcher Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span className="theme-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

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
