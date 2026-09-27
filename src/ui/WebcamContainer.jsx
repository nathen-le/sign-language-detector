import React from 'react';
import { Camera, CameraOff, Sparkles, Activity } from 'lucide-react';

export function WebcamContainer({ videoRef, isCameraActive, isPracticeActive, error }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <Camera size={20} />
          <span>Webcam Hand Tracking Feed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isCameraActive && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Activity size={14} className="pulse" /> Live Feed
            </span>
          )}
        </div>
      </div>

      <div className="webcam-container">
        {/* HTML Video tag for WebRTC camera stream */}
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
              {error ? <CameraOff size={32} color="var(--accent-rose)" /> : <Camera size={32} />}
            </div>
            {error ? (
              <>
                <h4 className="webcam-title" style={{ color: 'var(--accent-rose)' }}>Camera Access Error</h4>
                <p className="webcam-subtitle">{error}</p>
              </>
            ) : (
              <>
                <h4 className="webcam-title">Webcam Stream Standby</h4>
                <p className="webcam-subtitle">
                  Click <strong>Start Practice</strong> below to enable your Mac webcam and begin hand tracking.
                </p>
              </>
            )}
          </div>
        )}

        <div className="webcam-overlay">
          <div className="overlay-badge">
            MediaPipe Tasks Vision
          </div>
          <div className="overlay-badge">
            {isCameraActive ? 'Resolution: 720p HD' : 'Mode: Manual Start'}
          </div>
        </div>
      </div>
    </div>
  );
}
