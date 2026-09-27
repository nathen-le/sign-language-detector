import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

/**
 * HandTracker manages MediaPipe Tasks Vision initialization and hand landmark detection pipeline.
 */
export class HandTracker {
  constructor() {
    this.handLandmarker = null;
    this.isInitialized = false;
    this.isInitializing = false;
  }

  /**
   * Initializes the MediaPipe HandLandmarker instance with WASM assets
   */
  async initialize() {
    if (this.isInitialized || this.isInitializing) return;

    this.isInitializing = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 1
      });

      this.isInitialized = true;
      this.isInitializing = false;
      console.log('MediaPipe HandLandmarker initialized successfully.');
    } catch (error) {
      this.isInitializing = false;
      console.error('Failed to initialize HandLandmarker:', error);
      throw error;
    }
  }

  /**
   * Detects hand landmarks in a given video frame at timestamp
   * @param {HTMLVideoElement} videoElement
   * @param {number} timestamp
   * @returns {Object|null}
   */
  detectForVideo(videoElement, timestamp) {
    if (!this.isInitialized || !this.handLandmarker || !videoElement) {
      return null;
    }

    try {
      return this.handLandmarker.detectForVideo(videoElement, timestamp);
    } catch (err) {
      console.error('Error during hand landmark detection:', err);
      return null;
    }
  }

  /**
   * Release resources
   */
  close() {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
      this.isInitialized = false;
    }
  }
}
