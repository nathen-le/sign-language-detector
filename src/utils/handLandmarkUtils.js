/**
 * Utility functions for 3D Hand Landmark processing, coordinate normalization,
 * feature extraction, skeleton canvas rendering, and movement analysis.
 */

// Landmark Index Constants
export const LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
};

// Hand Connections for Canvas Overlay
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Base
  [5, 9], [9, 13], [13, 17]
];

/**
 * Calculates Euclidean distance between two 3D or 2D landmark points
 */
export function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates angle (in degrees) at vertex point B between rays BA and BC
 */
export function angle(A, B, C) {
  const BA = { x: A.x - B.x, y: A.y - B.y, z: (A.z || 0) - (B.z || 0) };
  const BC = { x: C.x - B.x, y: C.y - B.y, z: (C.z || 0) - (B.z || 0) };

  const dot = BA.x * BC.x + BA.y * BC.y + BA.z * BC.z;
  const magBA = Math.sqrt(BA.x * BA.x + BA.y * BA.y + BA.z * BA.z);
  const magBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y + BC.z * BC.z);

  if (magBA * magBC === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cosTheta) * (180 / Math.PI);
}

/**
 * Normalizes 21 3D landmarks relative to Wrist (0) and Palm size (Wrist to Middle MCP)
 */
export function normalizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[LANDMARKS.WRIST];
  const middleMcp = landmarks[LANDMARKS.MIDDLE_MCP];
  const palmSize = distance(wrist, middleMcp) || 1;

  const normalized = landmarks.map((lm) => ({
    x: (lm.x - wrist.x) / palmSize,
    y: (lm.y - wrist.y) / palmSize,
    z: ((lm.z || 0) - (wrist.z || 0)) / palmSize
  }));

  return { normalized, palmSize };
}

/**
 * Extracts invariant geometric features from normalized hand landmarks
 */
export function extractHandFeatures(landmarks) {
  const normData = normalizeLandmarks(landmarks);
  if (!normData) return null;

  const pts = normData.normalized;
  const raw = landmarks;

  // Finger tip distances to Wrist
  const distIndexTip = distance(pts[LANDMARKS.INDEX_TIP], pts[LANDMARKS.WRIST]);
  const distMiddleTip = distance(pts[LANDMARKS.MIDDLE_TIP], pts[LANDMARKS.WRIST]);
  const distRingTip = distance(pts[LANDMARKS.RING_TIP], pts[LANDMARKS.WRIST]);
  const distPinkyTip = distance(pts[LANDMARKS.PINKY_TIP], pts[LANDMARKS.WRIST]);
  const distThumbTip = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.WRIST]);

  // Joint Angles (Flexion: PIP joints)
  const angleIndex = angle(pts[LANDMARKS.INDEX_MCP], pts[LANDMARKS.INDEX_PIP], pts[LANDMARKS.INDEX_TIP]);
  const angleMiddle = angle(pts[LANDMARKS.MIDDLE_MCP], pts[LANDMARKS.MIDDLE_PIP], pts[LANDMARKS.MIDDLE_TIP]);
  const angleRing = angle(pts[LANDMARKS.RING_MCP], pts[LANDMARKS.RING_PIP], pts[LANDMARKS.RING_TIP]);
  const anglePinky = angle(pts[LANDMARKS.PINKY_MCP], pts[LANDMARKS.PINKY_PIP], pts[LANDMARKS.PINKY_TIP]);
  const angleThumb = angle(pts[LANDMARKS.THUMB_CMC], pts[LANDMARKS.THUMB_MCP], pts[LANDMARKS.THUMB_TIP]);

  // Finger Extension Bools / Ratios
  // Extension ratio > 1.2 indicates extended finger
  const indexExtended = distIndexTip > 1.2 && angleIndex > 130;
  const middleExtended = distMiddleTip > 1.2 && angleMiddle > 130;
  const ringExtended = distRingTip > 1.1 && angleRing > 130;
  const pinkyExtended = distPinkyTip > 1.1 && anglePinky > 130;

  // Finger Curled Bools
  const indexCurled = distIndexTip < 0.95 || angleIndex < 110;
  const middleCurled = distMiddleTip < 0.95 || angleMiddle < 110;
  const ringCurled = distRingTip < 0.95 || angleRing < 110;
  const pinkyCurled = distPinkyTip < 0.95 || anglePinky < 110;

  // Distances between adjacent fingertips
  const distIndexMiddleTip = distance(pts[LANDMARKS.INDEX_TIP], pts[LANDMARKS.MIDDLE_TIP]);
  const distMiddleRingTip = distance(pts[LANDMARKS.MIDDLE_TIP], pts[LANDMARKS.RING_TIP]);
  const distRingPinkyTip = distance(pts[LANDMARKS.RING_TIP], pts[LANDMARKS.PINKY_TIP]);

  // Distances between Thumb tip and other fingertips/MCPs
  const distThumbIndexTip = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.INDEX_TIP]);
  const distThumbMiddleTip = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.MIDDLE_TIP]);
  const distThumbRingTip = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.RING_TIP]);
  const distThumbPinkyTip = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.PINKY_TIP]);
  const distThumbIndexMcp = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.INDEX_MCP]);
  const distThumbMiddleMcp = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.MIDDLE_MCP]);
  const distThumbRingMcp = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.RING_MCP]);
  const distThumbPinkyMcp = distance(pts[LANDMARKS.THUMB_TIP], pts[LANDMARKS.PINKY_MCP]);

  // Crossing (e.g. R sign: Index tip crossed over Middle tip)
  const isIndexMiddleCrossed = pts[LANDMARKS.INDEX_TIP].x > pts[LANDMARKS.MIDDLE_TIP].x + 0.05 &&
    distIndexMiddleTip < 0.5;

  // Hand Direction Vector (Wrist to Middle MCP)
  const dirY = pts[LANDMARKS.MIDDLE_MCP].y - pts[LANDMARKS.WRIST].y; // Negative means pointing up in canvas coords
  const dirX = pts[LANDMARKS.MIDDLE_MCP].x - pts[LANDMARKS.WRIST].x;

  let handOrientation = 'UPRIGHT';
  if (dirY > 0.4) handOrientation = 'DOWNWARD';
  else if (Math.abs(dirX) > 0.6) handOrientation = dirX > 0 ? 'POINTING_RIGHT' : 'POINTING_LEFT';

  return {
    pts,
    palmSize: normData.palmSize,
    distIndexTip, distMiddleTip, distRingTip, distPinkyTip, distThumbTip,
    angleIndex, angleMiddle, angleRing, anglePinky, angleThumb,
    indexExtended, middleExtended, ringExtended, pinkyExtended,
    indexCurled, middleCurled, ringCurled, pinkyCurled,
    distIndexMiddleTip, distMiddleRingTip, distRingPinkyTip,
    distThumbIndexTip, distThumbMiddleTip, distThumbRingTip, distThumbPinkyTip,
    distThumbIndexMcp, distThumbMiddleMcp, distThumbRingMcp, distThumbPinkyMcp,
    isIndexMiddleCrossed,
    handOrientation,
    raw
  };
}

/**
 * Draws hand landmarks and connecting skeleton on a 2D canvas context
 */
export function drawSkeleton(ctx, landmarks, width, height) {
  if (!ctx || !landmarks || landmarks.length < 21) return;

  ctx.clearRect(0, 0, width, height);

  // Convert landmarks to pixel coordinates
  const points = landmarks.map((lm) => ({
    x: lm.x * width,
    y: lm.y * height
  }));

  // Draw bone lines
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#6366f1'; // Primary indigo color
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  HAND_CONNECTIONS.forEach(([i, j]) => {
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[j].x, points[j].y);
    ctx.stroke();
  });

  // Draw joint keypoints
  points.forEach((pt, index) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, index === 0 ? 7 : 5, 0, 2 * Math.PI);

    if (index === 4 || index === 8 || index === 12 || index === 16 || index === 20) {
      // Fingertips: Cyan accent
      ctx.fillStyle = '#06b6d4';
    } else if (index === 0) {
      // Wrist: Amber accent
      ctx.fillStyle = '#f59e0b';
    } else {
      // Joints: Emerald accent
      ctx.fillStyle = '#10b981';
    }

    ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}
