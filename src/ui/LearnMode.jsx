import React from 'react';
import { ASL_ALPHABET } from './ASLAlphabetData';
import { Target, BookOpen, Camera, Play, Square, CheckCircle2, Lightbulb, Gauge } from 'lucide-react';
import { AccuracyMeter } from './AccuracyMeter';

export function LearnMode({
  currentLetter,
  onSelectLetter,
  videoRef,
  isCameraActive,
  isPracticeActive,
  onTogglePractice,
  cameraError,
  accuracyScore,
  feedbackText
}) {
  const selectedData = ASL_ALPHABET.find((item) => item.letter === currentLetter) || ASL_ALPHABET[0];

  return (
    <div className="learn-view">
      {/* Left Panel - A-Z Alphabet Picker Grid */}
      <div className="card alphabet-grid-panel">
        <div className="card-title">
          <BookOpen size={18} />
          <span>ASL Alphabet (A–Z)</span>
        </div>

        <div className="alphabet-grid">
          {ASL_ALPHABET.map((item) => (
            <button
              key={item.letter}
              className={`alphabet-card-item ${item.letter === currentLetter ? 'active' : ''}`}
              onClick={() => onSelectLetter(item.letter)}
            >
              {item.letter}
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Guided Steps & Focused Letter Camera */}
      <div className="learn-details-panel">
        {/* Step-by-Step Instructions Card */}
        <div className="card guide-card">
          <div className="target-letter-header">
            <div className="card-title" style={{ margin: 0 }}>
              <Target size={18} />
              <span>How to Sign: Letter {selectedData.letter}</span>
            </div>
          </div>

          <div className="target-letter-content">
            <div className="letter-badge-large">
              {selectedData.letter}
            </div>

            <div className="letter-details">
              <h3 className="letter-name">{selectedData.name}</h3>
              <p className="letter-description">{selectedData.description}</p>
            </div>
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            STEP-BY-STEP INSTRUCTIONS:
          </div>

          <div className="steps-list">
            {selectedData.steps.map((step, idx) => (
              <div key={idx} className="step-item">
                <div className="step-number">{idx + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>

          <div className="hint-pill" style={{ marginTop: 'auto', width: '100%' }}>
            <Lightbulb size={16} />
            <span>Pro Tip: {selectedData.tip}</span>
          </div>
        </div>

        {/* Focused Practice Camera Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="card-title" style={{ justifyContent: 'space-between', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Camera size={18} />
              <span>Focused Practice: Letter {currentLetter}</span>
            </div>
          </div>

          <div className="webcam-container">
            <video
              ref={videoRef}
              className="webcam-video"
              playsInline
              muted
              style={{ display: isCameraActive ? 'block' : 'none' }}
            />

            {!isCameraActive && (
              <div className="webcam-placeholder">
                <div className="camera-icon-wrapper">
                  <Camera size={28} />
                </div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Practice Letter {currentLetter}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Start camera to focus on performing <strong>Letter {currentLetter}</strong>.
                </p>
              </div>
            )}

            <div className="webcam-overlay">
              <div className="overlay-badge">
                Focus: Letter {currentLetter}
              </div>
              <div className="overlay-badge">
                Match: {accuracyScore || 0}%
              </div>
            </div>
          </div>

          <AccuracyMeter accuracyScore={accuracyScore} />

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
                  <Square size={16} /> Stop Practice
                </>
              ) : (
                <>
                  <Play size={16} /> Practice Letter {currentLetter}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
