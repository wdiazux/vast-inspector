# SIMID Support in VAST Inspector

## Overview

This document explains SIMID (Secure Interactive Media Interface Definition) support in the VAST Inspector and how it compares to Google IMA VAST Inspector.

**Last Updated**: December 1, 2025

---

## What is SIMID?

**SIMID (Secure Interactive Media Interface Definition)** is an IAB Tech Lab standard for interactive video ads that contain:
- Clickable buttons and UI elements
- Form inputs (email, phone, zip code)
- JavaScript-driven interactions
- Dynamic content updates
- Two-way communication with the player

**Key Differences from Standard Video Ads**:
- Standard Video: Pure video file (MP4, WebM) with click tracking overlay
- VPAID: Programmatic ad interface (Flash/JavaScript) - older standard
- **SIMID**: Modern secure interactive ad standard with HTML5 elements

**SIMID Specification**: https://github.com/InteractiveAdvertisingBureau/SIMID

---

## SIMID Detection in VAST Inspector

### How Detection Works

The VAST Inspector detects SIMID ads by checking the `apiFramework` attribute on `<MediaFile>` elements:

```xml
<MediaFile
  delivery="progressive"
  type="text/html"
  apiFramework="SIMID"
  width="1920"
  height="1080">
  <![CDATA[https://interactive-ads.example.com/simid/creative.html]]>
</MediaFile>
```

**Detection Logic** (src/vast-parser.js:277-279):
```javascript
// Detect SIMID (Secure Interactive Media Interface Definition)
const isSIMID = apiFramework === 'SIMID' ||
                (apiFramework && apiFramework.toLowerCase().includes('simid'));
```

**Detection Criteria**:
- ✅ `apiFramework="SIMID"` (exact match)
- ✅ `apiFramework="simid"` (case-insensitive)
- ✅ `apiFramework="SIMID-1.1"` (version suffix)
- ✅ Any string containing "simid"

---

## What the VAST Inspector DOES Support ✅

### 1. SIMID Detection

**Feature**: Automatically detects SIMID creatives in VAST XML

**Visual Indicators**:
- 🔵 **Blue "SIMID Interactive" badge** on media files
- ⚠️ **Warning banner** explaining SIMID requirements
- **API Framework display** showing "SIMID" in creative details

**Example Output**:
```
┌──────────────────────────────────────────────────────┐
│ ⚠️ SIMID Interactive Ad Detected                     │
│                                                       │
│ This VAST tag contains SIMID (Secure Interactive     │
│ Media Interface Definition) creatives with           │
│ interactive buttons and JavaScript elements.         │
│                                                       │
│ What is SIMID? Interactive ads with clickable        │
│ buttons, forms, and JavaScript interactions.         │
│                                                       │
│ To test SIMID ads: Use Google IMA SDK with SIMID     │
│ support or dedicated SIMID testing tools.            │
└──────────────────────────────────────────────────────┘
```

### 2. SIMID Metadata Parsing

**Parsed Elements**:
- ✅ MediaFile URL (SIMID creative HTML)
- ✅ Dimensions (width, height)
- ✅ API Framework version
- ✅ Impression URLs (work normally)
- ✅ Click tracking URLs (work normally)
- ✅ Quartile tracking events (work normally)
- ✅ Error URLs (work normally)

### 3. Tracking URL Extraction

**All VAST tracking works normally for SIMID ads**:
- ✅ Impression tracking when ad loads
- ✅ Quartile events (start, 25%, 50%, 75%, complete)
- ✅ Click tracking URLs
- ✅ Error tracking URLs

**Why tracking works**: SIMID uses standard VAST tracking alongside interactive elements

### 4. Fallback Media Detection

**SIMID ads typically include fallback media files**:
```xml
<MediaFiles>
  <!-- SIMID interactive creative -->
  <MediaFile apiFramework="SIMID" type="text/html">...</MediaFile>

  <!-- Fallback video for non-SIMID players -->
  <MediaFile type="video/mp4" width="1920" height="1080">...</MediaFile>
</MediaFiles>
```

**Inspector behavior**:
- Shows SIMID badge on interactive creative
- Shows standard video badge on fallback
- Allows playing fallback video (if present)

---

## What the VAST Inspector DOES NOT Support ❌

### 1. SIMID Creative Execution

**Not Supported**: Loading and running SIMID interactive HTML

**Why**: SIMID requires implementing the full SIMID API specification:
- `EnvironmentData` interface
- `CreativeData` interface
- `MediaSession` interface
- Two-way messaging protocol
- Session management
- Event handling

**Equivalent to Google IMA**: Google IMA VAST Inspector also does NOT execute SIMID creatives - it only detects and displays metadata.

### 2. Interactive Element Testing

**Not Supported**: Testing buttons, forms, or JavaScript interactions

**Why**: Requires SIMID player API implementation

**Alternative**: Use tools with SIMID player support:
- Google IMA SDK (HTML5)
- SIMID reference implementation
- Ad server preview tools

### 3. SIMID-Specific Events

**Not Supported**: SIMID-specific tracking events beyond standard VAST:
- `adBuffering`
- `adInteraction`
- `adResized`
- Custom SIMID events

**Why**: These events are handled by SIMID player, not VAST parser

---

## Comparison with Google IMA VAST Inspector

### What Google IMA VAST Inspector Does

**Detection**:
- ✅ Detects `apiFramework="SIMID"`
- ✅ Shows warning that SIMID requires compatible player
- ✅ Displays SIMID metadata

**Playback**:
- ❌ Does NOT execute SIMID interactive elements
- ✅ Can play fallback video (if present)
- ✅ Fires standard VAST tracking

**Reference**: https://github.com/googleads/googleads-ima-html5/tree/gh-pages/vsi

### What Our VAST Inspector Does

**Detection**:
- ✅ Detects `apiFramework="SIMID"` (exact match to Google IMA)
- ✅ Shows warning banner (more detailed than Google IMA)
- ✅ Displays SIMID badge and metadata
- ✅ Highlights SIMID creatives with blue accent

**Playback**:
- ❌ Does NOT execute SIMID interactive elements (same as Google IMA)
- ✅ Can play fallback video (if present)
- ✅ Fires standard VAST tracking

### Feature Comparison Table

| Feature | Google IMA VSI | Our VAST Inspector |
|---------|---------------|-------------------|
| Detect `apiFramework="SIMID"` | ✅ | ✅ |
| Case-insensitive detection | ❌ | ✅ |
| Warning message | ✅ Basic | ✅ Detailed |
| Visual badge | ❌ | ✅ Blue badge |
| Execute SIMID creative | ❌ | ❌ |
| Play fallback video | ✅ | ✅ |
| Parse tracking URLs | ✅ | ✅ |
| Fire impression tracking | ✅ | ✅ |
| Fire quartile tracking | ✅ | ✅ |
| Fire click tracking | ✅ | ✅ |
| VAST 4.x support | ✅ | ✅ |

**Conclusion**: Our implementation matches Google IMA VAST Inspector functionality with additional visual enhancements.

---

## Testing SIMID Detection

### Test Case 1: Basic SIMID Detection

**Input**: Load test-simid.xml (provided in repository)

**Expected Output**:
1. ✅ Warning banner: "SIMID Interactive Ad Detected"
2. ✅ Blue "SIMID Interactive" badge on first media file
3. ✅ API Framework shows "SIMID"
4. ✅ Impression URLs parse correctly
5. ✅ Click tracking URLs parse correctly
6. ✅ Quartile events parse correctly

**Test File**: `test-simid.xml`

### Test Case 2: SIMID with Fallback Video

**VAST Structure**:
```xml
<MediaFiles>
  <MediaFile apiFramework="SIMID" type="text/html">
    https://interactive-ads.example.com/simid/creative.html
  </MediaFile>
  <MediaFile type="video/mp4" width="1920" height="1080">
    https://cdn.example.com/ads/fallback-video.mp4
  </MediaFile>
</MediaFiles>
```

**Expected Output**:
1. ✅ SIMID badge on first media file
2. ✅ No badge on fallback video (standard MP4)
3. ✅ Warning banner appears
4. ✅ Can select and play fallback video

### Test Case 3: SIMID Version Detection

**Input**: SIMID with version suffix
```xml
<MediaFile apiFramework="SIMID-1.1" type="text/html">
```

**Expected Output**:
1. ✅ Detects as SIMID (case-insensitive, contains "simid")
2. ✅ API Framework displays "SIMID-1.1"
3. ✅ Warning banner appears

### Test Case 4: Mixed VPAID and SIMID

**VAST Structure**:
```xml
<MediaFiles>
  <MediaFile apiFramework="SIMID" type="text/html">...</MediaFile>
  <MediaFile apiFramework="VPAID" type="application/javascript">...</MediaFile>
  <MediaFile type="video/mp4">...</MediaFile>
</MediaFiles>
```

**Expected Output**:
1. ✅ SIMID warning banner (higher priority than VPAID)
2. ✅ SIMID badge on first media file
3. ✅ VPAID badge on second media file
4. ✅ No badge on standard video

---

## Real-World SIMID VAST Example

Based on the user's test URL:
```
https://vast-serve.videostorm.com/simid/4.2/MMNF_IXSU_7AB3/linear.xml
```

**Expected Structure**:
```xml
<VAST version="4.2">
  <Ad>
    <InLine>
      <Creatives>
        <Creative>
          <Linear>
            <MediaFiles>
              <MediaFile apiFramework="SIMID" type="text/html" width="1920" height="1080">
                https://vast-serve.videostorm.com/.../simid-creative.html
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

**Inspector Behavior**:
1. ✅ Detects SIMID from `apiFramework="SIMID"`
2. ✅ Shows warning banner
3. ✅ Displays blue SIMID badge
4. ✅ Classifies as "Desktop" (1920×1080)
5. ✅ Parses all tracking URLs
6. ❌ Cannot play SIMID creative (HTML file, not video)
7. ✅ Will fire impression and tracking URLs

**CORS Limitation**: If URL has CORS restrictions (403 error), user must:
1. Open URL in new tab
2. Copy VAST XML response
3. Paste into "VAST XML" input mode

---

## Implementation Details

### Code Locations

**SIMID Detection**:
- File: `src/vast-parser.js`
- Lines: 277-279
- Commit: 79dcad2

**Warning Banner**:
- File: `src/ui.js`
- Lines: 176-188
- Commit: 79dcad2

**SIMID Badge Display**:
- File: `src/ui.js`
- Lines: 313-315
- Commit: 79dcad2

**CSS Styling**:
- File: `styles/main.css`
- Lines: 979-1001
- Commit: 79dcad2

### Detection Algorithm

```javascript
// 1. Extract apiFramework attribute
const apiFramework = mediaFileElement.getAttribute('apiFramework');

// 2. Check for SIMID
const isSIMID = apiFramework === 'SIMID' ||  // Exact match
                (apiFramework && apiFramework.toLowerCase().includes('simid'));  // Contains

// 3. Store flag in parsed data
mediaFile.isSIMID = isSIMID;

// 4. Check all media files for SIMID
const hasSIMID = linearCreative.data.mediaFiles.some(mf => mf.isSIMID);

// 5. Display warning if SIMID detected
if (hasSIMID) {
  // Show warning banner
  // Add SIMID badge to media files
}
```

---

## SIMID vs VPAID

### Key Differences

| Feature | SIMID | VPAID |
|---------|-------|-------|
| **Standard** | Modern (2019+) | Legacy (2012) |
| **Security** | Sandboxed iframe | Full page access |
| **Technology** | HTML5, JavaScript | Flash/JavaScript |
| **Player Control** | Two-way messaging | Ad controls player |
| **Future** | Active development | Deprecated |
| **Detection** | `apiFramework="SIMID"` | `apiFramework="VPAID"` |

### Detection Priority

**Inspector shows SIMID warning over VPAID warning**:
```javascript
if (hasSIMID) {
  // Show SIMID warning (higher priority)
} else if (hasVPAID) {
  // Show VPAID warning only if no SIMID
}
```

**Why**: SIMID is the modern standard; if both are present, SIMID takes precedence.

---

## Troubleshooting

### Issue: SIMID Badge Not Showing

**Symptoms**: Ad loads but no SIMID badge appears

**Possible Causes**:
1. `apiFramework` attribute missing or incorrect
2. VAST XML parsing error
3. JavaScript error in detection logic

**Solution**:
```javascript
// Check in browser console:
console.log('Has SIMID:', document.querySelector('.simid-badge') !== null);

// Inspect parsed data:
console.log('Parsed media files:', vastData.ads[0].inline.creatives[0].data.mediaFiles);
```

### Issue: Warning Banner Not Appearing

**Symptoms**: SIMID badge shows but warning doesn't

**Check**:
1. JavaScript console for errors
2. `hasSIMID` variable in code
3. CSS for `.warning-banner` class

### Issue: SIMID Creative Won't Play

**This is expected behavior!** SIMID creatives require SIMID player API implementation.

**Workaround**:
1. Look for fallback video in media files
2. Select fallback video to play
3. Or use Google IMA SDK for SIMID testing

---

## Future Enhancements

Potential improvements for SIMID support:

- [ ] Parse SIMID Extensions for creative parameters
- [ ] Extract SIMID version from Extensions
- [ ] Display SIMID-specific metadata (creative params, session data)
- [ ] Link to SIMID specification documentation
- [ ] Show SIMID creative URL in iframe (non-interactive preview)
- [ ] Detect SIMID events in Extensions

**Not Planned**: Full SIMID player implementation (out of scope for basic inspector)

---

## References

- [IAB SIMID Specification](https://github.com/InteractiveAdvertisingBureau/SIMID)
- [Google IMA VAST Inspector](https://github.com/googleads/googleads-ima-html5/tree/gh-pages/vsi)
- [VAST 4.x Specification](https://www.iab.com/guidelines/vast/)
- [SIMID vs VPAID Comparison](https://www.iab.com/guidelines/simid/)

---

**Last Updated**: December 1, 2025
**Implementation Verified**: ✅ Working as of commit 79dcad2
**Compatibility**: Matches Google IMA VAST Inspector functionality
