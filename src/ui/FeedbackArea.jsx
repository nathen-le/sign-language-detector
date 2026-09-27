import React from 'react';
import { MessageSquareText, Info } from 'lucide-react';

export function FeedbackArea({ feedbackText = null, isPracticeActive = false, currentLetter = 'A' }) {
  const defaultFeedback = isPracticeActive
    ? `Hold your hand steady in camera view to practice ASL Letter ${currentLetter}. Feedback will update in real time once sign recognition activates.`
    : `Click "Start Practice" to begin your practice session for Letter ${currentLetter}.`;

  return (
    <div className="card">
      <div className="card-title">
        <MessageSquareText size={20} />
        <span>Real-Time Feedback</span>
      </div>

      <div className="feedback-box">
        <Info size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
        <p className="feedback-text">
          {feedbackText || defaultFeedback}
        </p>
      </div>
    </div>
  );
}
