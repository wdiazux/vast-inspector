# CLAUDE.md - AI Assistant Guide for vast-inspector

This document provides comprehensive guidance for AI assistants working with the vast-inspector codebase. It covers repository structure, development workflows, code conventions, and best practices.

## Table of Contents

- [Repository Overview](#repository-overview)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Code Conventions](#code-conventions)
- [Development Workflows](#development-workflows)
- [Testing Guidelines](#testing-guidelines)
- [Key Files and Their Purposes](#key-files-and-their-purposes)
- [Common Tasks](#common-tasks)
- [AI Assistant Guidelines](#ai-assistant-guidelines)

## Repository Overview

**Repository**: vast-inspector
**Purpose**: A comprehensive VAST (Video Ad Serving Template) Inspector for QA testing video advertisements. This tool helps QA engineers and developers inspect VAST XML responses, track ad events, monitor tracking URLs, and validate video ad implementations.

### Key Features

- Parse and validate VAST 2.0, 3.0, and 4.0+ XML responses
- Real-time tracking of impression URLs, click URLs, and event trackers
- Monitor tracking pixels and their firing status
- Video ad preview with full event monitoring
- Support for wrapped VAST tags
- Comprehensive event logging with timestamps

### Technology Stack

- **Language**: JavaScript (ES6+)
- **Runtime**: Browser (HTML5)
- **Architecture**: Vanilla JavaScript with modular class-based design
- **Video**: HTML5 Video API
- **XML Parsing**: DOMParser API
- **Development Server**: http-server (Node.js)
- **No Build Process**: Direct HTML/CSS/JS for simplicity

## Project Structure

```
vast-inspector/
├── index.html              # Main application UI
├── src/                    # Source code (JavaScript modules)
│   ├── vast-parser.js     # VAST XML parser (supports v2.0, 3.0, 4.0+)
│   ├── tracker.js         # Tracking URL and pixel manager
│   ├── video-player.js    # Video player controller & event handler
│   └── ui.js              # UI controller and DOM management
├── styles/                 # Stylesheets
│   └── main.css           # Main application styles
├── package.json           # Project metadata and scripts
├── README.md              # User documentation
├── CLAUDE.md              # AI assistant guide (this file)
└── .gitignore             # Git ignore rules
```

## Development Setup

### Prerequisites

```bash
# Required:
- Node.js >= 14.0.0 (only for dev server)
- npm (for installing http-server)

# Optional:
- Any modern web browser (Chrome, Firefox, Safari, Edge)
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vast-inspector

# Install dependencies
npm install
# or
yarn install
```

### Running the Project

```bash
# Start development server (opens browser automatically)
npm start
# or
npm run dev

# The inspector will be available at:
# http://localhost:8080
```

**No build step required!** The application runs directly in the browser using vanilla JavaScript modules.

## Code Conventions

### General Principles

1. **Clarity over Cleverness**: Write code that is easy to understand
2. **Consistency**: Follow existing patterns in the codebase
3. **Documentation**: Comment complex logic and document public APIs
4. **Error Handling**: Always handle errors explicitly
5. **Type Safety**: Use TypeScript types/interfaces, avoid `any` where possible

### Naming Conventions

- **Files**: Use kebab-case for file names (e.g., `vast-parser.js`, `video-player.js`)
- **Classes**: Use PascalCase (e.g., `VASTParser`, `VideoPlayer`, `Tracker`)
- **Functions**: Use camelCase (e.g., `parseVAST`, `fireTracker`, `loadAd`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **CSS Classes**: Use kebab-case with BEM-like structure (e.g., `tracking-section`, `pixel-item`)

### Code Style

```javascript
// Use ES6+ features
// Preferred: async/await over promises
async function parseVAST(url) {
  const response = await fetch(url);
  return response.text();
}

// Preferred: Arrow functions for callbacks
trackingURLs.forEach(url => {
  this.fireTracker(url);
});

// Preferred: Destructuring
const { impressions, clicks, tracking } = this.trackingURLs;

// Preferred: Template literals
console.log(`[Tracker] Fired ${type}: ${url}`);

// Document all public methods with JSDoc
/**
 * Parse VAST XML from URL or string
 * @param {string} vastInput - VAST URL or XML string
 * @param {boolean} isXML - true if input is XML string
 * @returns {Promise<Object>} Parsed VAST data
 */
async parse(vastInput, isXML = false) {
  // Implementation
}
```

### Module Organization

**Note**: This project uses vanilla JavaScript without module bundlers. Scripts are loaded via `<script>` tags in HTML.

```html
<!-- Load modules in correct order (dependencies first) -->
<script src="src/vast-parser.js"></script>
<script src="src/tracker.js"></script>
<script src="src/video-player.js"></script>
<script src="src/ui.js"></script>
```

**Class exports**: Each module should export classes for browser compatibility:
```javascript
// At the end of each module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClassName;
}
```

## Development Workflows

### Git Workflow

1. **Branch Naming**: Use descriptive branch names
   - Feature: `feature/description`
   - Bug fix: `fix/description`
   - Hotfix: `hotfix/description`
   - Refactor: `refactor/description`

2. **Commit Messages**: Follow conventional commits
   ```
   feat: add user authentication
   fix: resolve login redirect issue
   refactor: simplify data fetching logic
   docs: update API documentation
   test: add unit tests for user service
   chore: update dependencies
   ```

3. **Pull Requests**
   - Provide clear description of changes
   - Link related issues
   - Ensure all tests pass
   - Request review from appropriate team members

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log or debugging code
- [ ] Error handling is appropriate
- [ ] Performance implications considered
- [ ] Security implications considered

## Testing Guidelines

### Test Organization

```
tests/
├── unit/           # Fast, isolated tests
├── integration/    # Tests for module interactions
└── e2e/           # Full application flow tests
```

### Writing Tests

```typescript
// Example test structure
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = '123';

      // Act
      const user = await getUserById(userId);

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const invalidId = 'invalid';

      // Act & Assert
      await expect(getUserById(invalidId)).rejects.toThrow('User not found');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test path/to/test.spec.ts
```

## Key Files and Their Purposes

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `.eslintrc.js` | ESLint linting rules |
| `.prettierrc` | Code formatting rules |
| `.env.example` | Example environment variables |
| `.gitignore` | Files to exclude from git |

### Important Source Files

| File | Purpose |
|------|---------|
| `index.html` | Main UI and application entry point |
| `src/vast-parser.js` | Parses VAST XML, extracts ad info, impressions, clicks, tracking events |
| `src/tracker.js` | Manages tracking URL firing, pixel monitoring, logging |
| `src/video-player.js` | Controls video playback, monitors events, fires quartile tracking |
| `src/ui.js` | UI controller, coordinates all components, handles user input |
| `styles/main.css` | All application styles (dark theme, responsive design) |

## Common Tasks

### Adding a New Feature

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Implement the feature following code conventions
3. Add tests for the new functionality
4. Update documentation as needed
5. Commit changes with conventional commit message
6. Push and create pull request

### Debugging

```bash
# Enable debug mode (if applicable)
DEBUG=* npm run dev

# Run with Node debugger
node --inspect-brk dist/index.js
```

### Performance Profiling

[To be documented when profiling tools are established]

## AI Assistant Guidelines

### Best Practices for AI Assistants

1. **Read Before Writing**: Always read existing files before making modifications
2. **Follow Existing Patterns**: Maintain consistency with existing code style
3. **Test Changes**: Run tests after making changes to ensure nothing breaks
4. **Incremental Changes**: Make small, focused changes rather than large refactors
5. **Documentation**: Update relevant documentation when changing functionality

### Common Pitfalls to Avoid

- Don't use `any` type without justification
- Don't ignore TypeScript errors
- Don't skip writing tests for new functionality
- Don't modify package.json dependencies without understanding implications
- Don't commit sensitive information (API keys, passwords, etc.)

### When to Ask for Clarification

- Architectural decisions that affect multiple modules
- Breaking changes to public APIs
- Security-sensitive implementations
- Performance-critical code paths
- Ambiguous requirements

### Code Quality Checks

Before completing a task, verify:

1. [ ] Code compiles without errors
2. [ ] All tests pass
3. [ ] No linting errors
4. [ ] No security vulnerabilities introduced
5. [ ] Documentation is updated
6. [ ] No console.log or debugging statements
7. [ ] Error handling is appropriate
8. [ ] Types are properly defined

### Helpful Commands for AI Assistants

```bash
# Start development server
npm start

# Test the application
# Open http://localhost:8080 in browser
# Use browser DevTools Console to check for errors
# Use Network tab to monitor tracking requests

# Check JavaScript syntax
node --check src/*.js

# View file structure
ls -R

# Search for specific code
grep -r "pattern" src/
```

## Project-Specific Notes

### Architecture Decisions

1. **Vanilla JavaScript Over Frameworks**: Chose vanilla JS for simplicity, portability, and zero build process. Makes it easy to deploy anywhere.

2. **Class-Based Modules**: Uses ES6 classes for clear separation of concerns:
   - `VASTParser`: Pure parsing logic
   - `Tracker`: State management for tracking
   - `VideoPlayer`: Video control and event handling
   - `UIController`: DOM manipulation and user interaction

3. **Event-Driven Communication**: Uses browser's native event system (`CustomEvent`) for communication between modules.

4. **Tracking via Image Objects**: Uses `new Image()` for firing tracking pixels (most reliable cross-browser method).

### VAST Specification Notes

**Supported VAST Versions**:
- VAST 2.0: Basic linear ads
- VAST 3.0: Wrappers, companions
- VAST 4.0+: Enhanced tracking

**Key VAST Elements Parsed**:
- `<Impression>`: Fired when ad loads
- `<ClickThrough>`: Landing page URL
- `<ClickTracking>`: Click tracking URLs
- `<Tracking event="">`: Quartile events (start, firstQuartile, midpoint, thirdQuartile, complete)
- `<Error>`: Error reporting URLs
- `<MediaFile>`: Video file sources
- `<VASTAdTagURI>`: Wrapped VAST tags (parsed but not automatically followed)

### Performance Considerations

- **DOM Updates**: Batched where possible to minimize reflows
- **Event Log**: Limited to 100 entries to prevent memory issues
- **Tracking Requests**: Fired asynchronously with 5s timeout
- **Video Formats**: Prefers MP4 (best browser support), falls back to WebM/OGG

### Security Considerations

1. **CORS**: VAST URLs must support CORS or be served from same origin
2. **Mixed Content**: HTTPS pages can only load HTTPS VAST/media
3. **XSS Prevention**: All URLs displayed are not executed, only shown as text/links
4. **Tracking Privacy**: All tracking requests visible in UI and browser DevTools

### Known Issues and Limitations

1. **VAST Wrappers**: Currently displays wrapped tags but doesn't automatically follow them (manual copy/paste needed)
2. **VPAID**: Limited support - only detects VPAID media files but doesn't execute them
3. **Companion Ads**: Parsed but not displayed (future enhancement)
4. **CORS Restrictions**: Cannot test VAST URLs that don't allow cross-origin requests
5. **Autoplay Restrictions**: Browser autoplay policies may prevent automatic video playback

### Common VAST Testing Scenarios

#### Test Case 1: Basic Linear Ad
```javascript
// Expected tracking sequence:
1. Impression URLs fire immediately
2. "start" event when video begins
3. "firstQuartile" at 25% progress
4. "midpoint" at 50% progress
5. "thirdQuartile" at 75% progress
6. "complete" when video ends
```

#### Test Case 2: Click Tracking
```javascript
// When user clicks video:
1. ClickTracking URLs fire
2. ClickThrough URL opens in new tab
3. "click" event logged
```

#### Test Case 3: Error Handling
```javascript
// When video fails to load:
1. Error URLs fire (if present)
2. Error event logged with details
```

---

**Last Updated**: 2025-11-21
**Maintainers**: [To be documented]

## Contributing to This Document

This document should be kept up-to-date as the project evolves. When making significant changes to:

- Project structure
- Development workflows
- Coding conventions
- Build/test processes

Please update this CLAUDE.md file accordingly. AI assistants should also update this file when they notice discrepancies between the documentation and actual codebase structure.
