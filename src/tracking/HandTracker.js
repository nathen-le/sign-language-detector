import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { drawSkeleton } from '../utils/handLandmarkUtils';

/**
 * HandTracker manages MediaPipe Tasks Vision HandLandmarker initialization,
 * local WASM fallback loading, GPU/CPU delegate fallback, video frame detection,
 * and 21 landmark canvas skeleton overlay rendering.
 */
export class HandTracker {
  constructor() {
    this.handLandmarker = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.initError = null;
  }

  /**
   * Initializes MediaPipe HandLandmarker with robust local WASM & CPU fallback
   */
  async initialize() {
    if (this.isInitialized || this.isInitializing) return;

    this.isInitializing = true;
    this.initError = null;

    let vision = null;

    // 1. Resolve Vision Tasks WASM binaries (Local host path first, then CDN fallback)
    try {
      vision = await FilesetResolver.forVisionTasks('/wasm');
    } catch (localErr) {
      console.warn('Local /wasm load failed, attempting CDN fallback:', localErr);
      try {
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
      } catch (cdnErr) {
        this.isInitializing = false;
        this.initError = 'Failed to load MediaPipe WASM assets from both local domain and CDN.';
        console.error('HandTracker WASM load error:', cdnErr);
        throw new Error(this.initError);
      }
    }

    const modelUrl = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

    // 2. Create HandLandmarker (Try GPU delegate first, fallback to CPU delegate)
    try {
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: modelUrl,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 1
      });
    } catch (gpuError) {
      console.warn('GPU delegate failed on this browser/device, retrying with CPU delegate:', gpuError);
      try {
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelUrl,
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 1
        });
      } catch (cpuError) {
        this.isInitializing = false;
        this.initError = 'Failed to initialize HandLandmarker with GPU and CPU delegates.';
        console.error('HandTracker creation error:', cpuError);
        throw new Error(this.initError);
      }
    }

    this.isInitialized = true;
    this.isInitializing = false;
    console.log('MediaPipe HandLandmarker successfully initialized.');
  }

  /**
   * Detects 21 hand keypoints from a video frame
   * @param {HTMLVideoElement} videoElement
   * @param {number} timestamp
   * @returns {Object|null} Detection result containing landmarks array
   */
  detectForVideo(videoElement, timestamp) {
    if (!this.isInitialized || !this.handLandmarker || !videoElement) {
      return null;
    }

    if (videoElement.readyState < 2 || videoElement.paused || videoElement.ended) {
      return null;
    }

    try {
      const result = this.handLandmarker.detectForVideo(videoElement, timestamp);
      if (result && result.landmarks && result.landmarks.length > 0) {
        return result.landmarks[0]; // Primary detected hand
      }
      return null;
    } catch (err) {
      console.warn('HandLandmarker detectForVideo warning:', err);
      return null;
    }
  }

  /**
   * Draws 21 landmark skeleton onto target HTMLCanvasElement
   * @param {HTMLCanvasElement} canvasElement
   * @param {Array} landmarks 21 hand landmarks
   */
  drawLandmarksOnCanvas(canvasElement, landmarks) {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    if (!landmarks) {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      return;
    }

    drawSkeleton(ctx, landmarks, canvasElement.width, canvasElement.height);
  }

  /**
   * Release MediaPipe landmarker resources
   */
  close() {
    if (this.handLandmarker) {
      try {
        this.handLandmarker.close();
      } catch (e) {
        console.warn('Error closing HandLandmarker:', e);
      }
      this.handLandmarker = null;
      this.isInitialized = false;
    }
  }
}
