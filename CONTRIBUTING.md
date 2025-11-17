# Contributing Guide

Thank you for your interest in contributing to Splitwise! This document outlines the development workflow.

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Firebase CLI (for testing rules)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/splitwise.git
cd splitwise

# Install dependencies
npm install

# Create .env.local with Firebase config
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation
- `test/` for test additions

### 2. Make Changes

Follow these conventions:

**Code Style:**
- Use ESLint: `npm run lint` / `npm run lint:fix`
- Format with Prettier: `npm run format`
- TypeScript strict mode (no `any` unless necessary)

**Commits:**
```bash
git add .
git commit -m "feat: add expense categories"
```

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `test:` test additions
- `refactor:` code improvements
- `chore:` dependencies, config

### 3. Test Your Changes

```bash
# Run tests
npm run test -- --run

# Run linting
npm run lint

# Check formatting
npm run format -- --check

# Build production
npm run build
```

All checks must pass before creating a pull request.

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Go to GitHub and create a pull request:
- Title: Clear, concise description
- Description: What changed and why
- Link related issues

Example:
```
feat: Add expense categories

Allows users to categorize expenses (food, transport, lodging, etc.)

- Add category field to expense schema
- Update Firestore rules for category
- Add category filter to expense list
- Update activity feed messages

Fixes #42
```

## Testing

### Unit Tests

Located in `src/__tests__/`:

```bash
# Run tests
npm run test

# Run single test file
npm run test -- balance.test.ts

# Watch mode for development
npm run test

# Coverage report
npm run test:coverage
```

Add tests for:
- New utility functions
- Balance calculation logic
- Component interactions

Example test:

```typescript
import { describe, it, expect } from 'vitest'

describe('myFeature', () => {
  it('should do something', () => {
    const result = myFunction()
    expect(result).toBe(expected)
  })
})
```

### Firebase Emulator

For testing Firestore rules:

```bash
# Start emulator
firebase emulators:start --only firestore

# In another terminal, run tests
npm run test-rules
```

## Code Standards

### TypeScript

- Strict mode enabled
- No `any` types (use explicit types or `unknown`)
- If using `any`, add `// @ts-ignore` comment with reason

```typescript
// Good
function getUser(id: string): User | null {
  // ...
}

// Avoid
function getUser(id: any): any {
  // ...
}
```

### React Components

- Functional components only
- Use hooks (useState, useEffect, etc.)
- Props should be typed
- Keep components focused and small

```typescript
interface MyComponentProps {
  title: string
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export default function MyComponent({
  title,
  onSubmit,
  isLoading = false,
}: MyComponentProps) {
  // ...
}
```

### Firebase

- Use modular Firebase v9+ imports
- Type function parameters and returns
- Handle errors gracefully
- Don't expose secrets in client code

```typescript
import { collection, addDoc, type DocumentData } from 'firebase/firestore'

export async function createItem(name: string): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'items'), {
      name,
      createdAt: Date.now(),
    })
    return ref.id
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to create item: ${message}`)
  }
}
```

## File Structure

When adding new features, follow this structure:

```
src/
  __tests__/
    feature.test.ts         # Tests for your feature
  firebase/
    config.ts               # Add Firebase helpers here
  pages/
    MyNewPage.tsx           # New page component
  App.tsx                   # Update routes if needed
```

## Documentation

Update documentation when:
- Adding new features: Update README.md
- Changing APIs: Update function JSDoc comments
- Adding Firebase collections: Update firestore.rules and README
- Deployment changes: Update DEPLOYMENT.md

Example JSDoc:

```typescript
/**
 * Calculate balance for a user across expenses
 * @param userId - The user's ID
 * @param expenses - Array of expenses
 * @returns Balance amount (positive = owed money, negative = owes money)
 */
export function calculateBalance(
  userId: string,
  expenses: Expense[]
): number {
  // ...
}
```

## Debugging

### Browser DevTools

```typescript
// Add temporary console logs
console.log('Debug:', { userId, expenses })

// Use debugger statement
if (error) debugger // Opens DevTools

// Check Network tab for Firebase calls
// Check Application tab for stored data
```

### Firebase Emulator UI

```bash
firebase emulators:start --only firestore
# Open http://localhost:4000 in browser
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverride": {
        "webpack:///*": "${webspaceRoot}/*"
      }
    }
  ]
}
```

## Common Issues

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Tests fail with "Cannot find module 'vitest'"

```bash
npm install
npm run test -- --run
```

### Firebase permission denied errors

- Check Firestore security rules
- Verify user is authenticated
- Check user ID matches rule conditions
- Run emulator locally to test rules

### Environment variables not loading

- Use `VITE_` prefix for browser-accessible variables
- Create `.env.local` (not `.env`)
- Restart dev server after adding variables
- Check Vercel environment variables for production

## Pull Request Checklist

Before submitting PR:

- [ ] Code follows style guide (ESLint + Prettier pass)
- [ ] All tests pass: `npm run test -- --run`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors or warnings
- [ ] Updated README if feature is user-facing
- [ ] Updated Firestore rules if data model changed
- [ ] Added tests for new logic
- [ ] Commits follow conventional commits
- [ ] Branch is up-to-date with main: `git rebase origin/main`

## Review Process

- 2+ approvals from maintainers
- All CI checks pass
- No unresolved conversations

## Release Process

When ready to deploy:

1. Create release branch: `release/v1.0.0`
2. Update version in `package.json`
3. Update CHANGELOG.md
4. Create pull request to `main`
5. After merge, tag release: `git tag v1.0.0`
6. Push tags: `git push --tags`
7. Vercel auto-deploys on main push

## Questions?

- Open an issue on GitHub
- Check existing issues and discussions
- Read Firebase and React documentation

---

Thank you for contributing!
