/**
 * VideoPlayer - Controls video playback and monitors ad events
 */

class VideoPlayer {
  constructor(videoElement, tracker) {
    this.video = videoElement;
    this.tracker = tracker;
    this.clickOverlay = document.getElementById('video-click-overlay');
    this.simidIframe = document.getElementById('simid-iframe');
    this.isSIMID = false; // Track if current ad is SIMID
    this.vastData = null;
    this.trackingURLs = null;
    this.quartilesFired = {
      start: false,
      firstQuartile: false,
      midpoint: false,
      thirdQuartile: false,
      complete: false
    };
    this.eventLog = [];
    this.listeners = [];
    this.overlayListeners = [];
  }

  /**
   * Load VAST ad into player
   * @param {Object} vastData - Parsed VAST data
   * @param {Object} trackingURLs - Tracking URLs from VAST
   */
  loadAd(vastData, trackingURLs) {
    this.vastData = vastData;
    this.trackingURLs = trackingURLs;
    this.quartilesFired = {
      start: false,
      firstQuartile: false,
      midpoint: false,
      thirdQuartile: false,
      complete: false
    };

    // Get the first inline ad
    const ad = vastData.ads.find(a => a.type === 'inline');
    if (!ad) {
      this.logEvent('error', 'No inline ad found in VAST');
      return false;
    }

    // Get linear creative
    const creative = ad.inline.creatives.find(c => c.type === 'linear');
    if (!creative) {
      this.logEvent('error', 'No linear creative found');
      return false;
    }

    // Select best media file
    const mediaFile = this.selectMediaFile(creative.data.mediaFiles);
    if (!mediaFile) {
      this.logEvent('error', 'No compatible media file found');
      return false;
    }

    // Check if this is a SIMID interactive creative
    if (mediaFile.isSIMID && mediaFile.isInteractive) {
      // Load SIMID in iframe
      this.loadSIMID(mediaFile);
      this.isSIMID = true;
    } else {
      // Load regular video
      this.video.src = mediaFile.url;
      this.setupEventListeners();

      // Show video, hide iframe
      this.video.classList.remove('hidden');
      if (this.simidIframe) {
        this.simidIframe.classList.add('hidden');
      }

      this.isSIMID = false;
    }

    // Enable click overlay for click tracking (only for regular video)
    if (this.clickOverlay && !this.isSIMID) {
      this.clickOverlay.classList.remove('disabled');
    }

    this.logEvent('ad-loaded', `Ad loaded: ${ad.inline.adTitle || 'Untitled'}${this.isSIMID ? ' (SIMID Interactive)' : ''}`);

    // Fire impression trackers with initial context
    const context = this.getVideoContext();
    this.tracker.fireImpressions(this.trackingURLs.impressions, context);

    return true;
  }

  /**
   * Select best media file based on browser support
   * @param {Array} mediaFiles - Array of media files
   * @returns {Object|null} Selected media file
   */
  selectMediaFile(mediaFiles) {
    // Prioritize SIMID interactive creatives if present
    const simidFile = mediaFiles.find(mf => mf.isSIMID && mf.isInteractive);
    if (simidFile) {
      console.log('[VideoPlayer] SIMID interactive creative found, prioritizing');
      return simidFile;
    }

    // Preferred MIME types in order
    const preferredTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg'
    ];

    for (const type of preferredTypes) {
      const file = mediaFiles.find(mf => mf.type === type);
      if (file && this.video.canPlayType(type)) {
        return file;
      }
    }

    // Fallback to first available
    return mediaFiles[0] || null;
  }

  /**
   * Load SIMID interactive creative in iframe
   * @param {Object} mediaFile - SIMID media file object
   */
  loadSIMID(mediaFile) {
    if (!this.simidIframe) {
      console.error('[VideoPlayer] SIMID iframe element not found');
      return;
    }

    // Hide video, show iframe
    this.video.classList.add('hidden');
    this.simidIframe.classList.remove('hidden');

    // Load SIMID URL in iframe
    this.simidIframe.src = mediaFile.url;

    console.log('[VideoPlayer] Loaded SIMID creative:', mediaFile.url);
    this.logEvent('simid-loaded', 'SIMID interactive creative loaded in iframe');

    // Note: We're not implementing the full SIMID API protocol here.
    // This is a basic implementation that allows viewing/interacting with the SIMID creative.
    // Full SIMID requires implementing EnvironmentData, MediaSession, and messaging protocol.
  }

  /**
   * Set up video event listeners
   */
  setupEventListeners() {
    // Remove old listeners
    this.removeEventListeners();

    // Video events (no click - using overlay instead)
    const events = {
      'loadedmetadata': () => this.onLoadedMetadata(),
      'play': () => this.onPlay(),
      'pause': () => this.onPause(),
      'ended': () => this.onEnded(),
      'error': (e) => this.onError(e),
      'timeupdate': () => this.onTimeUpdate(),
      'volumechange': () => this.onVolumeChange()
    };

    for (const [event, handler] of Object.entries(events)) {
      this.video.addEventListener(event, handler);
      this.listeners.push({ event, handler });
    }

    // Attach click to overlay for reliable click tracking
    if (this.clickOverlay) {
      const clickHandler = (e) => {
        e.preventDefault();
        this.onClick();
      };
      this.clickOverlay.addEventListener('click', clickHandler);
      this.overlayListeners.push({ event: 'click', handler: clickHandler });
    }
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    this.listeners.forEach(({ event, handler }) => {
      this.video.removeEventListener(event, handler);
    });
    this.listeners = [];

    // Remove overlay listeners
    if (this.clickOverlay) {
      this.overlayListeners.forEach(({ event, handler }) => {
        this.clickOverlay.removeEventListener(event, handler);
      });
      this.overlayListeners = [];
    }
  }

  /**
   * Event Handlers
   */

  onLoadedMetadata() {
    this.logEvent('loaded-metadata', `Duration: ${this.video.duration.toFixed(2)}s`);
  }

  /**
   * Get current video context for macro replacement
   */
  getVideoContext() {
    const currentTime = this.video.currentTime || 0;
    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor((currentTime % 3600) / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);

    return {
      videoTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`,
      assetURI: this.video.src || '',
      playerWidth: this.video.videoWidth || this.video.clientWidth || '',
      playerHeight: this.video.videoHeight || this.video.clientHeight || '',
      playerSize: `${this.video.videoWidth || this.video.clientWidth || ''}x${this.video.videoHeight || this.video.clientHeight || ''}`
    };
  }

  onPlay() {
    this.logEvent('play', 'Video started playing');

    // Fire start tracking
    if (!this.quartilesFired.start) {
      const context = this.getVideoContext();
      this.tracker.fireEventTrackers('start', this.trackingURLs.tracking, context);
      this.quartilesFired.start = true;
      this.logEvent('tracking', 'Fired start tracking');
    }
  }

  onPause() {
    if (!this.video.ended) {
      this.logEvent('pause', 'Video paused');
      const context = this.getVideoContext();
      this.tracker.fireEventTrackers('pause', this.trackingURLs.tracking, context);
    }
  }

  onEnded() {
    this.logEvent('ended', 'Video completed');

    if (!this.quartilesFired.complete) {
      const context = this.getVideoContext();
      this.tracker.fireEventTrackers('complete', this.trackingURLs.tracking, context);
      this.quartilesFired.complete = true;
      this.logEvent('tracking', 'Fired complete tracking');
    }
  }

  onError(e) {
    const error = this.video.error;
    let message = 'Unknown error';

    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          message = 'Video loading aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          message = 'Network error loading video';
          break;
        case error.MEDIA_ERR_DECODE:
          message = 'Video decoding error';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Video format not supported';
          break;
      }
    }

    this.logEvent('error', message);

    // Fire error trackers
    if (this.trackingURLs.errors.length > 0) {
      this.trackingURLs.errors.forEach(url => {
        this.tracker.fireTracker(url, 'error');
      });
    }
  }

  onTimeUpdate() {
    if (!this.video.duration) return;

    const progress = this.video.currentTime / this.video.duration;
    const context = this.getVideoContext();

    // Fire quartile events
    if (progress >= 0.25 && !this.quartilesFired.firstQuartile) {
      this.tracker.fireEventTrackers('firstQuartile', this.trackingURLs.tracking, context);
      this.quartilesFired.firstQuartile = true;
      this.logEvent('tracking', 'Fired first quartile tracking (25%)');
    } else if (progress >= 0.5 && !this.quartilesFired.midpoint) {
      this.tracker.fireEventTrackers('midpoint', this.trackingURLs.tracking, context);
      this.quartilesFired.midpoint = true;
      this.logEvent('tracking', 'Fired midpoint tracking (50%)');
    } else if (progress >= 0.75 && !this.quartilesFired.thirdQuartile) {
      this.tracker.fireEventTrackers('thirdQuartile', this.trackingURLs.tracking, context);
      this.quartilesFired.thirdQuartile = true;
      this.logEvent('tracking', 'Fired third quartile tracking (75%)');
    }
  }

  onVolumeChange() {
    const context = this.getVideoContext();
    if (this.video.muted) {
      this.logEvent('mute', 'Video muted');
      this.tracker.fireEventTrackers('mute', this.trackingURLs.tracking, context);
    } else {
      this.logEvent('unmute', `Volume: ${Math.round(this.video.volume * 100)}%`);
      this.tracker.fireEventTrackers('unmute', this.trackingURLs.tracking, context);
    }
  }

  onClick() {
    this.logEvent('click', 'Video clicked');

    // Fire click trackers with context
    const context = this.getVideoContext();
    this.tracker.fireClicks(this.trackingURLs.clicks, context);

    // Open click-through URL
    const ad = this.vastData.ads.find(a => a.type === 'inline');
    if (ad) {
      const creative = ad.inline.creatives.find(c => c.type === 'linear');
      if (creative && creative.data.videoClicks.clickThrough) {
        window.open(creative.data.videoClicks.clickThrough, '_blank');
      }
    }
  }

  /**
   * Log an event
   * @param {string} type - Event type
   * @param {string} message - Event message
   */
  logEvent(type, message) {
    const event = {
      type,
      message,
      timestamp: new Date().toISOString(),
      currentTime: this.video.currentTime || 0
    };

    this.eventLog.push(event);
    console.log(`[VideoPlayer] ${type}: ${message}`);

    // Dispatch custom event
    const customEvent = new CustomEvent('videoevent', { detail: event });
    document.dispatchEvent(customEvent);
  }

  /**
   * Get event log
   * @returns {Array}
   */
  getEventLog() {
    return this.eventLog;
  }

  /**
   * Clear event log
   */
  clearEventLog() {
    this.eventLog = [];
  }

  /**
   * Play video
   */
  play() {
    this.video.play().catch(error => {
      this.logEvent('error', `Play failed: ${error.message}`);
    });
  }

  /**
   * Pause video
   */
  pause() {
    this.video.pause();
  }

  /**
   * Reset player
   */
  reset() {
    this.pause();
    this.video.src = '';
    this.removeEventListeners();

    // Reset SIMID iframe
    if (this.simidIframe) {
      this.simidIframe.src = '';
      this.simidIframe.classList.add('hidden');
    }

    // Show video, hide iframe
    this.video.classList.remove('hidden');

    // Disable click overlay
    if (this.clickOverlay) {
      this.clickOverlay.classList.add('disabled');
    }

    this.isSIMID = false;
    this.vastData = null;
    this.trackingURLs = null;
    this.quartilesFired = {
      start: false,
      firstQuartile: false,
      midpoint: false,
      thirdQuartile: false,
      complete: false
    };
  }

  /**
   * Destroy player
   */
  destroy() {
    this.reset();
    this.clearEventLog();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoPlayer;
}
