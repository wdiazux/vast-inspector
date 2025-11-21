/**
 * Tracker - Manages tracking URLs, pixels, and event firing
 */

class Tracker {
  constructor() {
    this.firedTrackers = new Set();
    this.trackingLog = [];
  }

  /**
   * Replace VAST macros in URL
   * @param {string} url - URL with potential macros
   * @param {Object} context - Context for macro replacement (videoTime, assetURI, etc.)
   * @returns {string} URL with macros replaced
   */
  replaceMacros(url, context = {}) {
    if (!url) return url;

    const macros = {
      // Timestamp macros
      '[TIMESTAMP]': Date.now(),
      '[CACHEBUSTERS]': Math.floor(Math.random() * 1000000000),
      '[CACHEBUSTER]': Math.floor(Math.random() * 1000000000),

      // Video playback macros
      '[CONTENTPLAYHEAD]': context.videoTime || '00:00:00.000',

      // Asset macros
      '[ASSETURI]': context.assetURI || '',

      // Device/User macros (browser limitations)
      '[DEVICEID]': '', // Not available in browser
      '[DEVICEUA]': encodeURIComponent(navigator.userAgent || ''),
      '[LIMITADTRACKING]': '0', // Assume tracking allowed

      // Platform macros
      '[PLAYERNAME]': 'VAST-Inspector',
      '[PLAYERWIDTH]': context.playerWidth || '',
      '[PLAYERHEIGHT]': context.playerHeight || '',
      '[PLAYERSIZE]': context.playerSize || '',

      // Additional common macros
      '[RANDOM]': Math.floor(Math.random() * 1000000000),
      '[PAGEURL]': encodeURIComponent(window.location.href),
      '[DOMAIN]': encodeURIComponent(window.location.hostname)
    };

    let replacedURL = url;

    // Replace each macro
    for (const [macro, value] of Object.entries(macros)) {
      // Case-insensitive replacement
      const regex = new RegExp(macro.replace(/[[\]]/g, '\\$&'), 'gi');
      replacedURL = replacedURL.replace(regex, value);
    }

    // Log if macros were replaced
    if (replacedURL !== url) {
      console.log(`[Tracker] Replaced macros in URL`);
      console.log(`  Original: ${url.substring(0, 100)}...`);
      console.log(`  Replaced: ${replacedURL.substring(0, 100)}...`);
    }

    return replacedURL;
  }

  /**
   * Fire a tracking URL
   * @param {string} url - Tracking URL to fire
   * @param {string} type - Type of tracking (impression, click, event)
   * @param {string} event - Event name (if applicable)
   * @param {Object} context - Context for macro replacement
   * @returns {Promise<boolean>} Success status
   */
  async fireTracker(url, type = 'tracking', event = null, context = {}) {
    if (!url || this.firedTrackers.has(url)) {
      return false;
    }

    try {
      const timestamp = new Date().toISOString();

      // Replace VAST macros before firing
      const processedURL = this.replaceMacros(url, context);

      // Fire the tracking pixel
      await this.sendTracking(processedURL);

      // Mark as fired (using original URL to prevent duplicates)
      this.firedTrackers.add(url);

      // Log the event
      this.trackingLog.push({
        url: processedURL, // Log the processed URL
        originalURL: url,
        type,
        event,
        timestamp,
        status: 'success'
      });

      console.log(`[Tracker] Fired ${type}${event ? ` (${event})` : ''}: ${processedURL.substring(0, 80)}...`);

      return true;
    } catch (error) {
      console.error(`[Tracker] Failed to fire ${type}:`, error);

      this.trackingLog.push({
        url,
        type,
        event,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message
      });

      return false;
    }
  }

  /**
   * Send tracking request
   * @param {string} url - URL to send
   */
  async sendTracking(url) {
    return new Promise((resolve, reject) => {
      // Use Image object for tracking pixels (most reliable method)
      const img = new Image();

      img.onload = () => resolve(true);
      img.onerror = () => {
        // Even if the image fails to load, the request was sent
        // This is normal for tracking pixels that return 1x1 transparent GIFs
        resolve(true);
      };

      // Set a timeout
      setTimeout(() => {
        resolve(true); // Assume success after timeout
      }, 5000);

      img.src = url;
    });
  }

  /**
   * Fire impression trackers
   * @param {Array} impressionURLs - Array of impression URLs
   * @param {Object} context - Context for macro replacement
   */
  async fireImpressions(impressionURLs, context = {}) {
    const promises = impressionURLs.map(impression => {
      const url = typeof impression === 'string' ? impression : impression.url;
      return this.fireTracker(url, 'impression', null, context);
    });

    await Promise.all(promises);
  }

  /**
   * Fire click trackers
   * @param {Array} clickURLs - Array of click URLs
   * @param {Object} context - Context for macro replacement
   */
  async fireClicks(clickURLs, context = {}) {
    const promises = clickURLs.map(click => {
      const url = typeof click === 'string' ? click : click.url;
      return this.fireTracker(url, 'click', click.type || null, context);
    });

    await Promise.all(promises);
  }

  /**
   * Fire event tracker
   * @param {string} event - Event name
   * @param {Array} trackingURLs - Array of tracking URLs for this event
   * @param {Object} context - Context for macro replacement
   */
  async fireEventTrackers(event, trackingURLs, context = {}) {
    const eventTrackers = trackingURLs.filter(t => t.event === event);

    const promises = eventTrackers.map(tracker => {
      return this.fireTracker(tracker.url, 'event', event, context);
    });

    await Promise.all(promises);
  }

  /**
   * Check if a tracker has been fired
   * @param {string} url - Tracker URL
   * @returns {boolean}
   */
  hasFired(url) {
    return this.firedTrackers.has(url);
  }

  /**
   * Get tracking log
   * @returns {Array} Array of tracking events
   */
  getLog() {
    return this.trackingLog;
  }

  /**
   * Get fired trackers count
   * @returns {number}
   */
  getFiredCount() {
    return this.firedTrackers.size;
  }

  /**
   * Reset tracker state
   */
  reset() {
    this.firedTrackers.clear();
    this.trackingLog = [];
  }

  /**
   * Get tracking statistics
   * @returns {Object}
   */
  getStats() {
    const stats = {
      total: this.trackingLog.length,
      success: 0,
      failed: 0,
      byType: {}
    };

    this.trackingLog.forEach(log => {
      if (log.status === 'success') {
        stats.success++;
      } else {
        stats.failed++;
      }

      if (!stats.byType[log.type]) {
        stats.byType[log.type] = 0;
      }
      stats.byType[log.type]++;
    });

    return stats;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Tracker;
}
