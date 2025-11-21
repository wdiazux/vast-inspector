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
      <h3>VAST Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Version:</strong> ${result.version}
        </div>
        <div class="info-item">
          <strong>Ad Type:</strong> ${ad.type}
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
        html += `
          <div class="info-item">
            <strong>Duration:</strong> ${linearCreative.data.duration || 'N/A'}
          </div>
          <div class="info-item">
            <strong>Media Files:</strong> ${linearCreative.data.mediaFiles.length}
          </div>
        `;
      }
    }

    html += `</div>`;

    this.vastInfoDiv.innerHTML = html;
  }

  /**
   * Display tracking URLs
   */
  displayTrackingURLs(tracking) {
    let html = '<h3>Tracking URLs</h3>';

    // Impressions
    if (tracking.impressions.length > 0) {
      html += `
        <div class="tracking-section">
          <h4>Impressions (${tracking.impressions.length})</h4>
          <ul class="url-list">
      `;
      tracking.impressions.forEach(imp => {
        const url = typeof imp === 'string' ? imp : imp.url;
        const fired = this.tracker.hasFired(url);
        html += `
          <li class="${fired ? 'fired' : ''}">
            <span class="status-icon">${fired ? '✓' : '○'}</span>
            <a href="${url}" target="_blank" class="url-link">${this.truncateURL(url)}</a>
          </li>
        `;
      });
      html += `</ul></div>`;
    }

    // Clicks
    if (tracking.clicks.length > 0) {
      html += `
        <div class="tracking-section">
          <h4>Click Tracking (${tracking.clicks.length})</h4>
          <ul class="url-list">
      `;
      tracking.clicks.forEach(click => {
        const url = typeof click === 'string' ? click : click.url;
        const fired = this.tracker.hasFired(url);
        const type = click.type || 'click';
        html += `
          <li class="${fired ? 'fired' : ''}">
            <span class="status-icon">${fired ? '✓' : '○'}</span>
            <span class="tracking-type">[${type}]</span>
            <a href="${url}" target="_blank" class="url-link">${this.truncateURL(url)}</a>
          </li>
        `;
      });
      html += `</ul></div>`;
    }

    // Tracking Events
    if (tracking.tracking.length > 0) {
      html += `
        <div class="tracking-section">
          <h4>Event Tracking (${tracking.tracking.length})</h4>
          <ul class="url-list">
      `;
      tracking.tracking.forEach(track => {
        const fired = this.tracker.hasFired(track.url);
        html += `
          <li class="${fired ? 'fired' : ''}">
            <span class="status-icon">${fired ? '✓' : '○'}</span>
            <span class="tracking-type">[${track.event}]</span>
            <a href="${track.url}" target="_blank" class="url-link">${this.truncateURL(track.url)}</a>
          </li>
        `;
      });
      html += `</ul></div>`;
    }

    // Errors
    if (tracking.errors.length > 0) {
      html += `
        <div class="tracking-section">
          <h4>Error Tracking (${tracking.errors.length})</h4>
          <ul class="url-list">
      `;
      tracking.errors.forEach(url => {
        const fired = this.tracker.hasFired(url);
        html += `
          <li class="${fired ? 'fired' : ''}">
            <span class="status-icon">${fired ? '✓' : '○'}</span>
            <a href="${url}" target="_blank" class="url-link">${this.truncateURL(url)}</a>
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
      <h3>Tracking Pixels</h3>
      <div class="stats">
        <span>Total: ${stats.total}</span>
        <span class="success">Success: ${stats.success}</span>
        <span class="failed">Failed: ${stats.failed}</span>
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
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const ui = new UIController();
  ui.init();
});
