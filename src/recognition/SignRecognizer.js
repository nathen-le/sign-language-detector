import { extractHandFeatures, LANDMARKS } from '../utils/handLandmarkUtils';

/**
 * SignRecognizer performs invariant feature extraction and heuristic/template matching
 * to classify hand landmarks into all 26 ASL alphabet signs (A–Z), including dynamic
 * movement detection for 'J' and 'Z'.
 */
export class SignRecognizer {
  constructor() {
    this.historyBuffer = []; // Sliding buffer for temporal smoothing & motion tracking
    this.historyMaxLength = 20;
    this.smoothedLetter = null;
    this.smoothingScores = {};
  }

  /**
   * Recognizes ASL letter sign from 21 MediaPipe hand landmarks
   * @param {Array} landmarks Array of 21 3D hand keypoints
   * @returns {Object|null} { letter, confidence, poseQuality, scores, isMovement }
   */
  recognize(landmarks) {
    if (!landmarks || landmarks.length < 21) {
      this.resetHistory();
      return null;
    }

    const features = extractHandFeatures(landmarks);
    if (!features) return null;

    // Push frame data to motion history buffer
    this.recordHistoryFrame(features);

    // Compute letter scores for static templates (A-Z)
    const rawScores = this.evaluateStaticTemplates(features);

    // Check motion-based templates for J and Z
    const motionResult = this.evaluateMotionTemplates(features);
    if (motionResult) {
      rawScores[motionResult.letter] = Math.max(rawScores[motionResult.letter] || 0, motionResult.score);
    }

    // Temporal Smoothing over recent frames
    const smoothedScores = this.applyTemporalSmoothing(rawScores);

    // Find top predicted letter
    let topLetter = null;
    let topScore = 0;
    let runnerUpScore = 0;

    Object.entries(smoothedScores).forEach(([letter, score]) => {
      if (score > topScore) {
        runnerUpScore = topScore;
        topScore = score;
        topLetter = letter;
      } else if (score > runnerUpScore) {
        runnerUpScore = score;
      }
    });

    // Confidence threshold (55% min)
    if (!topLetter || topScore < 55) {
      return {
        letter: null,
        confidence: 0,
        poseQuality: 0,
        status: 'uncertain',
        message: 'Position hand clearly facing the camera'
      };
    }

    // Recognition Confidence: certainty margin over runner up
    const confidence = Math.min(99, Math.round(topScore));

    // Pose Quality: how closely the current pose aligns with the ideal template of topLetter
    const poseQuality = Math.min(100, Math.round(rawScores[topLetter] || topScore));

    return {
      letter: topLetter,
      confidence,
      poseQuality,
      status: topScore >= 75 ? 'confident' : 'moderate',
      rawScores
    };
  }

  /**
   * Evaluates landmark features against all 26 static ASL letter rules
   */
  evaluateStaticTemplates(f) {
    const scores = {};

    const {
      indexExtended, middleExtended, ringExtended, pinkyExtended,
      indexCurled, middleCurled, ringCurled, pinkyCurled,
      angleIndex, angleMiddle, angleRing, anglePinky, angleThumb,
      distIndexMiddleTip, distMiddleRingTip, distRingPinkyTip,
      distThumbIndexTip, distThumbMiddleTip, distThumbRingTip, distThumbPinkyTip,
      distThumbIndexMcp, distThumbMiddleMcp, distThumbRingMcp, distThumbPinkyMcp,
      isIndexMiddleCrossed, handOrientation
    } = f;

    // A: Fist with thumb resting upright beside index finger
    if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
      let scoreA = 70;
      if (distThumbIndexMcp < 0.45 && angleThumb > 110) scoreA += 25;
      if (distThumbMiddleMcp > 0.4) scoreA += 5; // Thumb on side of index, not front
      scores['A'] = Math.min(98, scoreA);
    }

    // B: Open palm facing forward, fingers straight together, thumb tucked across palm
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      if (distIndexMiddleTip < 0.35 && distMiddleRingTip < 0.35 && distRingPinkyTip < 0.35) {
        let scoreB = 75;
        if (distThumbMiddleMcp < 0.5 || distThumbRingMcp < 0.5) scoreB += 23; // Thumb tucked
        if (handOrientation === 'UPRIGHT') scoreB += 2;
        scores['B'] = Math.min(99, scoreB);
      }
    }

    // C: Curved fingers and thumb forming C shape
    if (!indexExtended && !indexCurled && !middleExtended && !middleCurled) {
      if (angleIndex > 100 && angleIndex < 155 && angleMiddle > 100 && angleMiddle < 155) {
        let scoreC = 65;
        if (distThumbIndexTip > 0.5 && distThumbIndexTip < 1.1) scoreC += 25;
        scores['C'] = Math.min(95, scoreC);
      }
    }

    // D: Index extended straight up, middle/ring/pinky touch thumb tip
    if (indexExtended && middleCurled && ringCurled && pinkyCurled) {
      let scoreD = 70;
      if (distThumbMiddleTip < 0.45 || distThumbRingTip < 0.45) scoreD += 25;
      scores['D'] = Math.min(98, scoreD);
    }

    // E: All fingers curled down touching thumb, thumb tucked underneath
    if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
      if (distThumbIndexTip < 0.4 && distThumbMiddleTip < 0.4) {
        scores['E'] = 92;
      }
    }

    // F: Index tip touches thumb tip (O-ring), middle/ring/pinky extended up & fanned
    if (middleExtended && ringExtended && pinkyExtended && distThumbIndexTip < 0.35) {
      let scoreF = 80;
      if (distMiddleRingTip > 0.25) scoreF += 18;
      scores['F'] = Math.min(99, scoreF);
    }

    // G: Index and thumb extended horizontally parallel out to side
    if (handOrientation === 'POINTING_LEFT' || handOrientation === 'POINTING_RIGHT' || handOrientation === 'UPRIGHT') {
      if (indexExtended && middleCurled && ringCurled && pinkyCurled) {
        if (distThumbIndexTip > 0.3 && distThumbIndexTip < 0.7) {
          scores['G'] = 88;
        }
      }
    }

    // H: Index and middle extended together horizontally
    if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
      if (distIndexMiddleTip < 0.3) {
        let scoreH = 75;
        if (handOrientation === 'POINTING_LEFT' || handOrientation === 'POINTING_RIGHT') scoreH += 20;
        scores['H'] = Math.min(96, scoreH);
      }
    }

    // I: Pinky extended, index/middle/ring curled
    if (pinkyExtended && indexCurled && middleCurled && ringCurled) {
      let scoreI = 80;
      if (distThumbIndexMcp < 0.5) scoreI += 18;
      scores['I'] = Math.min(98, scoreI);
    }

    // K: Index up, middle forward/angled in V, thumb tip at middle finger PIP joint
    if (indexExtended && angleMiddle > 110 && ringCurled && pinkyCurled) {
      if (distIndexMiddleTip > 0.35) {
        let scoreK = 75;
        if (distThumbMiddleMcp < 0.45 || distThumbIndexMcp < 0.45) scoreK += 22;
        scores['K'] = Math.min(97, scoreK);
      }
    }

    // L: Index extended up, thumb extended out horizontally at 90 deg
    if (indexExtended && middleCurled && ringCurled && pinkyCurled) {
      if (distThumbIndexMcp > 0.7 && angleThumb > 120) {
        scores['L'] = 98;
      }
    }

    // M: Thumb tucked under index, middle, and ring fingers
    if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
      if (distThumbPinkyMcp < 0.45 && distThumbRingMcp < 0.45) {
        scores['M'] = 90;
      }
    }

    // N: Thumb tucked under index and middle fingers
    if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
      if (distThumbRingMcp < 0.45 && distThumbPinkyMcp > 0.4) {
        scores['N'] = 88;
      }
    }

    // O: All fingertips touch thumb tip in rounded circle
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      if (distThumbIndexTip < 0.38 && distThumbMiddleTip < 0.38 && distThumbRingTip < 0.38) {
        scores['O'] = 96;
      }
    }

    // P: K shape pointing straight down
    if (handOrientation === 'DOWNWARD' && indexExtended && angleMiddle > 100) {
      scores['P'] = 92;
    }

    // Q: G shape pointing straight down
    if (handOrientation === 'DOWNWARD' && indexExtended && middleCurled && ringCurled) {
      if (distThumbIndexTip > 0.25 && distThumbIndexTip < 0.65) {
        scores['Q'] = 90;
      }
    }

    // R: Index and middle extended, crossed over each other
    if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
      if (isIndexMiddleCrossed || distIndexMiddleTip < 0.25) {
        let scoreR = 80;
        if (isIndexMiddleCrossed) scoreR += 18;
        scores['R'] = Math.min(98, scoreR);
      }
    }

    // S: Fist with thumb wrapped across front of fingers (knuckles)
    if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
      if (distThumbIndexMcp < 0.4 && distThumbMiddleMcp < 0.45) {
        scores['S'] = 94;
      }
    }

    // T: Thumb tucked under index finger only
    if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
      if (distThumbMiddleMcp < 0.4 && distThumbRingMcp > 0.4) {
        scores['T'] = 88;
      }
    }

    // U: Index & Middle extended straight up together (no gap)
    if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
      if (distIndexMiddleTip < 0.28 && !isIndexMiddleCrossed) {
        scores['U'] = 96;
      }
    }

    // V: Index & Middle extended straight up spread in V shape
    if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
      if (distIndexMiddleTip >= 0.38) {
        scores['V'] = 97;
      }
    }

    // W: Index, Middle, Ring extended upright spread in W shape
    if (indexExtended && middleExtended && ringExtended && pinkyCurled) {
      if (distIndexMiddleTip > 0.25 && distMiddleRingTip > 0.25) {
        let scoreW = 82;
        if (distThumbPinkyTip < 0.45) scoreW += 16;
        scores['W'] = Math.min(98, scoreW);
      }
    }

    // X: Index finger hooked/clawed
    if (angleIndex > 80 && angleIndex < 135 && middleCurled && ringCurled && pinkyCurled) {
      if (!indexExtended) {
        scores['X'] = 92;
      }
    }

    // Y: Thumb and Pinky extended out wide (shaka)
    if (pinkyExtended && indexCurled && middleCurled && ringCurled) {
      if (distThumbIndexMcp > 0.7 && angleThumb > 120) {
        scores['Y'] = 98;
      }
    }

    return scores;
  }

  /**
   * Motion tracking for dynamic letters J and Z
   */
  evaluateMotionTemplates(currentFeatures) {
    if (this.historyBuffer.length < 8) return null;

    // Check J: Pinky extended, tip tracing hook path
    if (currentFeatures.pinkyExtended && currentFeatures.indexCurled) {
      const pinkyPath = this.historyBuffer.map(f => f.pts[LANDMARKS.PINKY_TIP]);
      if (this.detectHookMotion(pinkyPath)) {
        return { letter: 'J', score: 95 };
      }
    }

    // Check Z: Index extended, tip tracing Z path
    if (currentFeatures.indexExtended && currentFeatures.middleCurled) {
      const indexPath = this.historyBuffer.map(f => f.pts[LANDMARKS.INDEX_TIP]);
      if (this.detectZMotion(indexPath)) {
        return { letter: 'Z', score: 95 };
      }
    }

    return null;
  }

  detectHookMotion(path) {
    if (path.length < 8) return false;
    let minY = path[0].y;
    let maxY = path[0].y;
    let startX = path[0].x;
    let endX = path[path.length - 1].x;

    path.forEach(p => {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const deltaY = maxY - minY;
    const deltaX = Math.abs(endX - startX);
    return deltaY > 0.15 && deltaX > 0.08;
  }

  detectZMotion(path) {
    if (path.length < 10) return false;
    let minX = path[0].x, maxX = path[0].x;
    let minY = path[0].y, maxY = path[0].y;

    path.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    return (maxX - minX) > 0.15 && (maxY - minY) > 0.12;
  }

  recordHistoryFrame(features) {
    this.historyBuffer.push(features);
    if (this.historyBuffer.length > this.historyMaxLength) {
      this.historyBuffer.shift();
    }
  }

  applyTemporalSmoothing(rawScores) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    letters.forEach(letter => {
      const currentVal = rawScores[letter] || 0;
      const prevVal = this.smoothingScores[letter] || 0;
      // Exponential moving average (alpha = 0.45)
      this.smoothingScores[letter] = prevVal * 0.55 + currentVal * 0.45;
    });

    return { ...this.smoothingScores };
  }

  resetHistory() {
    this.historyBuffer = [];
    this.smoothingScores = {};
  }
}
