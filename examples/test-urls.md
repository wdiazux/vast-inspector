# Test VAST URLs

**⚠️ IMPORTANT SECURITY NOTICE:**
- **DO NOT commit real production VAST URLs to this public repository**
- **DO NOT include actual campaign IDs, creative IDs, or account numbers**
- **DO NOT share URLs with sensitive business data**

This file contains generic example patterns. Replace placeholders with your test URLs locally.

## Example VAST URL Pattern

```
https://vast-server.example.com/video/3.0/[CREATIVE_ID]/linear.xml?
  macro_set=[PLATFORM]&
  site=[BID_ATTR.site]&
  app_name=[BID_ATTR.app_name]&
  device=[BID_ATTR.device]&
  campaign=[AD_ATTR.campaign]&
  creative=[AD_ATTR.creative]
```

**Features to test:**
- VAST 3.0 parsing
- URL macro preservation
- Impression tracking
- Click tracking
- Quartile events

## Example Tracking Pixel Pattern

### Generic Impression Pixel
```
https://tracking-server.example.com/imp/[ACCOUNT]/[CAMPAIGN]/[CREATIVE]/pixel/?
  gdpr=${GDPR}&
  gdpr_consent=${GDPR_CONSENT_78}&
  us_privacy=${US_PRIVACY}&
  creative_id=[CREATIVE_ID]&
  device_id=[DEVICEID]&
  pbMethods=[PLAYBACKMETHODS]&
  cachebuster=[timestamp]
```

**Macros to observe:**
- `${GDPR}` - GDPR consent flag
- `${GDPR_CONSENT_78}` - Consent string
- `${US_PRIVACY}` - CCPA privacy string
- `[DEVICEID]` - Device identifier
- `[PLAYBACKMETHODS]` - Video playback methods
- `[CONTINUOUSPLAY]` - Continuous play flag
- `[TIMESINCEINTERACTION]` - Time since user interaction
- `[timestamp]` - Cache buster

## What the Inspector Will Show

### 1. Impression Tracking
All `<Impression>` URLs will be displayed in the "Impressions" section with:
- ✓ Status indicator (fired/not fired)
- Full URL with macros intact
- Timestamp when fired

### 2. Click Tracking
All click-related URLs will be shown:
- **ClickThrough** - Landing page URL (opens in new tab on click)
- **ClickTracking** - Tracking beacons fired on click

### 3. Event Tracking
Quartile and custom events:
- `start` - When video begins
- `firstQuartile` - At 25% progress
- `midpoint` - At 50% progress
- `thirdQuartile` - At 75% progress
- `complete` - When video ends
- `pause`, `resume`, `mute`, `unmute`, etc.

### 4. Tracking Pixels Display
Real-time pixel monitoring showing:
- Pixel type (impression/click/event)
- Firing status (success/failed)
- Full URL
- Timestamp

## Testing Checklist

- [ ] Paste VAST URL in the inspector
- [ ] Click "Test Ad"
- [ ] Verify VAST info displays correctly
- [ ] Check all impression URLs are listed
- [ ] Check all click tracking URLs are listed
- [ ] Verify event tracking URLs are present
- [ ] Play the video ad
- [ ] Monitor which trackers fire in real-time
- [ ] Check "Tracking Pixels" section for firing status
- [ ] Click the video to test click tracking
- [ ] Verify ClickThrough URL opens
- [ ] Verify ClickTracking beacons fire
- [ ] Review event log for complete tracking sequence

## Common Macro Types

The inspector preserves all macros in URLs for inspection:

**VAST Standard Macros:**
- `[ASSETURI]` - Asset URI
- `[CONTENTPLAYHEAD]` - Current video timestamp
- `[TIMESTAMP]` - Current timestamp
- `[CACHEBUSTING]` - Random number for cache busting
- `[ERRORCODE]` - Error code (for error tracking)

**Privacy & Consent Macros:**
- `${GDPR}` - GDPR applies (0 or 1)
- `${GDPR_CONSENT_*}` - IAB consent string
- `${US_PRIVACY}` - CCPA privacy string

**Device & Environment:**
- `[DEVICEID]` - Device identifier
- `[MOBILE_DEVICE_ID]` - Mobile device ID
- `[PLAYBACKMETHODS]` - Video playback methods
- `[LIMITADTRACKING]` - Limit ad tracking flag

**Custom Platform Macros:**
- `[BID_ATTR.*]` - Bid attributes (MediaMath)
- `[AD_ATTR.*]` - Ad attributes
- `[MM_UUID]` - MediaMath UUID
- `[ft_*]` - Flashtalking specific

## Notes for QA Testing

1. **Macro Preservation**: The inspector displays URLs exactly as they appear in the VAST XML. Macros are NOT replaced, allowing you to verify the correct macro syntax is present.

2. **Cross-Origin Requests**: Some VAST URLs may be blocked by CORS policies. If this happens:
   - Check browser console for CORS errors
   - Use the "VAST XML" input mode to paste the XML directly
   - Test with a CORS proxy if needed

3. **Tracking Pixel Firing**: The inspector fires real tracking requests using `<img>` tags. You can:
   - Monitor in browser DevTools Network tab
   - See firing status in the "Tracking Pixels" section
   - Check third-party analytics platforms for confirmation

4. **Click Tracking Best Practices**:
   - Click tracking URLs should fire before ClickThrough opens
   - Verify multiple click tracking URLs all fire
   - Test that pop-up blockers don't interfere

5. **Event Sequence Verification**:
   - Impressions fire immediately when ad loads
   - Start event fires when video begins playing
   - Quartiles fire at exactly 25%, 50%, 75% of duration
   - Complete fires when video ends naturally
