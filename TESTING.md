# VAST Inspector Testing Guide

## Quick Start Testing

### Test with Your VAST URL

1. **Start the inspector:**
   ```bash
   npm start
   ```

2. **Open in browser:** http://localhost:8080

3. **Enter your VAST URL:**
   ```
   https://vast-serve.videostorm.com/video/3.0/BQTS_IRGP_MJYA/linear.xml?macro_set=mediamath&site=[BID_ATTR.site]&app_name=[BID_ATTR.app_name]...
   ```

4. **Click "Test Ad"**

5. **Observe the results:**
   - VAST info section shows ad details
   - Tracking URLs section lists ALL tracking URLs by category
   - Video player loads the ad
   - Event log shows real-time events

## What You'll See

### 📊 VAST Information
- VAST version
- Ad system
- Ad title
- Number of creatives
- Duration
- Media files available

### 🔗 Tracking URLs Section

The inspector automatically categorizes all tracking URLs:

#### **Impressions**
All `<Impression>` tags from the VAST XML
```
○ https://servedby.flashtalking.com/imp/8/296348;10162770;201;pixel;...
○ https://tracking.example.com/impression?campaign=...
```
- `○` = Not fired yet
- `✓` = Successfully fired

#### **Click Tracking**
- **[clickThrough]** - Landing page URL
- **[clickTracking]** - Tracking beacons that fire on click
```
○ [clickThrough] https://www.example.com/landing-page
○ [clickTracking] https://tracking.example.com/click?...
```

#### **Event Tracking**
All `<Tracking event="...">` tags organized by event type:
```
○ [start] https://tracking.example.com/start?...
○ [firstQuartile] https://tracking.example.com/q1?...
○ [midpoint] https://tracking.example.com/q2?...
○ [thirdQuartile] https://tracking.example.com/q3?...
○ [complete] https://tracking.example.com/complete?...
```

#### **Error Tracking**
All `<Error>` tags for error reporting:
```
○ https://tracking.example.com/error?code=[ERRORCODE]
```

### 🖼️ Tracking Pixels Section

Real-time monitoring of fired pixels:

```
Tracking Pixels
Total: 15  Success: 12  Failed: 0

✓ impression - https://servedby.flashtalking.com/imp/...
  Fired at 3:45:23 PM

✓ click - clickTracking - https://tracking.example.com/click...
  Fired at 3:45:45 PM

✓ event - start - https://tracking.example.com/start...
  Fired at 3:45:30 PM
```

### 📝 Event Log

Real-time event logging with timestamps:
```
[3:45:30 PM] [0.00s] [play] Video started playing
[3:45:30 PM] [0.00s] [tracking] Fired start tracking
[3:45:35 PM] [5.23s] [tracking] Fired first quartile tracking (25%)
[3:45:40 PM] [10.45s] [tracking] Fired midpoint tracking (50%)
[3:45:42 PM] [12.15s] [click] Video clicked
```

## Testing Workflow

### Test Case 1: Verify All Tracking URLs Are Captured

1. Load your VAST URL
2. Check "Tracking URLs" section
3. Verify you see:
   - ✅ All impression URLs (including Flashtalking pixels)
   - ✅ All click tracking URLs
   - ✅ All event tracking URLs (start, quartiles, complete)
   - ✅ Error tracking URLs

**Expected:** All URLs from VAST XML are displayed with macros intact

### Test Case 2: Monitor Tracking Pixel Firing

1. Load ad
2. Watch "Tracking Pixels" section
3. Play video
4. Verify:
   - ✅ Impression pixels fire immediately
   - ✅ Start event fires when video plays
   - ✅ Quartile events fire at 25%, 50%, 75%
   - ✅ All pixels show "success" status

**Expected:** Real-time pixel firing with timestamps

### Test Case 3: Click Tracking

1. Load and play ad
2. Click on the video
3. Verify:
   - ✅ Click tracking URLs fire
   - ✅ ClickThrough URL opens in new tab
   - ✅ "click" event appears in log
   - ✅ Pixels section shows fired click trackers

**Expected:** All click-related tracking fires correctly

### Test Case 4: Complete Tracking Sequence

1. Load ad
2. Let video play completely
3. Observe event log for sequence:
   ```
   1. ad-loaded
   2. loaded-metadata
   3. play
   4. tracking (start)
   5. tracking (firstQuartile)
   6. tracking (midpoint)
   7. tracking (thirdQuartile)
   8. ended
   9. tracking (complete)
   ```

**Expected:** All events fire in correct order

## Macro Handling

The inspector **preserves all macros** in tracking URLs. This is intentional for QA purposes.

### Example: Flashtalking Pixel
```
https://servedby.flashtalking.com/imp/8/296348;10162770;201;pixel;APEX;VIDAPXDEALSVIDDSK1X115SSSODOWSNONENONENONEDPNONENTLNONEDSKIDVAPXINFILLION15SP38Q68D/?gdpr=${GDPR}&gdpr_consent=${GDPR_CONSENT_78}&us_privacy=${US_PRIVACY}&ft_creative=5787336&ft_id=[DEVICEID]&pbMethods=[PLAYBACKMETHODS]|[CONTINUOUSPLAY]|[TIMESINCEINTERACTION]&cachebuster=[timestamp]
```

**You'll see:**
- Exact URL with `${GDPR}`, `[DEVICEID]`, etc. macros
- The pixel will still fire (browser sends request with macros unreplaced)
- In DevTools Network tab, you can see the actual fired URL

**To verify macro replacement:**
1. Open browser DevTools
2. Go to Network tab
3. Play the ad
4. Look for requests to tracking domains
5. Check query parameters to see actual values

## Browser DevTools Integration

### Network Tab Verification

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by domain (e.g., "flashtalking.com")
4. Play the ad
5. See real requests with actual macro values

### Console Logging

The inspector logs all tracking activity:
```
[Tracker] Fired impression: https://servedby.flashtalking.com/imp/...
[VideoPlayer] play: Video started playing
[Tracker] Fired event (start): https://tracking.example.com/start
```

## Common Issues & Solutions

### Issue: CORS Error - Cannot Fetch VAST

**Solution:**
1. Switch to "VAST XML" mode
2. Fetch the VAST XML separately (curl, Postman, browser)
3. Paste the XML directly into the inspector

### Issue: Video Won't Play (Autoplay Blocked)

**Solution:**
1. Click the play button manually
2. Check browser autoplay policies
3. Mute the video (muted videos can autoplay)

### Issue: Tracking Pixels Show "Failed"

**Possible Causes:**
1. Network timeout (5s limit)
2. Invalid URL
3. Ad blocker blocking tracking domains
4. CORS restrictions

**Debugging:**
1. Check browser console for errors
2. Verify URLs in Network tab
3. Try disabling ad blockers
4. Check if domain is reachable

### Issue: Click Tracking Not Working

**Verify:**
1. ClickThrough URL exists in VAST
2. Pop-up blocker isn't interfering
3. Click event appears in Event Log
4. Network tab shows tracking requests

## Advanced Testing

### Testing with curl

Fetch VAST XML to inspect:
```bash
curl -X GET "https://vast-serve.videostorm.com/video/3.0/BQTS_IRGP_MJYA/linear.xml?..." > vast-response.xml
```

Then paste the XML into inspector's "VAST XML" mode.

### Testing with Postman

1. Create GET request with your VAST URL
2. Send request
3. Copy XML response
4. Paste into inspector

### Comparing with Reference Implementation

Test the same VAST URL in:
1. This inspector
2. Google's VAST Inspector
3. Your own video player

Compare:
- Number of tracking URLs detected
- Firing sequence
- Event timing

## QA Checklist for Ad Tags

- [ ] VAST XML is valid and parsable
- [ ] All impression trackers are present
- [ ] Click tracking URLs exist
- [ ] ClickThrough URL is correct landing page
- [ ] Quartile events (start, 25%, 50%, 75%, 100%) are defined
- [ ] Error tracking URLs are present
- [ ] Video MediaFiles are accessible
- [ ] Video format is supported (MP4, WebM)
- [ ] All macros use correct syntax
- [ ] Privacy macros (GDPR, CCPA) are included
- [ ] Tracking domains are reachable
- [ ] No mixed content issues (HTTP/HTTPS)

## Performance Metrics to Monitor

1. **VAST Load Time:** How long to fetch and parse VAST
2. **First Impression:** Time from load to first impression fire
3. **Video Start Time:** Time from load to video playback
4. **Tracking Latency:** Time between event and tracker firing
5. **Success Rate:** Percentage of trackers that fire successfully

All visible in the Event Log with timestamps!
