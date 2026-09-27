import React from 'react';
import { Camera, Eye, Gauge, MessageSquareText, Play, Square, Info, Activity } from 'lucide-react';
import { AccuracyMeter } from './AccuracyMeter';
import { FeedbackArea } from './FeedbackArea';

export function DetectorMode({
  videoRef,
  isCameraActive,
  isPracticeActive,
  onTogglePractice,
  cameraError,
  detectedLetter,
  accuracyScore,
  feedbackText
}) {
  return (
    <div className="detector-view">
      {/* Left Column - Camera Stream */}
      <div className="camera-panel">
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
                <Camera size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                ASL Detector Standby
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px' }}>
                Click <strong>Start Detector</strong> to turn on your webcam. Perform any ASL letter sign to get real-time detection & accuracy rating out of 100.
              </p>
              {cameraError && (
                <div style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
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
              {isCameraActive ? 'Live Detector' : 'Standby'}
            </div>
          </div>
        </div>

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
        {/* Rating out of 100 */}
        <div className="card detector-score-card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            ACCURACY RATING
          </div>
          <div className="score-display-large">
            <span className="score-number">{accuracyScore || 0}</span>
            <span className="score-denom">/ 100</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time hand pose similarity score
          </div>
        </div>

        {/* Detected Letter Display */}
        <div className="card">
          <div className="card-title">
            <Eye size={18} />
            <span>Detected ASL Letter</span>
          </div>

          <div className="detected-letter-badge">
            <div className="letter-circle">
              {detectedLetter || '—'}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {detectedLetter ? `Letter ${detectedLetter}` : 'No Hand Detected'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isPracticeActive ? 'Awaiting hand sign...' : 'Detector inactive'}
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
                  ? 'Keep your hand within the camera frame with clear lighting. Adjust fingers to improve score.'
                  : 'Start the detector to receive personalized pose improvement suggestions.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
