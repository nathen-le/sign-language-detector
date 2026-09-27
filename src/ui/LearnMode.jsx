import React from 'react';
import { ASL_ALPHABET } from './ASLAlphabetData';
import { Target, BookOpen, Camera, Play, Square, CheckCircle2, Lightbulb, ChevronLeft, ChevronRight, RotateCcw, Award, Loader2 } from 'lucide-react';
import { AccuracyMeter } from './AccuracyMeter';
import { ProgressIndicator } from './ProgressIndicator';

export function LearnMode({
  currentLetter,
  onSelectLetter,
  onPrevLetter,
  onNextLetter,
  videoRef,
  canvasRef,
  isCameraActive,
  isPracticeActive,
  isLoadingModel,
  onTogglePractice,
  cameraError,
  accuracyScore,
  feedbackText,
  holdProgress = 0,
  isLetterSuccess = false,
  completedLetters = [],
  sessionStats,
  onResetStats
}) {
  const selectedData = ASL_ALPHABET.find((item) => item.letter === currentLetter) || ASL_ALPHABET[0];
  const isCurrentCompleted = completedLetters.includes(currentLetter);

  return (
    <div className="learn-view">
      {/* Left Panel - A-Z Alphabet Picker Grid */}
      <div className="card alphabet-grid-panel">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={18} />
            <span>ASL Alphabet (A–Z)</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
            {completedLetters.length}/26 Done
          </span>
        </div>

        <div className="alphabet-grid">
          {ASL_ALPHABET.map((item) => {
            const isDone = completedLetters.includes(item.letter);
            const isSelected = item.letter === currentLetter;
            return (
              <button
                key={item.letter}
                className={`alphabet-card-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectLetter(item.letter)}
                style={{ position: 'relative' }}
              >
                <span>{item.letter}</span>
                {isDone && (
                  <CheckCircle2
                    size={14}
                    color={isSelected ? '#ffffff' : 'var(--accent-emerald)'}
                    style={{ position: 'absolute', top: '4px', right: '4px' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Guided Steps & Focused Letter Camera */}
      <div className="learn-details-panel">
        {/* Step-by-Step Instructions Card */}
        <div className="card guide-card">
          <div className="target-letter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title" style={{ margin: 0 }}>
              <Target size={18} />
              <span>How to Sign: Letter {selectedData.letter}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }} onClick={onPrevLetter} title="Previous Letter">
                <ChevronLeft size={16} /> Prev
              </button>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }} onClick={onNextLetter} title="Next Letter">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="target-letter-content">
            <div className="letter-badge-large" style={{ position: 'relative' }}>
              {selectedData.letter}
              {isCurrentCompleted && (
                <CheckCircle2
                  size={22}
                  color="var(--accent-emerald)"
                  style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--bg-card)', borderRadius: '50%' }}
                />
              )}
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
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
          <div className="card-title" style={{ justifyContent: 'space-between', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Camera size={18} />
              <span>Focused Practice: Letter {currentLetter}</span>
            </div>
          </div>

          {/* Success Notification Banner */}
          {isLetterSuccess && (
            <div className="success-banner" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)', border: '1px solid var(--accent-emerald)', padding: '0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={24} color="var(--accent-emerald)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#34d399' }}>Letter {currentLetter} Mastered! 🎉</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>You held the sign correctly! Progress saved.</div>
                </div>
              </div>
              <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={onNextLetter}>
                Next Letter <ChevronRight size={14} />
              </button>
            </div>
          )}

          <div className="webcam-container">
            <video
              ref={videoRef}
              className="webcam-video"
              playsInline
              muted
              style={{ display: isCameraActive ? 'block' : 'none' }}
            />

            <canvas
              ref={canvasRef}
              className="webcam-canvas"
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
                {cameraError && (
                  <div style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                    {cameraError}
                  </div>
                )}
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

          {/* Hold Countdown Progress Bar */}
          {isPracticeActive && accuracyScore >= 75 && (
            <div style={{ background: 'var(--bg-card-alt)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                <span>Hold Pose to Master:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{Math.round(holdProgress)}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${holdProgress}%`, background: 'var(--accent-emerald)', transition: 'width 0.1s linear' }} />
              </div>
            </div>
          )}

          <AccuracyMeter accuracyScore={accuracyScore} />

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-card-alt)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong>Feedback:</strong> {feedbackText || `Position hand to practice Letter ${currentLetter}.`}
          </div>

          <div className="controls-bar">
            <button
              className="btn-primary"
              onClick={onTogglePractice}
              disabled={isLoadingModel}
              style={{
                background: isPracticeActive
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : undefined,
                opacity: isLoadingModel ? 0.7 : 1
              }}
            >
              {isLoadingModel ? (
                <>
                  <Loader2 size={16} className="spin" /> Loading Model...
                </>
              ) : isPracticeActive ? (
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

          <ProgressIndicator
            sessionStats={sessionStats}
            onResetStats={onResetStats}
          />
        </div>
      </div>
    </div>
  );
}
