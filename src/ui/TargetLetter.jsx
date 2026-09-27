import React from 'react';
import { Target, Lightbulb, ChevronRight } from 'lucide-react';
import { ASL_ALPHABET } from './ASLAlphabetData';

export function TargetLetter({ currentLetter, onSelectLetter }) {
  const letterData = ASL_ALPHABET.find((item) => item.letter === currentLetter) || ASL_ALPHABET[0];

  return (
    <div className="card target-letter-card">
      <div className="target-letter-header">
        <div className="card-title" style={{ margin: 0 }}>
          <Target size={20} />
          <span>Target ASL Letter</span>
        </div>

        <div className="selector-wrapper">
          <label htmlFor="asl-select" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Select Sign:
          </label>
          <select
            id="asl-select"
            className="letter-dropdown"
            value={currentLetter}
            onChange={(e) => onSelectLetter(e.target.value)}
          >
            {ASL_ALPHABET.map((item) => (
              <option key={item.letter} value={item.letter}>
                Letter {item.letter}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="target-letter-content">
        <div className="letter-badge-large">
          {letterData.letter}
        </div>

        <div className="letter-details">
          <h3 className="letter-name">{letterData.name}</h3>
          <p className="letter-description">{letterData.description}</p>
          <div className="hint-pill">
            <Lightbulb size={14} />
            <span>{letterData.tip}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
          QUICK SWITCH LETTER:
        </div>
        <div className="alphabet-scroll">
          {ASL_ALPHABET.map((item) => (
            <button
              key={item.letter}
              className={`alphabet-chip ${item.letter === currentLetter ? 'active' : ''}`}
              onClick={() => onSelectLetter(item.letter)}
              title={`Practice Letter ${item.letter}`}
            >
              {item.letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
