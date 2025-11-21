/**
 * VAST Parser - Parses VAST XML and extracts ad information
 * Supports VAST 2.0, 3.0, and 4.0+
 */

class VASTParser {
  constructor() {
    this.vastData = null;
    this.trackingURLs = {
      impressions: [],
      clicks: [],
      tracking: [],
      errors: []
    };
  }

  /**
   * Parse VAST XML from URL or string
   * @param {string} vastInput - VAST URL or XML string
   * @param {boolean} isXML - true if input is XML string
   * @returns {Promise<Object>} Parsed VAST data
   */
  async parse(vastInput, isXML = false) {
    try {
      let xmlString;

      if (isXML) {
        xmlString = vastInput;
      } else {
        // Fetch VAST from URL
        const response = await fetch(vastInput);
        if (!response.ok) {
          throw new Error(`Failed to fetch VAST: ${response.status} ${response.statusText}`);
        }
        xmlString = await response.text();
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // Check for XML parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
      }

      // Check if it's a VAST document
      const vastElement = xmlDoc.querySelector('VAST');
      if (!vastElement) {
        throw new Error('Not a valid VAST document');
      }

      const vastVersion = vastElement.getAttribute('version');
      console.log(`Parsing VAST version: ${vastVersion}`);

      // Reset tracking URLs
      this.trackingURLs = {
        impressions: [],
        clicks: [],
        tracking: [],
        errors: []
      };

      // Parse VAST structure
      this.vastData = this.parseVASTDocument(xmlDoc);

      return {
        success: true,
        version: vastVersion,
        data: this.vastData,
        tracking: this.trackingURLs
      };

    } catch (error) {
      console.error('VAST parsing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse VAST document and extract ad information
   */
  parseVASTDocument(xmlDoc) {
    const data = {
      ads: [],
      version: xmlDoc.querySelector('VAST')?.getAttribute('version') || 'Unknown'
    };

    // Get all Ad elements
    const adElements = xmlDoc.querySelectorAll('Ad');

    adElements.forEach((adElement, index) => {
      const ad = this.parseAd(adElement, index);
      if (ad) {
        data.ads.push(ad);
      }
    });

    return data;
  }

  /**
   * Parse individual Ad element
   */
  parseAd(adElement, index) {
    const ad = {
      id: adElement.getAttribute('id') || `ad-${index}`,
      sequence: adElement.getAttribute('sequence') || null,
      type: null,
      inline: null,
      wrapper: null
    };

    // Check if it's an InLine or Wrapper ad
    const inLine = adElement.querySelector('InLine');
    const wrapper = adElement.querySelector('Wrapper');

    if (inLine) {
      ad.type = 'inline';
      ad.inline = this.parseInLine(inLine);
    } else if (wrapper) {
      ad.type = 'wrapper';
      ad.wrapper = this.parseWrapper(wrapper);
    }

    return ad;
  }

  /**
   * Parse InLine ad element
   */
  parseInLine(inLineElement) {
    const inline = {
      adSystem: this.getElementText(inLineElement, 'AdSystem'),
      adTitle: this.getElementText(inLineElement, 'AdTitle'),
      description: this.getElementText(inLineElement, 'Description'),
      impressions: [],
      creatives: [],
      extensions: []
    };

    // Parse Impressions
    const impressionElements = inLineElement.querySelectorAll('Impression');
    impressionElements.forEach(imp => {
      const url = imp.textContent.trim();
      if (url) {
        inline.impressions.push(url);
        this.trackingURLs.impressions.push({
          url: url,
          id: imp.getAttribute('id') || null
        });
      }
    });

    // Parse Error tracking
    const errorElements = inLineElement.querySelectorAll('Error');
    errorElements.forEach(err => {
      const url = err.textContent.trim();
      if (url) {
        this.trackingURLs.errors.push(url);
      }
    });

    // Parse Creatives
    const creativeElements = inLineElement.querySelectorAll('Creative');
    creativeElements.forEach(creative => {
      const parsedCreative = this.parseCreative(creative);
      if (parsedCreative) {
        inline.creatives.push(parsedCreative);
      }
    });

    return inline;
  }

  /**
   * Parse Wrapper ad element
   */
  parseWrapper(wrapperElement) {
    const wrapper = {
      adSystem: this.getElementText(wrapperElement, 'AdSystem'),
      vastAdTagURI: this.getElementText(wrapperElement, 'VASTAdTagURI'),
      impressions: [],
      creatives: []
    };

    // Parse Impressions
    const impressionElements = wrapperElement.querySelectorAll('Impression');
    impressionElements.forEach(imp => {
      const url = imp.textContent.trim();
      if (url) {
        wrapper.impressions.push(url);
        this.trackingURLs.impressions.push({
          url: url,
          id: imp.getAttribute('id') || null
        });
      }
    });

    return wrapper;
  }

  /**
   * Parse Creative element
   */
  parseCreative(creativeElement) {
    const creative = {
      id: creativeElement.getAttribute('id') || null,
      sequence: creativeElement.getAttribute('sequence') || null,
      type: null,
      data: null
    };

    // Check creative type
    const linear = creativeElement.querySelector('Linear');
    const nonLinearAds = creativeElement.querySelector('NonLinearAds');
    const companionAds = creativeElement.querySelector('CompanionAds');

    if (linear) {
      creative.type = 'linear';
      creative.data = this.parseLinear(linear);
    } else if (nonLinearAds) {
      creative.type = 'nonlinear';
      creative.data = this.parseNonLinear(nonLinearAds);
    } else if (companionAds) {
      creative.type = 'companion';
      creative.data = this.parseCompanionAds(companionAds);
    }

    return creative;
  }

  /**
   * Parse Linear creative
   */
  parseLinear(linearElement) {
    const linear = {
      duration: this.getElementText(linearElement, 'Duration'),
      skipoffset: linearElement.getAttribute('skipoffset') || null,
      mediaFiles: [],
      videoClicks: {},
      trackingEvents: []
    };

    // Parse MediaFiles
    const mediaFileElements = linearElement.querySelectorAll('MediaFile');
    mediaFileElements.forEach(mf => {
      const apiFramework = mf.getAttribute('apiFramework');
      const type = mf.getAttribute('type') || null;

      // Detect VPAID
      const isVPAID = apiFramework === 'VPAID' ||
                      type === 'application/x-shockwave-flash' ||
                      type === 'application/javascript';

      linear.mediaFiles.push({
        id: mf.getAttribute('id') || null,
        delivery: mf.getAttribute('delivery') || 'progressive',
        type: type,
        width: mf.getAttribute('width') || null,
        height: mf.getAttribute('height') || null,
        codec: mf.getAttribute('codec') || null,
        bitrate: mf.getAttribute('bitrate') || null,
        apiFramework: apiFramework || null,
        isVPAID: isVPAID,
        url: mf.textContent.trim()
      });
    });

    // Parse VideoClicks
    const videoClicksElement = linearElement.querySelector('VideoClicks');
    if (videoClicksElement) {
      // ClickThrough
      const clickThrough = videoClicksElement.querySelector('ClickThrough');
      if (clickThrough) {
        const url = clickThrough.textContent.trim();
        linear.videoClicks.clickThrough = url;
        this.trackingURLs.clicks.push({
          type: 'clickThrough',
          url: url
        });
      }

      // ClickTracking
      const clickTrackingElements = videoClicksElement.querySelectorAll('ClickTracking');
      linear.videoClicks.clickTracking = [];
      clickTrackingElements.forEach(ct => {
        const url = ct.textContent.trim();
        if (url) {
          linear.videoClicks.clickTracking.push(url);
          this.trackingURLs.clicks.push({
            type: 'clickTracking',
            url: url
          });
        }
      });
    }

    // Parse Tracking Events
    const trackingElements = linearElement.querySelectorAll('Tracking');
    trackingElements.forEach(tracking => {
      const event = tracking.getAttribute('event');
      const url = tracking.textContent.trim();
      if (event && url) {
        linear.trackingEvents.push({
          event: event,
          url: url
        });
        this.trackingURLs.tracking.push({
          event: event,
          url: url,
          fired: false
        });
      }
    });

    return linear;
  }

  /**
   * Parse NonLinear ads
   */
  parseNonLinear(nonLinearAdsElement) {
    const nonLinear = {
      nonLinears: [],
      trackingEvents: []
    };

    const nonLinearElements = nonLinearAdsElement.querySelectorAll('NonLinear');
    nonLinearElements.forEach(nl => {
      nonLinear.nonLinears.push({
        id: nl.getAttribute('id') || null,
        width: nl.getAttribute('width') || null,
        height: nl.getAttribute('height') || null,
        resource: this.getElementText(nl, 'StaticResource') || this.getElementText(nl, 'IFrameResource'),
        clickThrough: this.getElementText(nl, 'NonLinearClickThrough')
      });
    });

    return nonLinear;
  }

  /**
   * Parse CompanionAds
   */
  parseCompanionAds(companionAdsElement) {
    const companions = [];

    const companionElements = companionAdsElement.querySelectorAll('Companion');
    companionElements.forEach(comp => {
      companions.push({
        id: comp.getAttribute('id') || null,
        width: comp.getAttribute('width') || null,
        height: comp.getAttribute('height') || null,
        resource: this.getElementText(comp, 'StaticResource') || this.getElementText(comp, 'IFrameResource'),
        clickThrough: this.getElementText(comp, 'CompanionClickThrough'),
        trackingEvents: []
      });
    });

    return { companions };
  }

  /**
   * Helper to get element text content
   */
  getElementText(parent, tagName) {
    const element = parent.querySelector(tagName);
    return element ? element.textContent.trim() : null;
  }

  /**
   * Get tracking URLs by category
   */
  getTrackingURLs() {
    return this.trackingURLs;
  }

  /**
   * Get parsed VAST data
   */
  getVASTData() {
    return this.vastData;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VASTParser;
}
