import React from 'react';
import { Camera, CameraOff, Activity, Loader2 } from 'lucide-react';

export function WebcamContainer({
  videoRef,
  canvasRef,
  isCameraActive,
  isPracticeActive,
  isLoadingModel = false,
  error = null
}) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div className="card-title" style={{ margin: 0 }}>
          <Camera size={20} />
          <span>Webcam Hand Tracking Feed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isLoadingModel && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Loader2 size={14} className="spin" /> Loading AI Model...
            </span>
          )}
          {isCameraActive && !isLoadingModel && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Activity size={14} className="pulse" /> Live Tracking
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

        {/* Canvas overlay for real-time 21 hand landmarks rendering */}
        <canvas
          ref={canvasRef}
          className="webcam-canvas"
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
                  Click <strong>Start Camera</strong> to enable your webcam and begin real-time ASL hand tracking.
                </p>
              </>
            )}
          </div>
        )}

        <div className="webcam-overlay">
          <div className="overlay-badge">
            MediaPipe Hand Landmarker
          </div>
          <div className="overlay-badge">
            {isCameraActive ? '21 Keypoints Active' : 'Standby'}
          </div>
        </div>
      </div>
    </div>
  );
}
