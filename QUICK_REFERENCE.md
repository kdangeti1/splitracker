# Quick Reference

Quick commands and shortcuts for development and deployment.

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests once
npm run test -- --run

# Run tests with UI
npm run test:ui

# Generate test coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Test Firestore rules (requires emulator)
npm run test-rules
```

## Firebase CLI Commands

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Start emulator (for local testing)
firebase emulators:start --only firestore

# Deploy Firestore rules
firebase deploy --only firestore

# Deploy everything
firebase deploy
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Stage changes
git add .

# Commit with message
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/my-feature

# Create pull request on GitHub
# Wait for review and approval

# Merge to main (via GitHub UI)
# Delete branch
git branch -d feature/my-feature
```

## Deployment

### Local → GitHub

```bash
git add .
git commit -m "chore: final changes before deployment"
git push origin main
```

### GitHub → Vercel (Automatic)

1. GitHub Actions runs tests and builds
2. If all pass, Vercel automatically deploys
3. Your app is live!

Check deployment:
- Vercel dashboard: https://vercel.com/dashboard
- Your app URL: https://your-project.vercel.app

## Troubleshooting

### Clear Build Cache

```bash
rm -r dist
rm -r node_modules
npm install
npm run build
```

### Reset to Latest

```bash
git fetch origin
git reset --hard origin/main
npm install
```

### Check Logs

**Local:**
```bash
npm run dev
# Check terminal output
```

**Production:**
1. Go to Vercel dashboard
2. Click project
3. Go to Deployments
4. Click deployment
5. View build logs

**Firebase:**
1. Go to Firebase Console
2. Go to Firestore Database
3. Check Rules tab for errors
4. Check Authentication tab for issues

## Environment Variables

**Local:** Create `.env.local`
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# etc.
```

**Production:** Set in Vercel project settings
- Environment: Production, Preview, Development
- Re-deploy after adding variables

## File Locations

| Purpose | File |
|---------|------|
| Main config | `package.json` |
| Firebase helpers | `src/firebase/config.ts` |
| Pages | `src/pages/` |
| Tests | `src/__tests__/` |
| Routes | `src/App.tsx` |
| Firestore rules | `firestore.rules` |
| TypeScript config | `tsconfig.json` |
| Vite config | `vite.config.ts` |
| Vitest config | `vitest.config.ts` |
| ESLint config | `.eslintrc.cjs` |
| Prettier config | `.prettierrc` |
| Vercel config | `vercel.json` |

## Important URLs

| Service | URL |
|---------|-----|
| GitHub | https://github.com |
| Firebase | https://console.firebase.google.com |
| Vercel | https://vercel.com |
| Vite Docs | https://vitejs.dev |
| React Docs | https://react.dev |
| Firebase Docs | https://firebase.google.com/docs |

## Common Errors

| Error | Solution |
|-------|----------|
| "Cannot find module 'vitest'" | `npm install` |
| "Firebase config not found" | Create `.env.local` with Firebase vars |
| "CORS error" | Check Firestore rules allow your domain |
| "Permission denied" | Check Firestore rules for user auth |
| "Build failed" | Check Vercel logs, ensure env vars set |
| "Tests fail" | Run `npm test -- --run`, check output |

## Code Templates

### New Component

```typescript
interface MyComponentProps {
  title: string
  onSubmit?: (data: any) => void
}

export default function MyComponent({
  title,
  onSubmit,
}: MyComponentProps) {
  const [state, setState] = React.useState('')

  return (
    <div>
      <h1>{title}</h1>
      {/* content */}
    </div>
  )
}
```

### Firebase Helper

```typescript
export async function myHelper(param: string): Promise<string> {
  try {
    const ref = collection(db, 'myCollection')
    const result = await getDocs(ref)
    return 'success'
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed: ${message}`)
  }
}
```

### Test

```typescript
import { describe, it, expect } from 'vitest'

describe('myFeature', () => {
  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

## Performance Tips

- Use React DevTools browser extension
- Check Firebase quotas regularly
- Monitor Vercel analytics
- Profile with Chrome DevTools
- Check build size: `npm run build` shows size

## Security Checklist

- [ ] No secrets in code
- [ ] Environment variables for sensitive data
- [ ] Firestore rules protect data
- [ ] Auth guards on pages
- [ ] No unnecessary console.logs
- [ ] Validate user input
- [ ] HTTPS on custom domain

---

**Lost?** Check the full docs:
- [README.md](./README.md) - Overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guide
- [CHECKLIST.md](./CHECKLIST.md) - Pre-launch checklist
