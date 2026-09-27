import React from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';

export function Controls({ isPracticeActive, onTogglePractice, onNextLetter, isCameraActive }) {
  return (
    <div className="controls-bar">
      <button
        className="btn-primary"
        onClick={onTogglePractice}
        style={{
          background: isPracticeActive
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : undefined
        }}
      >
        {isPracticeActive ? (
          <>
            <Square size={20} /> Stop Practice Session
          </>
        ) : (
          <>
            <Play size={20} /> Start Practice
          </>
        )}
      </button>

      <button className="btn-secondary" onClick={onNextLetter} title="Switch to Next ASL Letter">
        <RefreshCw size={18} /> Next Letter
      </button>
    </div>
  );
}
