import { extractHandFeatures } from '../utils/handLandmarkUtils';
import { ASL_ALPHABET } from '../ui/ASLAlphabetData';

/**
 * ScoreCalculator computes target match accuracy scores (0-100%) and generates
 * actionable pose improvement suggestions based on 3D hand keypoint measurements.
 */
export class ScoreCalculator {
  /**
   * Calculates target letter similarity score (0 to 100)
   * @param {Array} landmarks 21 MediaPipe hand keypoints
   * @param {string} targetLetter ASL letter target ('A'..'Z')
   * @returns {number} Score from 0 to 100
   */
  calculateAccuracy(landmarks, targetLetter) {
    if (!landmarks || landmarks.length < 21 || !targetLetter) {
      return 0;
    }

    const f = extractHandFeatures(landmarks);
    if (!f) return 0;

    const letter = targetLetter.toUpperCase();

    switch (letter) {
      case 'A': {
        let score = 50;
        if (f.indexCurled) score += 12;
        if (f.middleCurled) score += 12;
        if (f.ringCurled) score += 13;
        if (f.pinkyCurled) score += 13;
        if (f.distThumbIndexMcp < 0.45 && f.angleThumb > 110) score += 10;
        return Math.min(100, score);
      }
      case 'B': {
        let score = 40;
        if (f.indexExtended) score += 15;
        if (f.middleExtended) score += 15;
        if (f.ringExtended) score += 15;
        if (f.pinkyExtended) score += 15;
        if (f.distIndexMiddleTip < 0.35) score += 5;
        if (f.distThumbMiddleMcp < 0.5) score += 15;
        return Math.min(100, score);
      }
      case 'C': {
        let score = 40;
        if (f.angleIndex > 100 && f.angleIndex < 155) score += 20;
        if (f.angleMiddle > 100 && f.angleMiddle < 155) score += 20;
        if (f.distThumbIndexTip > 0.4 && f.distThumbIndexTip < 1.1) score += 20;
        return Math.min(100, score);
      }
      case 'D': {
        let score = 40;
        if (f.indexExtended) score += 30;
        if (f.middleCurled) score += 10;
        if (f.ringCurled) score += 10;
        if (f.pinkyCurled) score += 10;
        if (f.distThumbMiddleTip < 0.45) score += 10;
        return Math.min(100, score);
      }
      case 'F': {
        let score = 40;
        if (f.distThumbIndexTip < 0.35) score += 30;
        if (f.middleExtended) score += 10;
        if (f.ringExtended) score += 10;
        if (f.pinkyExtended) score += 10;
        return Math.min(100, score);
      }
      case 'I': {
        let score = 40;
        if (f.pinkyExtended) score += 35;
        if (f.indexCurled) score += 10;
        if (f.middleCurled) score += 10;
        if (f.ringCurled) score += 10;
        return Math.min(100, score);
      }
      case 'L': {
        let score = 40;
        if (f.indexExtended) score += 30;
        if (f.distThumbIndexMcp > 0.7) score += 30;
        if (f.middleCurled && f.ringCurled && f.pinkyCurled) score += 15;
        return Math.min(100, score);
      }
      case 'U': {
        let score = 40;
        if (f.indexExtended) score += 20;
        if (f.middleExtended) score += 20;
        if (f.distIndexMiddleTip < 0.28) score += 20;
        if (f.ringCurled && f.pinkyCurled) score += 15;
        return Math.min(100, score);
      }
      case 'V': {
        let score = 40;
        if (f.indexExtended) score += 20;
        if (f.middleExtended) score += 20;
        if (f.distIndexMiddleTip >= 0.38) score += 20;
        if (f.ringCurled && f.pinkyCurled) score += 15;
        return Math.min(100, score);
      }
      case 'W': {
        let score = 40;
        if (f.indexExtended) score += 20;
        if (f.middleExtended) score += 20;
        if (f.ringExtended) score += 20;
        if (f.distIndexMiddleTip > 0.25) score += 10;
        return Math.min(100, score);
      }
      case 'Y': {
        let score = 40;
        if (f.pinkyExtended) score += 30;
        if (f.distThumbIndexMcp > 0.7) score += 30;
        if (f.indexCurled && f.middleCurled && f.ringCurled) score += 15;
        return Math.min(100, score);
      }
      default: {
        // Generic template match for other letters
        let score = 50;
        if (f.handOrientation === 'UPRIGHT') score += 15;
        if (f.palmSize > 0.1) score += 15;
        return Math.min(95, score);
      }
    }
  }

  /**
   * Generates specific, landmark-supported suggestions for pose correction
   * @param {Array} landmarks 21 MediaPipe hand keypoints
   * @param {string} targetLetter ASL letter target ('A'..'Z')
   * @returns {string} Targeted feedback text
   */
  generateFeedback(landmarks, targetLetter) {
    if (!landmarks || landmarks.length < 21) {
      return 'Position your hand clearly within the camera frame with good lighting.';
    }

    const f = extractHandFeatures(landmarks);
    if (!f) {
      return 'Keep your hand steady in camera view.';
    }

    const letter = (targetLetter || 'A').toUpperCase();

    // Hand Orientation Feedback
    if (f.handOrientation === 'DOWNWARD' && !['P', 'Q'].includes(letter)) {
      return 'Rotate your hand upward so your fingers point toward the ceiling.';
    }

    // Letter-Specific Corrections based on measured landmark differences
    if (letter === 'B') {
      if (!f.indexExtended) return 'Straighten your index finger completely.';
      if (!f.middleExtended) return 'Straighten your middle finger up with your index finger.';
      if (!f.ringExtended || !f.pinkyExtended) return 'Extend all four fingers straight up.';
      if (f.distIndexMiddleTip > 0.35) return 'Press your four fingers tightly together with no gaps.';
      if (f.distThumbMiddleMcp > 0.5) return 'Tuck your thumb horizontally across your palm.';
    }

    if (letter === 'A') {
      if (f.indexExtended || f.middleExtended) return 'Fold all four fingers tightly down into a fist.';
      if (f.distThumbIndexMcp > 0.5) return 'Place your thumb upright resting against the side of your index finger.';
    }

    if (letter === 'S') {
      if (f.indexExtended) return 'Make a tight fist with all four fingers curled down.';
      if (f.distThumbIndexMcp > 0.45) return 'Fold your thumb horizontally across the front of your knuckles.';
    }

    if (letter === 'U') {
      if (!f.indexExtended || !f.middleExtended) return 'Extend your index and middle fingers straight up.';
      if (f.distIndexMiddleTip >= 0.35) return 'Bring your index and middle fingers together so there is no gap.';
      if (f.ringExtended || f.pinkyExtended) return 'Curl your ring finger and pinky into your palm.';
    }

    if (letter === 'V') {
      if (!f.indexExtended || !f.middleExtended) return 'Extend your index and middle fingers straight up.';
      if (f.distIndexMiddleTip < 0.35) return 'Spread your index and middle fingers farther apart into a V shape.';
      if (f.ringExtended || f.pinkyExtended) return 'Curl your ring finger and pinky into your palm.';
    }

    if (letter === 'W') {
      if (!f.indexExtended || !f.middleExtended || !f.ringExtended) return 'Extend index, middle, and ring fingers straight up.';
      if (f.pinkyExtended) return 'Touch your thumb tip to your pinky finger.';
    }

    if (letter === 'L') {
      if (!f.indexExtended) return 'Straighten your index finger straight up.';
      if (f.distThumbIndexMcp < 0.6) return 'Extend your thumb out sideways at a 90-degree angle.';
      if (f.middleExtended || f.ringExtended) return 'Curl your middle, ring, and pinky fingers into your palm.';
    }

    if (letter === 'I' || letter === 'J') {
      if (!f.pinkyExtended) return 'Extend your pinky finger straight up into the air.';
      if (f.indexExtended || f.middleExtended) return 'Curl index, middle, and ring fingers into your palm.';
      if (letter === 'J') return 'Trace a curved "J" path in the air with your pinky tip.';
    }

    if (letter === 'Y') {
      if (!f.pinkyExtended) return 'Extend your pinky finger out wide.';
      if (f.distThumbIndexMcp < 0.6) return 'Extend your thumb out as far as possible.';
      if (f.indexExtended || f.middleExtended) return 'Curl middle three fingers firmly against your palm.';
    }

    if (letter === 'F') {
      if (f.distThumbIndexTip > 0.4) return 'Touch the tip of your index finger to your thumb tip to form a circle.';
      if (!f.middleExtended || !f.ringExtended || !f.pinkyExtended) return 'Fan out your remaining three fingers straight upward.';
    }

    if (letter === 'R') {
      if (!f.isIndexMiddleCrossed) return 'Cross your index finger over top of your middle finger.';
    }

    if (letter === 'Z') {
      return 'Point your index finger and trace a "Z" pattern in the air.';
    }

    // Default positive guidance
    const letterData = ASL_ALPHABET.find(item => item.letter === letter);
    if (letterData && letterData.tip) {
      return `Tip for Letter ${letter}: ${letterData.tip}`;
    }

    return `Adjust your hand position to match ASL Letter ${letter}.`;
  }
}
