import React from 'react';
import { Camera, Eye, MessageSquareText, Play, Square, Info, ShieldCheck, Loader2 } from 'lucide-react';
import { AccuracyMeter } from './AccuracyMeter';

export function DetectorMode({
  videoRef,
  canvasRef,
  isCameraActive,
  isPracticeActive,
  isLoadingModel,
  onTogglePractice,
  cameraError,
  detectedLetter,
  accuracyScore,
  confidenceScore = 0,
  feedbackText
}) {
  return (
    <div className="detector-view">
      {/* Left Column - Camera Stream & Hand Landmark Overlay */}
      <div className="camera-panel">
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
                <Camera size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                ASL Free Detector Standby
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px' }}>
                Click <strong>Start Detector</strong> to activate your webcam. Perform any ASL letter sign (A–Z) to get real-time detection & pose accuracy rating.
              </p>
              {cameraError && (
                <div style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
                  {cameraError}
                </div>
              )}
            </div>
          )}

          <div className="webcam-overlay">
            <div className="overlay-badge">
              MediaPipe Vision
            </div>
            <div className="overlay-badge">
              {isLoadingModel ? 'Initializing AI...' : isCameraActive ? 'Live Recognition' : 'Standby'}
            </div>
          </div>
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
                <Loader2 size={18} className="spin" /> Loading Model...
              </>
            ) : isPracticeActive ? (
              <>
                <Square size={18} /> Stop Detector
              </>
            ) : (
              <>
                <Play size={18} /> Start Detector
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column - Detection Rating & Suggestions */}
      <div className="detector-side-panel">
        {/* Pose Quality Rating out of 100 */}
        <div className="card detector-score-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            POSE QUALITY SCORE
          </div>
          <div className="score-display-large">
            <span className="score-number">{accuracyScore || 0}</span>
            <span className="score-denom">/ 100</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time hand pose landmark similarity
          </div>
        </div>

        {/* Detected Letter Display */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} />
              <span>Detected ASL Letter</span>
            </div>
            {detectedLetter && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-light)', padding: '0.2rem 0.5rem', borderRadius: '99px', fontWeight: 600 }}>
                {confidenceScore}% Confident
              </span>
            )}
          </div>

          <div className="detected-letter-badge">
            <div className="letter-circle">
              {detectedLetter || '—'}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {detectedLetter ? `Letter ${detectedLetter}` : 'Uncertain / No Hand'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isPracticeActive
                  ? (detectedLetter ? `Recognition Confidence: ${confidenceScore}%` : 'Position hand in frame...')
                  : 'Start detector to enable recognition'}
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy Gauge Bar */}
        <AccuracyMeter accuracyScore={accuracyScore} />

        {/* Real-time Improvement Suggestions */}
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">
            <MessageSquareText size={18} />
            <span>Suggestions to Improve</span>
          </div>

          <div className="feedback-box" style={{ minHeight: '90px' }}>
            <Info size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
            <p className="feedback-text">
              {feedbackText || (
                isPracticeActive
                  ? 'Keep your hand steady within camera frame. Adjust your fingers to improve pose score.'
                  : 'Start the detector to receive personalized pose improvement suggestions.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
