import React from 'react';
import { Eye, HelpCircle } from 'lucide-react';

export function DetectedLetter({ detectedLetter = null, isPracticeActive = false }) {
  return (
    <div className="card">
      <div className="card-title">
        <Eye size={20} />
        <span>Detected Letter Area</span>
      </div>

      <div className="detected-letter-box">
        <div className={`detected-symbol ${detectedLetter ? 'active' : ''}`}>
          {detectedLetter ? detectedLetter : '—'}
        </div>
        <p className="detected-label">
          {detectedLetter
            ? `Detected Sign: ${detectedLetter}`
            : isPracticeActive
            ? 'Position hand in frame (Recognition Engine Standby)'
            : 'Start practice to enable detection'}
        </p>
      </div>
    </div>
  );
}
