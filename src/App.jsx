import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './ui/Header';
import { DetectorMode } from './ui/DetectorMode';
import { LearnMode } from './ui/LearnMode';
import { ASL_ALPHABET } from './ui/ASLAlphabetData';
import { CameraManager } from './camera/CameraManager';
import { HandTracker } from './tracking/HandTracker';
import { SignRecognizer } from './recognition/SignRecognizer';
import { ScoreCalculator } from './scoring/ScoreCalculator';
import { loadProgress, saveLetterAttempt, resetProgress } from './utils/progressStorage';

export function App() {
  const [activeMode, setActiveMode] = useState('detector'); // 'detector' | 'learn'
  const [currentLetter, setCurrentLetter] = useState('A');
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Recognition & Scoring states
  const [detectedLetter, setDetectedLetter] = useState(null);
  const [accuracyScore, setAccuracyScore] = useState(0); // Pose Quality (0-100)
  const [confidenceScore, setConfidenceScore] = useState(0); // Confidence (0-100)
  const [feedbackText, setFeedbackText] = useState(null);

  // Practice Hold & Progress state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isLetterSuccess, setIsLetterSuccess] = useState(false);
  const [progress, setProgress] = useState(loadProgress);

  // Element Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Instance Refs
  const cameraManagerRef = useRef(null);
  const handTrackerRef = useRef(null);
  const recognizerRef = useRef(null);
  const scoreCalculatorRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const holdStartTimeRef = useRef(null);

  // Dynamic Refs to bypass closure stale state in animation frame loop
  const activeModeRef = useRef(activeMode);
  const currentLetterRef = useRef(currentLetter);
  const isPracticeActiveRef = useRef(isPracticeActive);
  const isLetterSuccessRef = useRef(isLetterSuccess);

  useEffect(() => { activeModeRef.current = activeMode; }, [activeMode]);
  useEffect(() => { currentLetterRef.current = currentLetter; }, [currentLetter]);
  useEffect(() => { isPracticeActiveRef.current = isPracticeActive; }, [isPracticeActive]);
  useEffect(() => { isLetterSuccessRef.current = isLetterSuccess; }, [isLetterSuccess]);

  // Instantiate helper classes on mount
  useEffect(() => {
    cameraManagerRef.current = new CameraManager();
    handTrackerRef.current = new HandTracker();
    recognizerRef.current = new SignRecognizer();
    scoreCalculatorRef.current = new ScoreCalculator();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (cameraManagerRef.current) {
        cameraManagerRef.current.stopCamera();
      }
      if (handTrackerRef.current) {
        handTrackerRef.current.close();
      }
    };
  }, []);

  // Main real-time video processing frame loop
  const processFrame = useCallback((timestamp) => {
    if (
      isPracticeActiveRef.current &&
      cameraManagerRef.current &&
      cameraManagerRef.current.isStreaming() &&
      videoRef.current
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // 1. MediaPipe Hand Landmark Detection
      const landmarks = handTrackerRef.current.detectForVideo(video, timestamp);

      // 2. Synchronize Canvas dimensions and render 21 landmark skeleton
      if (canvas && video) {
        const displayWidth = video.clientWidth || video.videoWidth || 640;
        const displayHeight = video.clientHeight || video.videoHeight || 480;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
        }

        handTrackerRef.current.drawLandmarksOnCanvas(canvas, landmarks);
      }

      // 3. Process mode logic
      const mode = activeModeRef.current;
      const targetLtr = currentLetterRef.current;

      if (mode === 'detector') {
        if (landmarks) {
          const result = recognizerRef.current.recognize(landmarks);
          if (result && result.letter) {
            setDetectedLetter(result.letter);
            setConfidenceScore(result.confidence);
            setAccuracyScore(result.poseQuality);
            const feedback = scoreCalculatorRef.current.generateFeedback(landmarks, result.letter);
            setFeedbackText(feedback);
          } else {
            setDetectedLetter(null);
            setConfidenceScore(0);
            setAccuracyScore(0);
            setFeedbackText('Position hand clearly facing the camera.');
          }
        } else {
          setDetectedLetter(null);
          setConfidenceScore(0);
          setAccuracyScore(0);
          setFeedbackText('No hand detected. Hold your hand up in front of the camera.');
        }
      } else if (mode === 'learn') {
        if (landmarks) {
          const matchScore = scoreCalculatorRef.current.calculateAccuracy(landmarks, targetLtr);
          setAccuracyScore(matchScore);

          const recogResult = recognizerRef.current.recognize(landmarks);
          const recognized = recogResult?.letter || null;
          setDetectedLetter(recognized);
          setConfidenceScore(recogResult?.confidence || 0);

          const feedback = scoreCalculatorRef.current.generateFeedback(landmarks, targetLtr);
          setFeedbackText(feedback);

          // Hold sign countdown logic for target letter matching
          if (matchScore >= 75 || recognized === targetLtr) {
            if (!holdStartTimeRef.current) {
              holdStartTimeRef.current = Date.now();
            }
            const elapsed = Date.now() - holdStartTimeRef.current;
            const required = 1500; // 1.5 seconds target hold
            const pct = Math.min(100, (elapsed / required) * 100);
            setHoldProgress(pct);

            if (elapsed >= required && !isLetterSuccessRef.current) {
              isLetterSuccessRef.current = true;
              setIsLetterSuccess(true);
              const updated = saveLetterAttempt(targetLtr, matchScore, true);
              setProgress(updated);
            }
          } else {
            holdStartTimeRef.current = null;
            setHoldProgress(0);
          }
        } else {
          setDetectedLetter(null);
          setAccuracyScore(0);
          setConfidenceScore(0);
          setFeedbackText(`No hand detected. Position hand to practice Letter ${targetLtr}.`);
          holdStartTimeRef.current = null;
          setHoldProgress(0);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(processFrame);
  }, []);

  // Start & Stop camera and landmark tracking loop
  const handleTogglePractice = async () => {
    if (isPracticeActive) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (cameraManagerRef.current) {
        cameraManagerRef.current.stopCamera();
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setIsCameraActive(false);
      setIsPracticeActive(false);
      setCameraError(null);
      setDetectedLetter(null);
      setAccuracyScore(0);
      setConfidenceScore(0);
      setHoldProgress(0);
      holdStartTimeRef.current = null;
    } else {
      setIsPracticeActive(true);
      setCameraError(null);
      setIsLoadingModel(true);

      try {
        // 1. Initialize HandTracker model if needed
        if (handTrackerRef.current && !handTrackerRef.current.isInitialized) {
          await handTrackerRef.current.initialize();
        }
        setIsLoadingModel(false);

        // 2. Start webcam stream
        if (cameraManagerRef.current && videoRef.current) {
          await cameraManagerRef.current.startCamera(videoRef.current);
          setIsCameraActive(true);
        }

        // 3. Start processing loop
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        console.error('Camera/Tracker startup error:', err);
        setIsLoadingModel(false);
        setIsCameraActive(false);
        setIsPracticeActive(false);
        setCameraError(err.message || 'Webcam access failed. Please grant camera permissions.');
      }
    }
  };

  const handleSelectLetter = (letter) => {
    setCurrentLetter(letter);
    setIsLetterSuccess(false);
    setHoldProgress(0);
    holdStartTimeRef.current = null;
  };

  const handlePrevLetter = () => {
    const idx = ASL_ALPHABET.findIndex((item) => item.letter === currentLetter);
    const prevIdx = (idx - 1 + ASL_ALPHABET.length) % ASL_ALPHABET.length;
    handleSelectLetter(ASL_ALPHABET[prevIdx].letter);
  };

  const handleNextLetter = () => {
    const idx = ASL_ALPHABET.findIndex((item) => item.letter === currentLetter);
    const nextIdx = (idx + 1) % ASL_ALPHABET.length;
    handleSelectLetter(ASL_ALPHABET[nextIdx].letter);
  };

  const handleChangeMode = (mode) => {
    setActiveMode(mode);
    setDetectedLetter(null);
    setAccuracyScore(0);
    setConfidenceScore(0);
    setHoldProgress(0);
    holdStartTimeRef.current = null;
  };

  const handleResetStats = () => {
    const fresh = resetProgress();
    setProgress(fresh);
  };

  const sessionStats = {
    attemptsCount: progress.totalAttempts || 0,
    lettersAttempted: progress.completedLetters?.length || 0,
    bestAccuracy: progress.bestOverallAccuracy || 0
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
            canvasRef={canvasRef}
            isCameraActive={isCameraActive}
            isPracticeActive={isPracticeActive}
            isLoadingModel={isLoadingModel}
            onTogglePractice={handleTogglePractice}
            cameraError={cameraError}
            detectedLetter={detectedLetter}
            accuracyScore={accuracyScore}
            confidenceScore={confidenceScore}
            feedbackText={feedbackText}
          />
        ) : (
          <LearnMode
            currentLetter={currentLetter}
            onSelectLetter={handleSelectLetter}
            onPrevLetter={handlePrevLetter}
            onNextLetter={handleNextLetter}
            videoRef={videoRef}
            canvasRef={canvasRef}
            isCameraActive={isCameraActive}
            isPracticeActive={isPracticeActive}
            isLoadingModel={isLoadingModel}
            onTogglePractice={handleTogglePractice}
            cameraError={cameraError}
            accuracyScore={accuracyScore}
            feedbackText={feedbackText}
            holdProgress={holdProgress}
            isLetterSuccess={isLetterSuccess}
            completedLetters={progress.completedLetters}
            sessionStats={sessionStats}
            onResetStats={handleResetStats}
          />
        )}
      </main>

      <footer className="footer">
        SignSense — Browser ASL Learning App — Real-Time Hand Landmark Recognition & Academy
      </footer>
    </div>
  );
}
