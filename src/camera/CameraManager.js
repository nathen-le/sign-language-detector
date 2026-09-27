/**
 * CameraManager handles WebRTC camera stream initialization, video playback,
 * and media stream cleanups for SignSense.
 */
export class CameraManager {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.isActive = false;
  }

  /**
   * Initializes the user camera and binds stream to the provided HTMLVideoElement
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<MediaStream>}
   */
  async startCamera(videoElement) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Webcam access is not supported by your browser.');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      this.videoElement = videoElement;
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }

      this.isActive = true;
      return this.stream;
    } catch (error) {
      this.isActive = false;
      console.error('CameraManager error:', error);
      throw error;
    }
  }

  /**
   * Stops active camera stream tracks and resets video source
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.isActive = false;
  }

  /**
   * Checks whether the camera is active
   * @returns {boolean}
   */
  isStreaming() {
    return this.isActive && !!this.stream;
  }
}
