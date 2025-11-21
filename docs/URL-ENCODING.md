# URL Encoding Handling

## Overview

The VAST Inspector properly handles HTML URL-encoded URLs throughout the application.

## How It Works

### 1. **URL Extraction from VAST XML**

URLs are extracted using `textContent.trim()` which preserves encoding:

```javascript
const url = element.textContent.trim();
// Example: "https://track.example.com/imp?campaign=test%20campaign&id=123"
```

### 2. **URL Validation**

All URLs are validated before display or firing:

```javascript
validateURL(url) {
  try {
    new URL(url);  // JavaScript URL parser handles encoding
    return true;
  } catch (e) {
    return false;
  }
}
```

### 3. **Display (Decoded for Readability)**

URLs are decoded for display using `decodeURIComponent()`:

```javascript
// Original:  https://track.com/pixel?name=Test%20Campaign&id=123%3A456
// Displayed: https://track.com/pixel?name=Test Campaign&id=123:456
```

**Hover to see full URL:** The `title` attribute shows the original encoded URL.

### 4. **Firing Tracking Pixels**

URLs are fired as-is (encoded) - the browser handles them correctly:

```javascript
const img = new Image();
img.src = url;  // Browser automatically handles URL encoding
```

### 5. **Click-Through URLs**

```javascript
window.open(url, '_blank');  // Browser handles encoded URLs
```

## URL Encoding Examples

### Common Encoded Characters

| Character | Encoded | Example |
|-----------|---------|---------|
| Space | `%20` | `Test%20Campaign` |
| Colon `:` | `%3A` | `https%3A//example.com` |
| Question `?` | `%3F` | `param%3Fvalue` |
| Ampersand `&` | `%26` | `param1%26param2` |
| Equals `=` | `%3D` | `key%3Dvalue` |
| Percent `%` | `%25` | `discount%2550` |
| Plus `+` | `%2B` | `a%2Bb` |
| Hash `#` | `%23` | `section%23intro` |
| Slash `/` | `%2F` | `path%2Fto%2Ffile` |

### Example VAST URLs with Encoding

**Impression Pixel:**
```
https://tracking.example.com/imp?
  campaign=Summer%20Sale%202024&
  creative=Video%3A%20Mobile&
  timestamp=2024-01-15T10%3A30%3A00Z&
  param=value%26another%3Dtest
```

**Click Tracking:**
```
https://click.example.com/track?
  url=https%3A%2F%2Fexample.com%2Flanding&
  referrer=https%3A%2F%2Fsource.com%2Fpage&
  user_id=user%2B123
```

## Edge Cases Handled

### 1. **Already Encoded URLs**

The code detects if a URL is already encoded and doesn't double-encode:

```javascript
encodeURLSafely(url) {
  const decoded = decodeURIComponent(url);
  if (decoded !== url) {
    return url;  // Already encoded, return as-is
  }
  return encodeURIComponent(url);
}
```

### 2. **Invalid Encoding**

If `decodeURIComponent()` fails (malformed encoding), the original URL is used:

```javascript
try {
  url = decodeURIComponent(url);
} catch (e) {
  console.warn('Failed to decode URL:', url);
  // Use original URL
}
```

### 3. **VAST Macros with Encoding**

VAST macros are preserved and not decoded:

```
https://track.com/pixel?
  device_id=[DEVICE_ID]&
  name=Test%20Campaign
```

The macro `[DEVICE_ID]` stays as-is, while `%20` is decoded for display.

## Testing URL Encoding

### Test Case 1: Basic Encoded URL

**Input:**
```
https://track.example.com/pixel?name=Test%20Campaign&id=123
```

**Display:**
```
https://track.example.com/pixel?name=Test Campaign&id=123
```

**Fired:** Original encoded URL

### Test Case 2: Double-Encoded URL

**Input:**
```
https://track.com/pixel?url=https%253A%252F%252Fexample.com
```

**Display:**
```
https://track.com/pixel?url=https%3A%2F%2Fexample.com
```

**Fired:** Original URL (decoded once)

### Test Case 3: Special Characters

**Input:**
```
https://track.com/pixel?data=a%2Bb%26c%3Dd%23e
```

**Display:**
```
https://track.com/pixel?data=a+b&c=d#e
```

**Fired:** Original encoded URL

## Browser Compatibility

URL encoding is handled by native JavaScript APIs:
- `decodeURIComponent()` - All browsers ✅
- `encodeURIComponent()` - All browsers ✅
- `URL()` constructor - All modern browsers ✅
- `Image.src` - All browsers ✅

## Debugging URL Encoding

### Browser DevTools

1. **Console:** Check for `Failed to decode URL` warnings
2. **Network Tab:** See actual fired URLs
3. **Inspect Element:** Hover over links to see `title` attribute

### Console Logging

```javascript
console.log('Original:', url);
console.log('Decoded:', decodeURIComponent(url));
console.log('Fired:', tracker.getLog());
```

## Best Practices

### For QA Testing:

1. **Check Display:** Hover over URLs to see encoded version
2. **Verify Firing:** Use Network tab to confirm encoded URLs fire correctly
3. **Test Special Chars:** Test URLs with spaces, colons, ampersands
4. **Check Macros:** Ensure VAST macros aren't decoded

### For Developers:

1. **VAST URLs should be pre-encoded** in the XML
2. **Don't double-encode** - the inspector handles it
3. **Validate URLs** before adding to VAST
4. **Test edge cases** with special characters

## Common Issues

### Issue 1: URL Not Firing

**Cause:** Malformed encoding (e.g., `%2G` instead of `%20`)

**Solution:** Validate URLs before adding to VAST:
```javascript
try {
  new URL(urlString);
} catch (e) {
  console.error('Invalid URL');
}
```

### Issue 2: Display Looks Wrong

**Cause:** URL wasn't properly encoded in VAST

**Solution:** Encode URLs before adding to VAST XML:
```javascript
const encoded = encodeURIComponent(value);
```

### Issue 3: Macros Getting Decoded

**Cause:** The inspector decodes for display only

**Solution:** This is intentional - the original URL with macros fires correctly

## References

- [MDN: encodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
- [MDN: decodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent)
- [URL Standard](https://url.spec.whatwg.org/)
- [VAST Specification](https://www.iab.com/guidelines/vast/)
