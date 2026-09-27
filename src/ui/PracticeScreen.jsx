import React from 'react';
import { TargetLetter } from './TargetLetter';
import { WebcamContainer } from './WebcamContainer';
import { DetectedLetter } from './DetectedLetter';
import { AccuracyMeter } from './AccuracyMeter';
import { FeedbackArea } from './FeedbackArea';
import { ProgressIndicator } from './ProgressIndicator';
import { Controls } from './Controls';

export function PracticeScreen({
  currentLetter,
  onSelectLetter,
  onNextLetter,
  videoRef,
  isCameraActive,
  isPracticeActive,
  onTogglePractice,
  cameraError,
  detectedLetter,
  accuracyScore,
  feedbackText,
  sessionStats,
  onResetStats
}) {
  return (
    <div className="practice-screen">
      <div className="left-column">
        <TargetLetter
          currentLetter={currentLetter}
          onSelectLetter={onSelectLetter}
        />

        <WebcamContainer
          videoRef={videoRef}
          isCameraActive={isCameraActive}
          isPracticeActive={isPracticeActive}
          error={cameraError}
        />

        <Controls
          isPracticeActive={isPracticeActive}
          onTogglePractice={onTogglePractice}
          onNextLetter={onNextLetter}
          isCameraActive={isCameraActive}
        />
      </div>

      <div className="right-column">
        <DetectedLetter
          detectedLetter={detectedLetter}
          isPracticeActive={isPracticeActive}
        />

        <AccuracyMeter
          accuracyScore={accuracyScore}
        />

        <FeedbackArea
          feedbackText={feedbackText}
          isPracticeActive={isPracticeActive}
          currentLetter={currentLetter}
        />

        <ProgressIndicator
          sessionStats={sessionStats}
          onResetStats={onResetStats}
        />
      </div>
    </div>
  );
}
