/**
 * CameraManager handles WebRTC camera stream lifecycle, video element binding,
 * constraint fallbacks for mobile browsers, HTTPS permission handling, and track cleanup.
 */
export class CameraManager {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.isActive = false;
  }

  /**
   * Initializes webcam stream with robust fallback constraints and iOS/Android support
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<MediaStream>}
   */
  async startCamera(videoElement) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Webcam access is not supported by your browser or environment. Please use HTTPS or a supported browser.');
    }

    // Stop existing stream before starting a new one
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
      // 2. Standard user-facing camera
      {
        video: {
          facingMode: 'user'
        },
        audio: false
      },
      // 3. Generic video constraint
      {
        video: true,
        audio: false
      }
    ];

    let lastError = null;

    for (const constraints of constraintsList) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        break; // Stream acquired
      } catch (err) {
        lastError = err;
        console.warn('getUserMedia constraint failed, trying fallback:', constraints, err);
      }
    }

    if (!this.stream) {
      this.isActive = false;
      if (lastError && (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError')) {
        throw new Error('Camera access denied. Please grant camera permissions in your browser address bar.');
      } else if (lastError && (lastError.name === 'NotFoundError' || lastError.name === 'DevicesNotFoundError')) {
        throw new Error('No webcam found on this device.');
      } else if (lastError && (lastError.name === 'NotReadableError' || lastError.name === 'TrackStartError')) {
        throw new Error('Webcam is already in use by another application.');
      } else {
        throw new Error(lastError?.message || 'Could not start webcam stream.');
      }
    }

    this.videoElement = videoElement;

    if (this.videoElement) {
      // Set essential attributes for iOS Safari and mobile browser autoplay policies
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('webkit-playsinline', 'true');
      this.videoElement.setAttribute('muted', 'true');
      this.videoElement.muted = true;
      this.videoElement.srcObject = this.stream;

      try {
        await this.videoElement.play();
      } catch (playErr) {
        console.warn('videoElement.play() threw error, retrying on loadedmetadata:', playErr);
        await new Promise((resolve) => {
          this.videoElement.onloadedmetadata = () => {
            this.videoElement.play().then(resolve).catch(resolve);
          };
          setTimeout(resolve, 1000);
        });
      }
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
   * Checks whether camera stream is active
   * @returns {boolean}
   */
  isStreaming() {
    return this.isActive && !!this.stream;
  }
}
