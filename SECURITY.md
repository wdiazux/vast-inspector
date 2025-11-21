# Security Guidelines

## Public Repository Security

This is a **PUBLIC** repository. Follow these guidelines to protect sensitive information.

### ❌ NEVER Commit

- **Real VAST URLs** with actual campaign IDs, creative IDs, or account numbers
- **API Keys** or authentication tokens
- **Account credentials** or passwords
- **Internal domain names** or server addresses
- **Customer/client data** of any kind
- **Proprietary campaign strategies** or targeting data
- **Real tracking pixels** with production account IDs
- **Business-sensitive information** like revenue, CPM, budgets

### ✅ Safe to Commit

- Generic code and documentation
- Example patterns using `[PLACEHOLDER]` or `example.com`
- Open-source dependencies
- Configuration templates (without actual values)
- Public IAB specifications references
- Generic testing workflows

### Best Practices

1. **Use Local Testing Files**
   - Create a `local-test-urls.txt` file (git-ignored)
   - Add it to `.gitignore`
   - Store all real test URLs there

2. **Review Before Commit**
   ```bash
   git diff
   # Check for any real URLs, IDs, or sensitive data
   ```

3. **Use Environment Variables**
   - For any configuration that might be sensitive
   - Keep `.env` files local (git-ignored)

4. **Sanitize Examples**
   - Replace real IDs with `[CREATIVE_ID]`, `[CAMPAIGN_ID]`, etc.
   - Use `example.com` for domain examples
   - Use placeholder account numbers

### What's Already Protected

✅ `.gitignore` includes:
- `node_modules/`
- `.env` and `.env.local`
- Local configuration files

✅ Example files use generic placeholders

✅ README uses `[your-username]` placeholders

✅ No hardcoded credentials in code

## GitHub Pages Security

Since this runs on GitHub Pages (client-side only):

- ✅ No server-side code = No server vulnerabilities
- ✅ No database = No SQL injection risks
- ✅ All operations run in user's browser
- ⚠️ All network requests (tracking pixels) are visible in browser DevTools
- ⚠️ VAST URLs are sent to the server they point to (normal behavior)

### User Privacy

- The tool does NOT collect any user data
- The tool does NOT send analytics to third parties
- All processing happens locally in the browser
- Tracking pixels fire as they would in production (this is the point of testing)

## CORS and Mixed Content

For VAST URL testing:

- **CORS**: VAST servers must allow cross-origin requests
- **HTTPS**: If hosting on GitHub Pages (HTTPS), can only test HTTPS VAST URLs
- **Workaround**: Use "VAST XML" mode to paste XML directly (bypasses CORS)

## Reporting Security Issues

If you find a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Contact the repository owner privately
3. Provide details about the vulnerability
4. Allow reasonable time for a fix before public disclosure
