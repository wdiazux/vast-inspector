# VAST Macro Replacement

## Overview

The VAST Inspector automatically replaces VAST macros in tracking URLs before firing them. This ensures accurate tracking and matches real-world video player behavior.

## What are VAST Macros?

VAST macros are placeholder tokens in tracking URLs that get replaced with dynamic values when the ad plays. They allow ad servers to collect detailed information about ad playback without hardcoding values.

### Example

**URL with Macros:**
```
https://track.example.com/pixel?ts=[TIMESTAMP]&cb=[CACHEBUSTER]&time=[CONTENTPLAYHEAD]
```

**After Replacement:**
```
https://track.example.com/pixel?ts=1700000000000&cb=847362819&time=00:00:15.234
```

## Supported Macros

### Timestamp & Caching

| Macro | Replaced With | Example | Description |
|-------|--------------|---------|-------------|
| `[TIMESTAMP]` | Unix timestamp (ms) | `1700000000000` | Milliseconds since epoch |
| `[CACHEBUSTER]` | Random number | `847362819` | Prevents URL caching |
| `[CACHEBUSTERS]` | Random number | `192837465` | Same as CACHEBUSTER |
| `[RANDOM]` | Random number | `564738291` | Generic random value |

### Video Playback

| Macro | Replaced With | Example | Description |
|-------|--------------|---------|-------------|
| `[CONTENTPLAYHEAD]` | HH:MM:SS.mmm | `00:01:23.456` | Current video timestamp |
| `[ASSETURI]` | Video URL | `https://cdn.example.com/video.mp4` | Currently playing video |

### Player Information

| Macro | Replaced With | Example | Description |
|-------|--------------|---------|-------------|
| `[PLAYERNAME]` | "VAST-Inspector" | `VAST-Inspector` | Player name |
| `[PLAYERWIDTH]` | Pixels | `1920` | Video player width |
| `[PLAYERHEIGHT]` | Pixels | `1080` | Video player height |
| `[PLAYERSIZE]` | WIDTHxHEIGHT | `1920x1080` | Player dimensions |

### Device & Browser

| Macro | Replaced With | Example | Description |
|-------|--------------|---------|-------------|
| `[DEVICEUA]` | User agent (encoded) | `Mozilla%2F5.0...` | Browser user agent |
| `[DEVICEID]` | Empty string | `` | Not available in browser |
| `[LIMITADTRACKING]` | "0" | `0` | Assume tracking allowed |

### Page Information

| Macro | Replaced With | Example | Description |
|-------|--------------|---------|-------------|
| `[PAGEURL]` | Current URL (encoded) | `https%3A%2F%2Fexample.com` | Page hosting the inspector |
| `[DOMAIN]` | Hostname (encoded) | `example.com` | Current domain |

## How It Works

### 1. Macro Detection

The inspector scans all tracking URLs for macro patterns:
```javascript
// Example tracking URL from VAST XML
const url = "https://track.com/pixel?id=123&ts=[TIMESTAMP]&cb=[CACHEBUSTER]";
```

### 2. Context Building

Before firing, the video player collects current context:
```javascript
{
  videoTime: "00:00:15.234",     // Current playback time
  assetURI: "https://cdn.example.com/video.mp4",
  playerWidth: "1920",
  playerHeight: "1080",
  playerSize: "1920x1080"
}
```

### 3. Macro Replacement

The tracker replaces all macros with actual values:
```javascript
// Before: https://track.com/pixel?id=123&ts=[TIMESTAMP]&cb=[CACHEBUSTER]
// After:  https://track.com/pixel?id=123&ts=1700000000000&cb=847362819
```

### 4. Tracking Pixel Fires

The final URL with replaced macros is sent to the server:
```javascript
const img = new Image();
img.src = processedURL; // URL with macros replaced
```

## Implementation Details

### Case-Insensitive Matching

Macros are matched case-insensitively:
```
[timestamp] → Replaced
[TIMESTAMP] → Replaced
[TimeStamp] → Replaced
```

### Multiple Occurrences

All instances of a macro are replaced:
```
Before: https://track.com/a=[CACHEBUSTER]&b=[CACHEBUSTER]
After:  https://track.com/a=123456789&b=123456789
```

### Quartile Events

Each quartile event gets fresh macro values:
```javascript
// At 25% progress
[CONTENTPLAYHEAD] = "00:00:07.500"

// At 50% progress
[CONTENTPLAYHEAD] = "00:00:15.000"

// At 75% progress
[CONTENTPLAYHEAD] = "00:00:22.500"
```

## Browser Limitations

Some macros cannot be populated in a browser environment:

| Macro | Browser Limitation |
|-------|-------------------|
| `[DEVICEID]` | Device advertising IDs not accessible via web APIs |
| `[IFA]` | Identifier for Advertisers not available in browsers |
| `[IDTYPE]` | ID type cannot be determined |
| `[APPBUNDLE]` | Not applicable (web, not app) |

These macros are replaced with **empty strings** to prevent tracking errors.

## Console Logging

When macros are replaced, the inspector logs details to the console:

```
[Tracker] Replaced macros in URL
  Original: https://track.com/pixel?ts=[TIMESTAMP]&cb=[CACHEBUSTER]&time=[CONTENTPLAYHEAD]
  Replaced: https://track.com/pixel?ts=1700000000000&cb=847362819&time=00:00:15.234
```

## Testing Macro Replacement

### Step 1: Create VAST with Macros

```xml
<VAST version="3.0">
  <Ad>
    <InLine>
      <Impression><![CDATA[https://track.com/imp?ts=[TIMESTAMP]&cb=[CACHEBUSTER]]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://track.com/start?time=[CONTENTPLAYHEAD]&w=[PLAYERWIDTH]&h=[PLAYERHEIGHT]]]></Tracking>
            </TrackingEvents>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

### Step 2: Load VAST in Inspector

1. Paste VAST XML into the inspector
2. Click "Test Ad"
3. Play the video

### Step 3: Verify Replacement

1. Open browser DevTools → Console
2. Look for "Replaced macros in URL" messages
3. Open DevTools → Network tab
4. Check fired tracking URLs - macros should be replaced

**Example Network Request:**
```
https://track.com/imp?ts=1700000000000&cb=847362819
```

## Common Use Cases

### 1. Deduplication

Use `[CACHEBUSTER]` to ensure each tracking request is unique:
```
https://track.com/pixel?id=123&cb=[CACHEBUSTER]
```

### 2. Time-Based Analytics

Use `[CONTENTPLAYHEAD]` to track when users drop off:
```
https://track.com/quartile?event=pause&time=[CONTENTPLAYHEAD]
```

### 3. Player Diagnostics

Use player dimensions to track device types:
```
https://track.com/device?size=[PLAYERSIZE]&ua=[DEVICEUA]
```

### 4. Fraud Detection

Use `[TIMESTAMP]` to detect time-based anomalies:
```
https://track.com/verify?ts=[TIMESTAMP]&url=[PAGEURL]
```

## Best Practices

### For QA Testing:

1. **Always check the Network tab** to see actual fired URLs
2. **Verify timestamps** are recent (not cached)
3. **Test quartile macros** by playing through the video
4. **Check console logs** for macro replacement details

### For VAST Authors:

1. **Use standard macro names** from the VAST specification
2. **URL-encode macro values** when needed (inspector does this automatically for some macros)
3. **Test with multiple players** - macro support varies
4. **Document custom macros** if using proprietary extensions

## Macro Specification References

- **VAST 2.0**: Basic macros like `[TIMESTAMP]` and `[CACHEBUSTER]`
- **VAST 3.0**: Added `[CONTENTPLAYHEAD]`, `[ASSETURI]`
- **VAST 4.0+**: Additional macros for measurement and verification

Full specification: [IAB VAST 4.x Documentation](https://www.iab.com/guidelines/vast/)

## Troubleshooting

### Issue: Macros Not Being Replaced

**Symptoms**: URLs show `[TIMESTAMP]` in Network tab

**Causes**:
- Typo in macro name (e.g., `[TIMESTMAP]`)
- Custom macro not supported by inspector
- URL encoding issues

**Solution**: Check console for "Replaced macros" messages. If absent, macro isn't recognized.

### Issue: All Macros Show Same Value

**Symptoms**: `[CACHEBUSTER]` always returns same number

**Causes**:
- Browser caching
- Tracking URL already fired (inspector prevents duplicates)

**Solution**: Clear browser cache or use "Clear All" button in inspector.

### Issue: `[CONTENTPLAYHEAD]` Shows 00:00:00

**Symptoms**: Time always zero even during playback

**Causes**:
- Macro replaced before video starts
- Impressions fire immediately (before playback)

**Solution**: This is expected for impression trackers. Check quartile events for non-zero times.

## Code Example

Here's how macros are replaced in the source code:

```javascript
// From src/tracker.js
replaceMacros(url, context = {}) {
  const macros = {
    '[TIMESTAMP]': Date.now(),
    '[CACHEBUSTER]': Math.floor(Math.random() * 1000000000),
    '[CONTENTPLAYHEAD]': context.videoTime || '00:00:00.000',
    '[ASSETURI]': context.assetURI || '',
    '[PLAYERWIDTH]': context.playerWidth || '',
    '[PLAYERHEIGHT]': context.playerHeight || '',
    '[PLAYERSIZE]': context.playerSize || '',
    '[DEVICEUA]': encodeURIComponent(navigator.userAgent || ''),
    '[PAGEURL]': encodeURIComponent(window.location.href),
    '[DOMAIN]': encodeURIComponent(window.location.hostname)
  };

  let replacedURL = url;
  for (const [macro, value] of Object.entries(macros)) {
    const regex = new RegExp(macro.replace(/[[\]]/g, '\\$&'), 'gi');
    replacedURL = replacedURL.replace(regex, value);
  }

  return replacedURL;
}
```

## Future Enhancements

Potential improvements for macro support:

- [ ] GDPR consent macros (`[GDPR]`, `[GDPR_CONSENT]`)
- [ ] US Privacy macros (`[US_PRIVACY]`)
- [ ] Server-side macro replacement option
- [ ] Custom macro definitions via UI
- [ ] Macro validation and warnings

---

**Last Updated**: 2025-11-21
**Related Documentation**:
- [URL Encoding](./URL-ENCODING.md)
- [VAST Specification](https://www.iab.com/guidelines/vast/)
- [CLAUDE.md](../CLAUDE.md)
