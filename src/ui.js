/**
 * UI Controller - Manages the user interface and coordinates components
 */

class UIController {
  constructor() {
    this.parser = new VASTParser();
    this.tracker = new Tracker();
    this.player = null;
    this.inputMode = 'url'; // 'url' or 'xml'
  }

  /**
   * Initialize the UI
   */
  init() {
    this.setupElements();
    this.setupEventListeners();
    this.updateInputMode();

    console.log('VAST Inspector initialized');
  }

  /**
   * Set up DOM element references
   */
  setupElements() {
    // Input elements
    this.urlInput = document.getElementById('vast-url-input');
    this.xmlInput = document.getElementById('vast-xml-input');
    this.urlRadio = document.getElementById('input-url');
    this.xmlRadio = document.getElementById('input-xml');

    // Buttons
    this.testButton = document.getElementById('test-button');
    this.clearButton = document.getElementById('clear-button');

    // Display sections
    this.statusDiv = document.getElementById('status');
    this.trackingDiv = document.getElementById('tracking-urls');
    this.pixelsDiv = document.getElementById('tracking-pixels');
    this.eventLogDiv = document.getElementById('event-log');
    this.vastInfoDiv = document.getElementById('vast-info');

    // Video player
    this.videoElement = document.getElementById('ad-video');
    this.player = new VideoPlayer(this.videoElement, this.tracker);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Input mode toggle
    this.urlRadio.addEventListener('change', () => this.updateInputMode());
    this.xmlRadio.addEventListener('change', () => this.updateInputMode());

    // Buttons
    this.testButton.addEventListener('click', () => this.testAd());
    this.clearButton.addEventListener('click', () => this.clearAll());

    // Video events
    document.addEventListener('videoevent', (e) => this.onVideoEvent(e));
  }

  /**
   * Update input mode
   */
  updateInputMode() {
    this.inputMode = this.urlRadio.checked ? 'url' : 'xml';

    if (this.inputMode === 'url') {
      this.urlInput.style.display = 'block';
      this.xmlInput.style.display = 'none';
    } else {
      this.urlInput.style.display = 'none';
      this.xmlInput.style.display = 'block';
    }
  }

  /**
   * Test ad
   */
  async testAd() {
    this.showStatus('Loading VAST...', 'info');
    this.clearDisplays();

    try {
      const input = this.inputMode === 'url'
        ? this.urlInput.value.trim()
        : this.xmlInput.value.trim();

      if (!input) {
        this.showStatus('Please enter a VAST URL or XML', 'error');
        return;
      }

      // Parse VAST
      const result = await this.parser.parse(input, this.inputMode === 'xml');

      if (!result.success) {
        this.showStatus(`Error: ${result.error}`, 'error');
        return;
      }

      this.showStatus(`VAST ${result.version} loaded successfully`, 'success');

      // Display VAST info
      this.displayVASTInfo(result);

      // Display tracking URLs
      this.displayTrackingURLs(result.tracking);

      // Load ad into player
      const loaded = this.player.loadAd(result.data, result.tracking);

      if (loaded) {
        this.showStatus('Ad loaded. Click play to start.', 'success');
      } else {
        this.showStatus('Failed to load ad into player', 'error');
      }

    } catch (error) {
      console.error('Test ad error:', error);
      this.showStatus(`Error: ${error.message}`, 'error');
    }
  }

  /**
   * Display VAST information
   */
  displayVASTInfo(result) {
    const ad = result.data.ads[0];
    if (!ad) return;

    let html = `
      <h3><i class="fas fa-info-circle"></i> VAST Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong><i class="fas fa-code-branch"></i> Version:</strong> ${result.version}
        </div>
        <div class="info-item">
          <strong><i class="fas fa-tag"></i> Ad Type:</strong> ${ad.type}
        </div>
    `;

    if (ad.inline) {
      html += `
        <div class="info-item">
          <strong>Ad System:</strong> ${ad.inline.adSystem || 'N/A'}
        </div>
        <div class="info-item">
          <strong>Ad Title:</strong> ${ad.inline.adTitle || 'N/A'}
        </div>
        <div class="info-item">
          <strong>Creatives:</strong> ${ad.inline.creatives.length}
        </div>
      `;

      const linearCreative = ad.inline.creatives.find(c => c.type === 'linear');
      if (linearCreative) {
        // Check for VPAID creatives
        const hasVPAID = linearCreative.data.mediaFiles.some(mf => mf.isVPAID);

        html += `
          <div class="info-item">
            <strong><i class="fas fa-clock"></i> Duration:</strong> ${linearCreative.data.duration || 'N/A'}
          </div>
          <div class="info-item">
            <strong><i class="fas fa-file-video"></i> Media Files:</strong> ${linearCreative.data.mediaFiles.length}
          </div>
        `;

        // Show VPAID warning
        if (hasVPAID) {
          html += `
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="warning-banner">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>VPAID Detected:</strong> This VAST tag contains VPAID creatives. VPAID ads require a compatible player and won't execute in this basic inspector.
              </div>
            </div>
          `;
        }

        // Add device-specific media file breakdown
        const deviceTypes = this.categorizeMediaFilesByDevice(linearCreative.data.mediaFiles);
        if (deviceTypes.length > 0) {
          html += `
            <div class="info-item" style="grid-column: 1 / -1;">
              <strong><i class="fas fa-mobile-alt"></i> Device Support:</strong> ${deviceTypes.join(', ')}
            </div>
          `;
        }
      }

      // Display media files with device detection
      html += this.displayMediaFiles(ad.inline.creatives);
    }

    html += `</div>`;

    this.vastInfoDiv.innerHTML = html;
  }

  /**
   * Categorize media files by device type based on dimensions
   */
  categorizeMediaFilesByDevice(mediaFiles) {
    const devices = new Set();

    mediaFiles.forEach(mf => {
      const width = parseInt(mf.width) || 0;
      const height = parseInt(mf.height) || 0;

      if (width && height) {
        const aspectRatio = width / height;
        const deviceType = this.detectDeviceType(width, height, aspectRatio);
        if (deviceType) {
          devices.add(deviceType);
        }
      }
    });

    return Array.from(devices);
  }

  /**
   * Detect device type from dimensions
   */
  detectDeviceType(width, height, aspectRatio) {
    // Mobile portrait (9:16 or similar)
    if (aspectRatio < 0.75) {
      return 'Mobile Portrait';
    }

    // Mobile landscape (typical phone dimensions)
    if (width <= 854 && height <= 480) {
      return 'Mobile';
    }

    // Tablet / Medium screens
    if (width <= 1280 && height <= 720) {
      return 'Tablet/Desktop';
    }

    // CTV/OTT (Roku, Apple TV, Fire TV, etc.) - typically 1920x1080 or 1280x720
    if ((width === 1920 && height === 1080) || (width === 1280 && height === 720) || (width === 3840 && height === 2160)) {
      return 'CTV/OTT (Roku, TV)';
    }

    // Desktop/larger screens
    if (width >= 1280) {
      return 'Desktop/CTV';
    }

    return 'Other';
  }

  /**
   * Display media files with device information
   */
  displayMediaFiles(creatives) {
    let html = '<div style="grid-column: 1 / -1; margin-top: 15px;">';
    html += '<h4>Available Media Files</h4>';

    creatives.forEach(creative => {
      if (creative.type === 'linear' && creative.data.mediaFiles) {
        html += '<div class="media-files-list">';

        creative.data.mediaFiles.forEach((mf, index) => {
          const width = mf.width || '?';
          const height = mf.height || '?';
          const type = mf.type || 'unknown';
          const bitrate = mf.bitrate ? `${mf.bitrate}kbps` : 'N/A';
          const aspectRatio = (parseInt(mf.width) && parseInt(mf.height))
            ? (parseInt(mf.width) / parseInt(mf.height)).toFixed(2)
            : 'N/A';

          const deviceType = this.detectDeviceType(
            parseInt(mf.width) || 0,
            parseInt(mf.height) || 0,
            parseFloat(aspectRatio) || 0
          );

          // Check if VPAID
          const vpaidBadge = mf.isVPAID ? '<span class="vpaid-badge"><i class="fas fa-code"></i> VPAID</span>' : '';
          const apiFramework = mf.apiFramework ? `<span><strong>API:</strong> ${mf.apiFramework}</span>` : '';

          html += `
            <div class="media-file-item ${mf.isVPAID ? 'vpaid-creative' : ''}">
              <div class="media-file-header">
                <span class="media-file-index">#${index + 1}</span>
                <span class="device-badge device-${deviceType.toLowerCase().replace(/[^a-z]/g, '')}">${deviceType}</span>
                ${vpaidBadge}
              </div>
              <div class="media-file-details">
                <span><strong>Type:</strong> ${type}</span>
                <span><strong>Size:</strong> ${width}x${height} (${aspectRatio}:1)</span>
                <span><strong>Bitrate:</strong> ${bitrate}</span>
                ${apiFramework}
              </div>
              <div class="media-file-url">${this.truncateURL(mf.url, 80)}</div>
            </div>
          `;
        });

        html += '</div>';
      }
    });

    html += '</div>';
    return html;
  }

  /**
   * Display tracking URLs
   */
  displayTrackingURLs(tracking) {
    let html = '<h3><i class="fas fa-link"></i> Tracking URLs</h3>';

    // Impressions
    if (tracking.impressions.length > 0) {
      html += `
        <div class="tracking-section">
          <h4><i class="fas fa-eye"></i> Impressions (${tracking.impressions.length})</h4>
          <ul class="url-list">
      `;
      tracking.impressions.forEach(imp => {
        const url = typeof imp === 'string' ? imp : imp.url;

        // Validate URL
        if (!this.validateURL(url)) {
          console.warn('Invalid impression URL:', url);
          return;
        }

        const fired = this.tracker.hasFired(url);
        const displayURL = this.truncateURL(url);

        html += `
          <li class="${fired ? 'fired' : ''}" title="${url}">
            <i class="fas ${fired ? 'fa-check-circle' : 'fa-circle'} status-icon"></i>
            <a href="${url}" target="_blank" class="url-link" rel="noopener noreferrer">${displayURL}</a>
          </li>
        `;
      });
      html += `</ul></div>`;
    }

    // Clicks
    if (tracking.clicks.length > 0) {
      html += `
        <div class="tracking-section">
          <h4><i class="fas fa-mouse-pointer"></i> Click Tracking (${tracking.clicks.length})</h4>
          <ul class="url-list">
      `;
      tracking.clicks.forEach(click => {
        const url = typeof click === 'string' ? click : click.url;

        // Validate URL
        if (!this.validateURL(url)) {
          console.warn('Invalid click URL:', url);
          return;
        }

        const fired = this.tracker.hasFired(url);
        const type = click.type || 'click';
        const displayURL = this.truncateURL(url);

        html += `
          <li class="${fired ? 'fired' : ''}" title="${url}">
            <i class="fas ${fired ? 'fa-check-circle' : 'fa-circle'} status-icon"></i>
            <span class="tracking-type"><i class="fas fa-tag"></i> ${type}</span>
            <a href="${url}" target="_blank" class="url-link" rel="noopener noreferrer">${displayURL}</a>
          </li>
        `;
      });
      html += `</ul></div>`;
    }

    // Tracking Events
    if (tracking.tracking.length > 0) {
      html += `
        <div class="tracking-section">
          <h4><i class="fas fa-chart-line"></i> Event Tracking (${tracking.tracking.length})</h4>
          <ul class="url-list">
      `;
      tracking.tracking.forEach(track => {
        // Validate URL
        if (!this.validateURL(track.url)) {
          console.warn('Invalid tracking URL:', track.url);
          return;
        }

        const fired = this.tracker.hasFired(track.url);
        const displayURL = this.truncateURL(track.url);

        html += `
          <li class="${fired ? 'fired' : ''}" title="${track.url}">
            <i class="fas ${fired ? 'fa-check-circle' : 'fa-circle'} status-icon"></i>
            <span class="tracking-type"><i class="fas fa-bolt"></i> ${track.event}</span>
            <a href="${track.url}" target="_blank" class="url-link" rel="noopener noreferrer">${displayURL}</a>
          </li>
        `;
      });
      html += `</ul></div>`;
    }

    // Errors
    if (tracking.errors.length > 0) {
      html += `
        <div class="tracking-section">
          <h4><i class="fas fa-exclamation-triangle"></i> Error Tracking (${tracking.errors.length})</h4>
          <ul class="url-list">
      `;
      tracking.errors.forEach(url => {
        // Validate URL
        if (!this.validateURL(url)) {
          console.warn('Invalid error URL:', url);
          return;
        }

        const fired = this.tracker.hasFired(url);
        const displayURL = this.truncateURL(url);

        html += `
          <li class="${fired ? 'fired' : ''}" title="${url}">
            <i class="fas ${fired ? 'fa-check-circle' : 'fa-circle'} status-icon"></i>
            <a href="${url}" target="_blank" class="url-link" rel="noopener noreferrer">${displayURL}</a>
          </li>
        `;
      });
      html += `</ul></div>`;
    }

    this.trackingDiv.innerHTML = html;

    // Update tracking pixels display
    this.updateTrackingPixels();
  }

  /**
   * Update tracking pixels display
   */
  updateTrackingPixels() {
    const stats = this.tracker.getStats();
    const log = this.tracker.getLog();

    let html = `
      <h3><i class="fas fa-image"></i> Tracking Pixels</h3>
      <div class="stats">
        <span><i class="fas fa-layer-group"></i> Total: ${stats.total}</span>
        <span class="success"><i class="fas fa-check"></i> Success: ${stats.success}</span>
        <span class="failed"><i class="fas fa-times"></i> Failed: ${stats.failed}</span>
      </div>
      <div class="pixels-grid">
    `;

    log.forEach((entry, index) => {
      const statusClass = entry.status === 'success' ? 'success' : 'failed';
      html += `
        <div class="pixel-item ${statusClass}">
          <div class="pixel-header">
            <span class="pixel-type">${entry.type}${entry.event ? ` - ${entry.event}` : ''}</span>
            <span class="pixel-status">${entry.status}</span>
          </div>
          <div class="pixel-url">${this.truncateURL(entry.url, 60)}</div>
          <div class="pixel-time">${new Date(entry.timestamp).toLocaleTimeString()}</div>
        </div>
      `;
    });

    html += `</div>`;

    this.pixelsDiv.innerHTML = html;
  }

  /**
   * Handle video events
   */
  onVideoEvent(e) {
    const event = e.detail;
    this.addEventLog(event);

    // Update tracking displays when new trackers fire
    if (event.type === 'tracking') {
      this.updateTrackingPixels();
      this.displayTrackingURLs(this.parser.getTrackingURLs());
    }
  }

  /**
   * Add event to log
   */
  addEventLog(event) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${event.type}`;

    const time = new Date(event.timestamp).toLocaleTimeString();
    const videoTime = event.currentTime ? event.currentTime.toFixed(2) + 's' : '0.00s';

    logEntry.innerHTML = `
      <span class="log-time">[${time}]</span>
      <span class="log-video-time">[${videoTime}]</span>
      <span class="log-type">[${event.type}]</span>
      <span class="log-message">${event.message}</span>
    `;

    this.eventLogDiv.insertBefore(logEntry, this.eventLogDiv.firstChild);

    // Limit log entries
    while (this.eventLogDiv.children.length > 100) {
      this.eventLogDiv.removeChild(this.eventLogDiv.lastChild);
    }
  }

  /**
   * Show status message
   */
  showStatus(message, type = 'info') {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status status-${type}`;
  }

  /**
   * Clear all displays
   */
  clearDisplays() {
    this.vastInfoDiv.innerHTML = '';
    this.trackingDiv.innerHTML = '';
    this.pixelsDiv.innerHTML = '';
  }

  /**
   * Clear all
   */
  clearAll() {
    this.clearDisplays();
    this.eventLogDiv.innerHTML = '';
    this.statusDiv.textContent = '';
    this.player.reset();
    this.tracker.reset();
  }

  /**
   * Truncate URL for display
   */
  truncateURL(url, maxLength = 80) {
    if (!url) return '';

    // Decode URL for better readability
    try {
      url = decodeURIComponent(url);
    } catch (e) {
      // If decoding fails, use original URL
      console.warn('Failed to decode URL:', url);
    }

    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  }

  /**
   * Safely encode URL if needed
   */
  encodeURLSafely(url) {
    if (!url) return '';

    try {
      // Check if URL is already encoded by trying to decode it
      const decoded = decodeURIComponent(url);
      // If decoding changes the URL, it was encoded
      if (decoded !== url) {
        return url; // Already encoded
      }
      // Otherwise encode it
      return encodeURIComponent(url);
    } catch (e) {
      // If decoding fails, assume it's not properly encoded
      return url;
    }
  }

  /**
   * Validate and sanitize tracking URL
   */
  validateURL(url) {
    if (!url || typeof url !== 'string') return false;

    try {
      // Try to create a URL object to validate
      new URL(url);
      return true;
    } catch (e) {
      console.warn('Invalid URL:', url, e);
      return false;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const ui = new UIController();
  ui.init();
});
