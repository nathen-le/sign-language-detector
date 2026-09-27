import React, { useState, useRef, useEffect } from 'react';
import { Header } from './ui/Header';
import { DetectorMode } from './ui/DetectorMode';
import { LearnMode } from './ui/LearnMode';
import { ASL_ALPHABET } from './ui/ASLAlphabetData';
import { CameraManager } from './camera/CameraManager';
import { HandTracker } from './tracking/HandTracker';
import { SignRecognizer } from './recognition/SignRecognizer';
import { ScoreCalculator } from './scoring/ScoreCalculator';

export function App() {
  const [activeMode, setActiveMode] = useState('detector'); // 'detector' | 'learn'
  const [currentLetter, setCurrentLetter] = useState('A');
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Detector & Recognition states
  const [detectedLetter, setDetectedLetter] = useState(null);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [feedbackText, setFeedbackText] = useState(null);

  const videoRef = useRef(null);
  const cameraManagerRef = useRef(null);
  const handTrackerRef = useRef(null);
  const recognizerRef = useRef(null);
  const scoreCalculatorRef = useRef(null);

  useEffect(() => {
    cameraManagerRef.current = new CameraManager();
    handTrackerRef.current = new HandTracker();
    recognizerRef.current = new SignRecognizer();
    scoreCalculatorRef.current = new ScoreCalculator();

    return () => {
      if (cameraManagerRef.current) {
        cameraManagerRef.current.stopCamera();
      }
      if (handTrackerRef.current) {
        handTrackerRef.current.close();
      }
    };
  }, []);

  const handleTogglePractice = async () => {
    if (isPracticeActive) {
      if (cameraManagerRef.current) {
        cameraManagerRef.current.stopCamera();
      }
      setIsCameraActive(false);
      setIsPracticeActive(false);
      setCameraError(null);
    } else {
      setIsPracticeActive(true);
      setCameraError(null);

      try {
        if (cameraManagerRef.current && videoRef.current) {
          await cameraManagerRef.current.startCamera(videoRef.current);
          setIsCameraActive(true);
        }

        if (handTrackerRef.current && !handTrackerRef.current.isInitialized) {
          handTrackerRef.current.initialize().catch((err) => {
            console.warn('HandTracker notice:', err);
          });
        }
      } catch (err) {
        console.error('Camera error:', err);
        setCameraError(err.message || 'Webcam access denied. Please grant camera permission.');
        setIsCameraActive(false);
      }
    }
  };

  const handleSelectLetter = (letter) => {
    setCurrentLetter(letter);
  };

  const handleChangeMode = (mode) => {
    setActiveMode(mode);
  };

  return (
    <div className="app-container">
      <Header
        activeMode={activeMode}
        onChangeMode={handleChangeMode}
        isCameraActive={isCameraActive}
        isPracticeActive={isPracticeActive}
      />

      <main className="workspace">
        {activeMode === 'detector' ? (
          <DetectorMode
            videoRef={videoRef}
            isCameraActive={isCameraActive}
            isPracticeActive={isPracticeActive}
            onTogglePractice={handleTogglePractice}
            cameraError={cameraError}
            detectedLetter={detectedLetter}
            accuracyScore={accuracyScore}
            feedbackText={feedbackText}
          />
        ) : (
          <LearnMode
            currentLetter={currentLetter}
            onSelectLetter={handleSelectLetter}
            videoRef={videoRef}
            isCameraActive={isCameraActive}
            isPracticeActive={isPracticeActive}
            onTogglePractice={handleTogglePractice}
            cameraError={cameraError}
            accuracyScore={accuracyScore}
            feedbackText={feedbackText}
          />
        )}
      </main>

      <footer className="footer">
        SignSense — Browser ASL Learning App — On-Device Recognition & Academy
      </footer>
    </div>
  );
}
