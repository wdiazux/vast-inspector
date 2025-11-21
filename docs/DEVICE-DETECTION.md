# Device Detection - Video Ad Creative Dimensions

## Overview

The VAST Inspector automatically detects device types based on video creative dimensions. This helps QA engineers understand which devices each creative is targeting.

**Updated**: November 21, 2025 - Fixed logic bug where CTV dimensions were incorrectly classified

---

## Detection Logic

The detection follows this priority order:

1. **Portrait Aspect Ratio** (< 0.75) → Mobile Portrait
2. **Exact CTV Dimensions** (16:9 HD/4K) → CTV/OTT
3. **Small Dimensions** (≤ 960×540) → Mobile
4. **Tablet Dimensions** (768-1024 range) → Tablet
5. **Large Dimensions** (≥ 1024) → Desktop
6. **Everything Else** → Other

---

## Device Categories

### 📱 Mobile Portrait
**Criteria**: Aspect ratio < 0.75 (height > width × 1.33)

| Resolution | Aspect Ratio | Device Examples |
|------------|--------------|-----------------|
| 360×640 | 0.56 (9:16) | iPhone SE, Android |
| 375×667 | 0.56 (9:16) | iPhone 6/7/8 |
| 414×896 | 0.46 (9:19.5) | iPhone XR/11 |
| 390×844 | 0.46 (9:19.5) | iPhone 12/13 |
| 360×780 | 0.46 (9:19.5) | Android (tall) |

**Badge Color**: 🔵 Blue

---

### 📺 CTV/OTT
**Criteria**: Exact match of standard broadcast resolutions (16:9)

| Resolution | Format | Device Examples |
|------------|--------|-----------------|
| 1280×720 | 720p HD | Roku, Fire TV, Apple TV |
| 1920×1080 | 1080p Full HD | Smart TVs, Chromecast |
| 2560×1440 | 1440p QHD | High-end streaming devices |
| 3840×2160 | 4K UHD | 4K TVs, Premium devices |

**Badge Color**: 🟣 Purple

**Note**: These exact dimensions take priority over Desktop classification to correctly identify TV/streaming device ads.

---

### 📱 Mobile (Landscape)
**Criteria**: Width ≤ 960 AND Height ≤ 540

| Resolution | Aspect Ratio | Device Examples |
|------------|--------------|-----------------|
| 640×360 | 1.78 (16:9) | Mobile SD |
| 854×480 | 1.78 (16:9) | Mobile 480p |
| 960×540 | 1.78 (16:9) | Mobile qHD |

**Badge Color**: 🔵 Blue

---

### 📊 Tablet
**Criteria**: Width 768-1024 AND Height 768-1024

| Resolution | Aspect Ratio | Device Examples |
|------------|--------------|-----------------|
| 768×1024 | 0.75 (3:4) | iPad portrait |
| 1024×768 | 1.33 (4:3) | iPad landscape |
| 800×1280 | 0.625 (5:8) | Android tablets portrait |

**Badge Color**: 🟠 Orange

---

### 💻 Desktop
**Criteria**: Width ≥ 1024 (but NOT exact CTV dimensions)

| Resolution | Aspect Ratio | Use Cases |
|------------|--------------|-----------|
| 1024×576 | 1.78 (16:9) | Small desktop player |
| 1366×768 | 1.78 (16:9) | Laptop HD |
| 1600×900 | 1.78 (16:9) | Desktop HD+ |
| 2560×1440 | 1.78 (16:9) | Desktop QHD |

**Badge Color**: 🟢 Green

**Note**: CTV dimensions (1280×720, 1920×1080, 3840×2160) are classified as CTV/OTT instead of Desktop.

---

### ❓ Other
**Criteria**: Doesn't match any above categories

| Examples | Why "Other" |
|----------|-------------|
| 1000×1000 | Square aspect ratio (unusual for video) |
| 500×300 | Small non-standard size |
| 2000×500 | Very wide banner-like dimension |

**Badge Color**: ⚪ Gray

---

## Bug Fix (November 21, 2025)

### Previous Bug

The old logic had this order:

```javascript
// ❌ BUG: This always matched first!
if (width <= 1280 && height <= 720) {
  return 'Tablet/Desktop';  // 1280×720 matched HERE
}

// This never ran for 1280×720
if (width === 1280 && height === 720) {
  return 'CTV/OTT';  // Never reached!
}
```

**Result**: 1280×720 (720p HD) and 1920×1080 (1080p) were incorrectly classified as "Tablet/Desktop" instead of "CTV/OTT".

### Fixed Logic

```javascript
// ✅ FIXED: Check exact CTV dimensions FIRST
if ((width === 1280 && height === 720) ||
    (width === 1920 && height === 1080) ||
    (width === 3840 && height === 2160)) {
  return 'CTV/OTT';  // Runs first!
}

// Then check other categories
if (width <= 960 && height <= 540) {
  return 'Mobile';
}
```

**Result**: Standard broadcast resolutions are now correctly identified as CTV/OTT.

---

## Testing Device Detection

### Test Case 1: Mobile Portrait

```xml
<MediaFile type="video/mp4" width="360" height="640">
  https://cdn.example.com/ad-mobile-portrait.mp4
</MediaFile>
```

**Expected**: 🔵 Mobile Portrait badge
**Calculation**: 360/640 = 0.56 < 0.75 ✓

---

### Test Case 2: CTV 1080p

```xml
<MediaFile type="video/mp4" width="1920" height="1080">
  https://cdn.example.com/ad-ctv-1080p.mp4
</MediaFile>
```

**Expected**: 🟣 CTV/OTT badge
**Calculation**: Exact match 1920×1080 ✓
**Previous Bug**: Would show "Tablet/Desktop" ❌
**Now Fixed**: Shows "CTV/OTT" ✅

---

### Test Case 3: CTV 720p

```xml
<MediaFile type="video/mp4" width="1280" height="720">
  https://cdn.example.com/ad-ctv-720p.mp4
</MediaFile>
```

**Expected**: 🟣 CTV/OTT badge
**Calculation**: Exact match 1280×720 ✓
**Previous Bug**: Would show "Tablet/Desktop" ❌
**Now Fixed**: Shows "CTV/OTT" ✅

---

### Test Case 4: Mobile Landscape

```xml
<MediaFile type="video/mp4" width="854" height="480">
  https://cdn.example.com/ad-mobile-480p.mp4
</MediaFile>
```

**Expected**: 🔵 Mobile badge
**Calculation**: 854 ≤ 960 AND 480 ≤ 540 ✓

---

### Test Case 5: Tablet

```xml
<MediaFile type="video/mp4" width="1024" height="768">
  https://cdn.example.com/ad-tablet.mp4
</MediaFile>
```

**Expected**: 🟠 Tablet badge
**Calculation**: 768 ≤ width ≤ 1024 AND 768 ≤ height ≤ 1024 ✓

---

### Test Case 6: Desktop (Non-CTV)

```xml
<MediaFile type="video/mp4" width="1366" height="768">
  https://cdn.example.com/ad-desktop.mp4
</MediaFile>
```

**Expected**: 🟢 Desktop badge
**Calculation**: Width ≥ 1024 AND NOT exact CTV dimensions ✓

---

## Industry Standards

### VAST Best Practices

According to IAB guidelines, ad servers should provide multiple media files for different device categories:

```xml
<Linear>
  <MediaFiles>
    <!-- Mobile Portrait -->
    <MediaFile type="video/mp4" width="360" height="640" bitrate="500">
      https://cdn.example.com/ad-mobile-portrait.mp4
    </MediaFile>

    <!-- Mobile Landscape -->
    <MediaFile type="video/mp4" width="854" height="480" bitrate="800">
      https://cdn.example.com/ad-mobile-landscape.mp4
    </MediaFile>

    <!-- Tablet -->
    <MediaFile type="video/mp4" width="1024" height="768" bitrate="1200">
      https://cdn.example.com/ad-tablet.mp4
    </MediaFile>

    <!-- CTV 720p -->
    <MediaFile type="video/mp4" width="1280" height="720" bitrate="2500">
      https://cdn.example.com/ad-ctv-720p.mp4
    </MediaFile>

    <!-- CTV 1080p -->
    <MediaFile type="video/mp4" width="1920" height="1080" bitrate="5000">
      https://cdn.example.com/ad-ctv-1080p.mp4
    </MediaFile>

    <!-- Desktop -->
    <MediaFile type="video/mp4" width="1920" height="1080" bitrate="3500">
      https://cdn.example.com/ad-desktop.mp4
    </MediaFile>
  </MediaFiles>
</Linear>
```

### Bitrate Recommendations

| Device Type | Resolution | Recommended Bitrate |
|-------------|------------|---------------------|
| Mobile | 640×360 | 500-800 kbps |
| Mobile HD | 854×480 | 800-1200 kbps |
| Tablet | 1024×768 | 1200-2000 kbps |
| Desktop/CTV 720p | 1280×720 | 2000-3000 kbps |
| Desktop/CTV 1080p | 1920×1080 | 3500-6000 kbps |
| CTV 4K | 3840×2160 | 15000-25000 kbps |

---

## Visual Indicators

### Badge Styles

The inspector uses color-coded badges with icons:

- 🔵 **Mobile / Mobile Portrait**: Blue (`#93c5fd`)
- 🟠 **Tablet**: Orange (`#fdba74`)
- 🟢 **Desktop**: Green (`#6ee7b7`)
- 🟣 **CTV/OTT**: Purple (`#c4b5fd`)
- ⚪ **Other**: Gray

### Example Display

```
Media File #1
┌──────────────────────────────────────┐
│ #1  📱 Mobile Portrait               │
│ Type: video/mp4                      │
│ Size: 360×640 (0.56:1)               │
│ Bitrate: 500kbps                     │
└──────────────────────────────────────┘

Media File #2
┌──────────────────────────────────────┐
│ #2  📺 CTV/OTT                       │
│ Type: video/mp4                      │
│ Size: 1920×1080 (1.78:1)             │
│ Bitrate: 5000kbps                    │
└──────────────────────────────────────┘
```

---

## QA Checklist

When testing VAST tags with the inspector:

- [ ] Verify mobile portrait creatives (9:16 aspect ratio)
- [ ] Verify mobile landscape creatives (16:9, small dimensions)
- [ ] Verify tablet creatives (4:3 or similar)
- [ ] Verify CTV/OTT creatives (exact 720p, 1080p, 4K)
- [ ] Verify desktop creatives (large dimensions)
- [ ] Check that CTV dimensions show purple "CTV/OTT" badge (not green "Desktop")
- [ ] Verify bitrates are appropriate for each device type
- [ ] Check that aspect ratios make sense for target devices

---

## Code Reference

**File**: `src/ui.js`
**Method**: `detectDeviceType(width, height, aspectRatio)`
**Lines**: 228-267

**File**: `styles/main.css`
**Section**: Device Badge Styles
**Lines**: 833-870

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Full codebase guide
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Latest improvements
- [VAST-MACROS.md](./VAST-MACROS.md) - Macro replacement guide

---

**Last Updated**: November 21, 2025
**Bug Fixed**: CTV dimension detection now works correctly
