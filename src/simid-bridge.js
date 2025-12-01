/**
 * SIMID Bridge - Minimal SIMID protocol implementation
 * Provides basic SIMID API for interactive creatives to function
 *
 * Reference: https://github.com/InteractiveAdvertisingBureau/SIMID
 */

class SIMIDBridge {
  constructor(iframe, videoElement, tracker, trackingURLs) {
    this.iframe = iframe;
    this.video = videoElement;
    this.tracker = tracker;
    this.trackingURLs = trackingURLs;
    this.creative = null; // Reference to SIMID creative window
    this.sessionId = this.generateSessionId();
    this.isInitialized = false;

    // SIMID protocol version
    this.protocolVersion = '1.1';

    // Environment data
    this.environmentData = {
      videoElement: this.video,
      videoDimensions: {
        width: this.video.clientWidth || 640,
        height: this.video.clientHeight || 360
      },
      creativeDimensions: {
        width: this.video.clientWidth || 640,
        height: this.video.clientHeight || 360
      },
      fullscreen: false,
      muted: this.video.muted,
      volume: this.video.volume
    };

    // Creative data (will be populated when SIMID loads)
    this.creativeData = {
      adParameters: '',
      duration: this.video.duration || 0
    };

    // Message handlers
    this.messageHandlers = {
      'Session.creativeLoaded': this.handleCreativeLoaded.bind(this),
      'Session.init': this.handleInit.bind(this),
      'Session.start': this.handleStart.bind(this),
      'Session.stop': this.handleStop.bind(this),
      'Session.skip': this.handleSkip.bind(this),
      'Session.fatal': this.handleFatal.bind(this),
      'Creative.reportTracking': this.handleReportTracking.bind(this),
      'Creative.requestChangeVolume': this.handleRequestChangeVolume.bind(this),
      'Creative.requestPause': this.handleRequestPause.bind(this),
      'Creative.requestPlay': this.handleRequestPlay.bind(this),
      'Creative.requestSkip': this.handleRequestSkip.bind(this),
      'Creative.getMediaState': this.handleGetMediaState.bind(this),
    };

    // Listen for messages from SIMID creative
    this.boundMessageHandler = this.onMessage.bind(this);
    window.addEventListener('message', this.boundMessageHandler);

    console.log('[SIMID Bridge] Initialized with session ID:', this.sessionId);
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'simid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Send initialization message to SIMID creative
   */
  initializeCreative() {
    if (!this.iframe || !this.iframe.contentWindow) {
      console.error('[SIMID Bridge] Cannot initialize - iframe not ready');
      return;
    }

    this.creative = this.iframe.contentWindow;

    // Wait a bit for iframe to load
    setTimeout(() => {
      const initMessage = {
        sessionId: this.sessionId,
        messageId: this.generateMessageId(),
        type: 'init',
        timestamp: Date.now(),
        args: {
          environmentData: this.environmentData,
          creativeData: this.creativeData,
          protocolVersion: this.protocolVersion
        }
      };

      console.log('[SIMID Bridge] Sending init message to creative:', initMessage);
      this.sendMessage(initMessage);
    }, 500);
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Send message to SIMID creative
   */
  sendMessage(message) {
    if (!this.creative) {
      console.warn('[SIMID Bridge] Creative not ready, cannot send message');
      return;
    }

    try {
      this.creative.postMessage(JSON.stringify(message), '*');
      console.log('[SIMID Bridge] Sent message:', message.type);
    } catch (error) {
      console.error('[SIMID Bridge] Error sending message:', error);
    }
  }

  /**
   * Handle incoming messages from SIMID creative
   */
  onMessage(event) {
    // Validate origin (in production, check against allowed domains)
    if (!event.data) return;

    let data;
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch (error) {
      // Not a SIMID message
      return;
    }

    // Check if this is a SIMID message
    if (!data.type || !data.sessionId || data.sessionId !== this.sessionId) {
      return;
    }

    console.log('[SIMID Bridge] Received message:', data.type, data);

    // Route to appropriate handler
    const handler = this.messageHandlers[data.type];
    if (handler) {
      handler(data);
    } else {
      console.warn('[SIMID Bridge] No handler for message type:', data.type);
    }
  }

  /**
   * Handle creative loaded message
   */
  handleCreativeLoaded(message) {
    console.log('[SIMID Bridge] Creative loaded');
    this.isInitialized = true;

    // Respond with resolve
    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle init message from creative
   */
  handleInit(message) {
    console.log('[SIMID Bridge] Creative requesting init');

    // Send environment and creative data
    this.sendResolve(message.messageId, {
      environmentData: this.environmentData,
      creativeData: this.creativeData
    });
  }

  /**
   * Handle start message
   */
  handleStart(message) {
    console.log('[SIMID Bridge] Creative started');
    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle stop message
   */
  handleStop(message) {
    console.log('[SIMID Bridge] Creative stopped');
    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle skip message
   */
  handleSkip(message) {
    console.log('[SIMID Bridge] Creative requested skip');
    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle fatal error
   */
  handleFatal(message) {
    console.error('[SIMID Bridge] Creative fatal error:', message.args);
    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle tracking report from creative
   */
  handleReportTracking(message) {
    const { trackingUrls } = message.args || {};

    if (trackingUrls && Array.isArray(trackingUrls)) {
      console.log('[SIMID Bridge] Creative reported tracking URLs:', trackingUrls);

      // Fire tracking URLs
      trackingUrls.forEach(url => {
        this.tracker.sendTracking(url, 'simid-tracking');
      });
    }

    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle volume change request
   */
  handleRequestChangeVolume(message) {
    const { volume } = message.args || {};

    if (typeof volume === 'number' && volume >= 0 && volume <= 1) {
      this.video.volume = volume;
      console.log('[SIMID Bridge] Volume changed to:', volume);
    }

    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle pause request
   */
  handleRequestPause(message) {
    this.video.pause();
    console.log('[SIMID Bridge] Video paused');
    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle play request
   */
  handleRequestPlay(message) {
    this.video.play().catch(error => {
      console.error('[SIMID Bridge] Play error:', error);
    });
    console.log('[SIMID Bridge] Video playing');
    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle skip request
   */
  handleRequestSkip(message) {
    console.log('[SIMID Bridge] Skip requested');
    // Fire complete tracking
    if (this.trackingURLs && this.trackingURLs.tracking) {
      const completeEvent = this.trackingURLs.tracking.find(t => t.event === 'complete');
      if (completeEvent) {
        this.tracker.fireTracking('complete', completeEvent.url, {});
      }
    }
    this.sendResolve(message.messageId, {});
  }

  /**
   * Handle get media state request
   */
  handleGetMediaState(message) {
    const mediaState = {
      currentTime: this.video.currentTime,
      duration: this.video.duration,
      muted: this.video.muted,
      volume: this.video.volume,
      paused: this.video.paused,
      ended: this.video.ended,
      fullscreen: !!document.fullscreenElement
    };

    console.log('[SIMID Bridge] Media state requested:', mediaState);
    this.sendResolve(message.messageId, mediaState);
  }

  /**
   * Send resolve response
   */
  sendResolve(messageId, value) {
    this.sendMessage({
      sessionId: this.sessionId,
      messageId: this.generateMessageId(),
      type: 'resolve',
      timestamp: Date.now(),
      args: {
        messageId: messageId,
        value: value
      }
    });
  }

  /**
   * Send reject response
   */
  sendReject(messageId, error) {
    this.sendMessage({
      sessionId: this.sessionId,
      messageId: this.generateMessageId(),
      type: 'reject',
      timestamp: Date.now(),
      args: {
        messageId: messageId,
        error: error
      }
    });
  }

  /**
   * Notify creative of video events
   */
  notifyVideoEvent(eventType, data = {}) {
    this.sendMessage({
      sessionId: this.sessionId,
      messageId: this.generateMessageId(),
      type: 'videoEvent',
      timestamp: Date.now(),
      args: {
        event: eventType,
        ...data
      }
    });
  }

  /**
   * Clean up
   */
  destroy() {
    window.removeEventListener('message', this.boundMessageHandler);
    this.creative = null;
    console.log('[SIMID Bridge] Destroyed');
  }
}

// Export for use in video player
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SIMIDBridge;
}
