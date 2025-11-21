# CTV/OTT QR Code Tracking

## Overview

This document explains the differences between traditional click tracking (desktop/mobile) and QR code tracking for CTV/OTT devices, based on 2025 industry standards and research.

**Important**: CTV (Connected TV) ads are **NOT clickable**. QR codes are the primary engagement method.

**Last Updated**: November 21, 2025

---

## Understanding the Difference

### Desktop & Mobile (OTT) - Traditional Click Tracking ✓

**Devices**: Laptops, desktops, phones, tablets

**Interaction Method**: Mouse clicks or finger taps

**VAST Implementation**:
```xml
<VideoClicks>
  <ClickThrough><![CDATA[https://advertiser.com/landing]]></ClickThrough>
  <ClickTracking><![CDATA[https://track.com/click?id=123]]></ClickTracking>
</VideoClicks>
```

**User Experience**:
1. User watches video ad
2. User **clicks** on video
3. Click tracking pixels fire
4. Landing page opens in new tab/window

**VAST Inspector Support**: ✅ Full support via click overlay

---

### CTV/OTT - QR Code Tracking Only

**Devices**: Roku, Fire TV, Apple TV, Samsung Smart TV, LG Smart TV, Chromecast, etc.

**Why No Clicks?**: CTV devices use **remote controls**, not mouse/touch. They don't have traditional cursor-based interaction.

**Interaction Method**: QR code scanning with smartphone

**VAST Implementation** (conceptual - not in VAST spec):
```xml
<!-- CTV creatives typically include QR code as part of video overlay -->
<MediaFile type="video/mp4" width="1920" height="1080">
  <![CDATA[https://cdn.example.com/ctv-ad-with-qr-code.mp4]]>
</MediaFile>

<!-- QR code landing page URL (not clicked, but scanned) -->
<Extension type="QRCode">
  <URL><![CDATA[https://brand.com/offer?utm_source=ctv&utm_medium=qr]]></URL>
</Extension>
```

**User Experience**:
1. User watches video ad on TV
2. User sees QR code displayed on screen (15-30 seconds)
3. User **scans QR code** with smartphone
4. Smartphone browser opens landing page
5. QR tracking platform records scan event

**VAST Inspector Support**: ⚠️ QR codes are embedded in video creative (not VAST XML). The inspector can display CTV creatives but cannot track QR scans.

---

## QR Code Best Practices (2025 Research)

### Industry Statistics

- **Growth**: QR code use in CTV grew **3x** in 2024 (Innovid)
- **CTV Impressions**: Rose **18%** year-over-year
- **Engagement**: Nearly **tripled** in 2024
- **Conversion Rates**: 10x higher than industry benchmarks (Mondelez/Nabisco campaign)
- **New Buyers**: 12% increase (Walmart.com CTV campaign)
- **Attention Increase**: 12% boost when QR codes added to CTV ads (Sharethrough)

### Minimum Duration

**At least 15 seconds**, but **longer is better**:
- 15 seconds: Minimum for user to notice and scan
- 30 seconds: Recommended for optimal scan rates
- 60 seconds: Best for complex QR codes or detailed CTAs

**Why?**:
- User needs time to grab phone
- Open camera app
- Position phone to scan code
- Wait for URL to load

### QR Code Placement

✅ **Best Practices**:
- **Prominent position**: Bottom-right or bottom-center of screen
- **High contrast**: Dark QR code on light background (or vice versa)
- **Sufficient size**: At least 10-15% of screen area for 1080p
- **Clear CTA**: "Scan to shop", "Scan for offer", "Scan to learn more"
- **Visible borders**: White or colored border around QR code
- **Static position**: Don't move QR code during ad (confusing)

❌ **Avoid**:
- Placing QR code over important visual elements
- Using low-contrast colors (hard to scan)
- Tiny QR codes (won't scan from TV distance)
- Moving/animated QR codes (impossible to scan)
- Hiding QR code in first/last 2 seconds

### Tracking Implementation

#### 1. Use Unique Trackable URLs

```
https://brand.com/offer?
  utm_source=ctv&
  utm_medium=qr&
  utm_campaign=summer2025&
  utm_content=creative123&
  show=hbo&
  network=max&
  timestamp=1732204800
```

**Track**:
- QR scan count
- Scan location (IP-based geo)
- Scan time and date
- Device OS (iOS vs Android)
- Time between ad view and scan
- Conversion events after scan

#### 2. Use URL Shorteners with Analytics

**Popular Options**:
- Bitly (comprehensive analytics)
- QR code generator platforms (Uniqode, QR Code Monkey)
- Custom short domains (brand.link/offer)

**Benefits**:
- Real-time scan tracking
- Heatmaps showing scan locations
- Device breakdowns
- Conversion tracking

#### 3. Server-Side Logging

```javascript
// Example server-side tracking on QR URL
app.get('/ctv-offer', (req, res) => {
  // Log the scan
  logEvent({
    type: 'qr_scan',
    campaign: req.query.utm_campaign,
    creative: req.query.utm_content,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    show: req.query.show,
    network: req.query.network
  });

  // Redirect to actual landing page
  res.redirect('https://brand.com/actual-offer-page');
});
```

---

## VAST Inspector Limitations for CTV

### What the Inspector CAN Do ✅

1. **Parse CTV Creatives**:
   - Detect 1920×1080 (1080p) and 1280×720 (720p) as CTV/OTT
   - Display media files with CTV badge
   - Show aspect ratios and bitrates

2. **Play CTV Video Ads**:
   - Load and play 16:9 video creatives
   - Monitor VAST tracking events (impressions, quartiles)
   - Fire impression and quartile tracking pixels

3. **Detect CTV Dimensions**:
   - Automatically classify standard broadcast resolutions
   - Display purple "CTV/OTT" badge

### What the Inspector CANNOT Do ❌

1. **Track QR Code Scans**:
   - QR codes are embedded in the video creative itself
   - Scanning happens off-screen (on user's phone)
   - Inspector has no access to scan events

2. **Simulate Click Tracking on CTV**:
   - CTV devices don't support mouse clicks
   - Click overlay is for desktop/mobile only
   - ClickTracking URLs won't fire for real CTV devices

3. **Generate QR Codes**:
   - QR codes must be created separately
   - Embedded in video creative during production
   - Not part of VAST XML specification

### Workaround for Testing CTV Ads

**Testing Impression & Quartile Tracking**:
```
1. Load CTV VAST tag in inspector
2. Play video to test:
   ✓ Impression firing
   ✓ Quartile events (25%, 50%, 75%, 100%)
   ✓ Video playback
   ✓ Error handling
```

**Testing QR Code**:
```
1. Play video in inspector
2. Manually scan QR code with phone (if visible in creative)
3. Verify landing page opens
4. Check QR analytics platform for scan event
```

**Testing Click Tracking** (Desktop/Mobile Only):
```
1. Load desktop/mobile VAST tag
2. Click on video
3. Verify click tracking fires
4. Verify landing page opens
```

---

## CTV Ad Format Specifications

### Standard Resolutions

| Resolution | Format | CTV Devices |
|------------|--------|-------------|
| 1280×720 | 720p HD | Most CTV devices |
| 1920×1080 | 1080p Full HD | Premium CTV devices |
| 3840×2160 | 4K UHD | High-end smart TVs |

### Bitrate Recommendations

| Resolution | Bitrate Range | Recommended |
|------------|---------------|-------------|
| 720p | 2-4 Mbps | 2.5-3 Mbps |
| 1080p | 3-6 Mbps | 4-5 Mbps |
| 4K | 15-25 Mbps | 18-20 Mbps |

### Duration Standards

| Ad Type | Duration | Notes |
|---------|----------|-------|
| Pre-roll | 15-30s | Standard |
| Mid-roll | 30-60s | Longer acceptable |
| Pause ads | Until resume | Interactive with QR |

---

## Example CTV VAST Tag

```xml
<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.0">
  <Ad id="ctv-campaign-123">
    <InLine>
      <AdSystem>AdServer v1.0</AdSystem>
      <AdTitle>Summer Sale - CTV Campaign</AdTitle>

      <!-- Impression tracking -->
      <Impression><![CDATA[https://track.com/imp?id=123&platform=ctv&res=1080p]]></Impression>

      <Creatives>
        <Creative id="ctv-creative-456">
          <Linear>
            <Duration>00:00:30</Duration>

            <!-- Tracking Events (work on CTV) -->
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://track.com/start?id=123]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://track.com/q1?id=123]]></Tracking>
              <Tracking event="midpoint"><![CDATA[https://track.com/mid?id=123]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[https://track.com/q3?id=123]]></Tracking>
              <Tracking event="complete"><![CDATA[https://track.com/comp?id=123]]></Tracking>
            </TrackingEvents>

            <!-- CTV Media Files -->
            <MediaFiles>
              <!-- 1080p Full HD (primary) -->
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080" bitrate="5000">
                <![CDATA[https://cdn.example.com/ctv-summer-sale-1080p-with-qr.mp4]]>
              </MediaFile>

              <!-- 720p HD (fallback) -->
              <MediaFile delivery="progressive" type="video/mp4" width="1280" height="720" bitrate="2500">
                <![CDATA[https://cdn.example.com/ctv-summer-sale-720p-with-qr.mp4]]>
              </MediaFile>
            </MediaFiles>

            <!-- VideoClicks (NOT USED for CTV - included for mobile/desktop fallback) -->
            <VideoClicks>
              <ClickThrough><![CDATA[https://brand.com/sale?utm_source=video&utm_medium=click]]></ClickThrough>
            </VideoClicks>
          </Linear>
        </Creative>
      </Creatives>

      <!-- Extensions for QR Code metadata (custom, not VAST standard) -->
      <Extensions>
        <Extension type="QRCodeTracking">
          <QRCodeURL><![CDATA[https://brand.link/ctv-sale?utm_source=ctv&utm_medium=qr&campaign=summer]]></QRCodeURL>
          <QRPosition>bottom-right</QRPosition>
          <QRStartTime>00:00:03</QRStartTime>
          <QREndTime>00:00:27</QREndTime>
        </Extension>
      </Extensions>
    </InLine>
  </Ad>
</VAST>
```

**Notes**:
- QR code is **embedded in the video file** itself (e.g., `ctv-summer-sale-1080p-with-qr.mp4`)
- `<VideoClicks>` are included but **won't fire on CTV devices**
- Extensions show metadata but are **not part of VAST standard**
- Tracking events (impressions, quartiles) **work normally**

---

## Platform-Specific Implementation

### Roku

- **Resolution**: Supports up to 1080p (4K on Roku Ultra)
- **Format**: MP4 (H.264 video, AAC audio)
- **QR Support**: Yes, display QR code on screen
- **Click Support**: No
- **Remote**: Directional pad + OK button (no cursor)

### Amazon Fire TV

- **Resolution**: Supports up to 4K
- **Format**: MP4, WebM
- **QR Support**: Yes
- **Click Support**: No
- **Remote**: Voice remote with Alexa (no cursor)

### Apple TV

- **Resolution**: Supports up to 4K HDR
- **Format**: MP4 (H.264/H.265)
- **QR Support**: Yes
- **Click Support**: No (trackpad for navigation, not precise clicking)
- **Remote**: Siri Remote with trackpad

### Smart TVs (Samsung, LG, etc.)

- **Resolution**: Varies (1080p to 8K)
- **Format**: MP4 preferred
- **QR Support**: Yes
- **Click Support**: No
- **Remote**: Traditional or smart remote (no cursor)

### Chromecast

- **Resolution**: Supports up to 4K
- **Format**: MP4, WebM
- **QR Support**: Yes
- **Click Support**: No (phone/tablet is the controller)
- **Control**: Phone/tablet app (could support clicks in app)

---

## QA Testing Checklist for CTV Ads

When testing CTV ads with the VAST Inspector:

### Creative Quality
- [ ] Video plays in 1920×1080 or 1280×720 resolution
- [ ] Bitrate is appropriate for CTV (3-6 Mbps for 1080p)
- [ ] QR code is visible and prominent in video
- [ ] QR code appears for at least 15 seconds
- [ ] QR code has good contrast against background
- [ ] Call-to-action is clear ("Scan to shop", etc.)

### VAST Tracking
- [ ] Impression URLs fire when ad loads
- [ ] Start event fires when video begins
- [ ] Quartile events fire at 25%, 50%, 75%
- [ ] Complete event fires when video ends
- [ ] All tracking URLs have proper macro replacement
- [ ] Error URLs work if video fails

### QR Code Functionality
- [ ] QR code is scannable from 6-10 feet (TV viewing distance)
- [ ] Landing page URL is correct
- [ ] UTM parameters are present and correct
- [ ] QR analytics platform tracks scans
- [ ] Landing page is mobile-optimized
- [ ] Landing page loads quickly (< 2 seconds)

### Fallback Behavior
- [ ] Desktop/mobile version has clickable area (not QR code)
- [ ] Click tracking works for desktop/mobile
- [ ] ClickThrough URLs are correct
- [ ] Both CTV and desktop/mobile versions tested

---

## Future of CTV Interaction

### Emerging Technologies

1. **Voice Activation**:
   - "Alexa, shop this ad"
   - Voice-activated landing pages
   - Integration with smart speakers

2. **Shoppable TV**:
   - Direct purchase from TV remote
   - Integration with retail platforms
   - One-click buying (Amazon Fire TV)

3. **Second Screen Integration**:
   - Automatic phone pairing
   - Push notifications to paired devices
   - Seamless mobile handoff

4. **Interactive Overlays**:
   - On-screen menus
   - Product carousels
   - Interactive hotspots (requires platform support)

### VAST Specification Evolution

The VAST specification may evolve to include:
- Native QR code support in XML
- CTV-specific tracking events
- Second-screen integration parameters
- Voice interaction tracking

---

## Related Documentation

- [VIDEO-CLICK-TRACKING.md](./VIDEO-CLICK-TRACKING.md) - Desktop/mobile click tracking
- [DEVICE-DETECTION.md](./DEVICE-DETECTION.md) - Device type classification
- [VAST-MACROS.md](./VAST-MACROS.md) - Macro replacement guide
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - All inspector improvements

---

## External Resources

- [IAB VAST 4.x Specification](https://www.iab.com/guidelines/vast/)
- [Sharethrough CTV Dynamic QR Codes](https://www.sharethrough.com/advertisers/ctv-dynamic-qr-codes)
- [Bitly: Why QR Codes for CTV Advertising](https://bitly.com/blog/reasons-to-use-qr-codes-on-ctv-ads/)
- [AdExchanger: QR Code Best Practices for CTV](https://www.adexchanger.com/on-tv-and-video/from-branding-to-action-best-practices-for-using-qr-codes-in-performance-ctv/)

---

**Last Updated**: November 21, 2025
**Research Sources**: Innovid, Sharethrough, Wunderkind, IAB Tech Lab, industry best practices 2025
