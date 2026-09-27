/**
 * CameraManager handles WebRTC camera stream lifecycle, video element binding,
 * resolution fallbacks, mobile browser compatibility, and cleanup.
 */
export class CameraManager {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.isActive = false;
  }

  /**
   * Initializes the webcam stream and binds it to the provided HTMLVideoElement
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<MediaStream>}
   */
  async startCamera(videoElement) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Webcam access is not supported by your browser or environment.');
    }

    // Stop existing stream if running
    this.stopCamera();

    const constraintsList = [
      // 1. Ideal HD constraints
      {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      },
      // 2. Mobile fallback constraints
      {
        video: {
          facingMode: 'user'
        },
        audio: false
      },
      // 3. Generic video constraint fallback
      {
        video: true,
        audio: false
      }
    ];

    let lastError = null;

    for (const constraints of constraintsList) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        break; // Successfully obtained stream
      } catch (err) {
        lastError = err;
        console.warn('getUserMedia constraint failed, trying fallback:', constraints, err);
      }
    }

    if (!this.stream) {
      this.isActive = false;
      if (lastError && (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError')) {
        throw new Error('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (lastError && (lastError.name === 'NotFoundError' || lastError.name === 'DevicesNotFoundError')) {
        throw new Error('No webcam found on your device.');
      } else {
        throw new Error(lastError?.message || 'Could not start webcam feed.');
      }
    }

    this.videoElement = videoElement;

    if (this.videoElement) {
      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('muted', 'true');
      this.videoElement.muted = true;

      // Wait until video data has loaded to start playback safely
      await new Promise((resolve, reject) => {
        const onLoaded = () => {
          this.videoElement.removeEventListener('loadeddata', onLoaded);
          this.videoElement.play().then(resolve).catch(reject);
        };
        if (this.videoElement.readyState >= 2) {
          this.videoElement.play().then(resolve).catch(reject);
        } else {
          this.videoElement.addEventListener('loadeddata', onLoaded);
        }
      });
    }

    this.isActive = true;
    return this.stream;
  }

  /**
   * Stops active camera stream tracks and resets video source
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping camera track:', e);
        }
      });
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.isActive = false;
  }

  /**
   * Checks whether the camera is actively streaming
   * @returns {boolean}
   */
  isStreaming() {
    return this.isActive && !!this.stream;
  }
}
