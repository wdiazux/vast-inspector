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
**Purpose**: [To be documented as the project develops]

### Technology Stack

[To be updated as technologies are added to the project]

- Language: [e.g., TypeScript, Python, Go]
- Runtime: [e.g., Node.js, Python 3.x]
- Framework: [e.g., React, Express, FastAPI]
- Build Tools: [e.g., Webpack, Vite, esbuild]
- Testing: [e.g., Jest, pytest, Vitest]
- Linting: [e.g., ESLint, Pylint, golangci-lint]

## Project Structure

```
vast-inspector/
├── src/                    # Source code
│   ├── components/        # Reusable components
│   ├── services/          # Business logic and services
│   ├── utils/             # Utility functions
│   ├── types/             # Type definitions
│   └── config/            # Configuration files
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
├── .github/              # GitHub workflows and configurations
└── dist/                 # Build output (git-ignored)
```

**Note**: This structure will be updated as the project evolves.

## Development Setup

### Prerequisites

[To be documented when dependencies are established]

```bash
# Example prerequisites:
# - Node.js >= 18.x
# - npm >= 9.x or yarn >= 1.22.x
# - Python >= 3.9 (if applicable)
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

### Environment Configuration

[Document environment variables and configuration files]

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your local configuration
```

### Running the Project

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Code Conventions

### General Principles

1. **Clarity over Cleverness**: Write code that is easy to understand
2. **Consistency**: Follow existing patterns in the codebase
3. **Documentation**: Comment complex logic and document public APIs
4. **Error Handling**: Always handle errors explicitly
5. **Type Safety**: Use TypeScript types/interfaces, avoid `any` where possible

### Naming Conventions

- **Files**: Use kebab-case for file names (e.g., `user-service.ts`)
- **Classes**: Use PascalCase (e.g., `UserService`)
- **Functions**: Use camelCase (e.g., `getUserById`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Interfaces/Types**: Use PascalCase with descriptive names (e.g., `UserProfile`)

### Code Style

[To be defined based on linting configuration]

```typescript
// Example: Preferred function style
export function getUserById(id: string): Promise<User> {
  // Implementation
}

// Example: Preferred interface style
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
```

### Import Organization

```typescript
// 1. External dependencies
import React from 'react';
import { useState } from 'react';

// 2. Internal modules (absolute imports)
import { UserService } from '@/services/user-service';
import { logger } from '@/utils/logger';

// 3. Relative imports
import { UserCard } from './UserCard';
import type { UserProps } from './types';
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

[To be updated as key files are created]

| File | Purpose |
|------|---------|
| `src/index.ts` | Application entry point |
| `src/config/` | Configuration management |
| `src/types/` | Shared type definitions |

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
# Check for type errors
npm run type-check

# Run linter
npm run lint

# Fix auto-fixable lint issues
npm run lint:fix

# Format code
npm run format

# Run all quality checks
npm run check-all
```

## Project-Specific Notes

### Architecture Decisions

[Document important architectural decisions as they are made]

### Performance Considerations

[Document performance-critical areas and optimization strategies]

### Security Considerations

[Document security requirements and sensitive areas]

### Known Issues and Limitations

[Document current limitations or technical debt]

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
