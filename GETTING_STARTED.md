# Getting Started - Quick Commands

Copy and paste these commands to get started immediately.

## 1. Local Development Setup (2 minutes)

```bash
# Clone (or download) the repository
cd SplitWise

# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 2. First Time Firebase Setup (5 minutes)

```bash
# 1. Go to https://console.firebase.google.com
# 2. Create a new project
# 3. Enable Authentication (Email/Password + Google)
# 4. Create a Firestore database
# 5. Copy your config to .env.local

# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy rules
firebase login
firebase deploy --only firestore
```

## 3. Test Locally

```bash
# Run all tests (should pass 7/7)
npm run test -- --run

# Run linting (should have 0 errors)
npm run lint

# Build production version
npm run build

# Preview production build
npm run preview
```

## 4. Deploy to Vercel (3 minutes)

```bash
# 1. Go to https://github.com/new and create repository
# 2. Push your code:
git init
git add .
git commit -m "Initial commit: Splitwise app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/splitwise.git
git push -u origin main

# 3. Go to https://vercel.com/new
# 4. Import your GitHub repo
# 5. Add environment variables (copy from .env.local)
# 6. Click Deploy

# Your app is now live! 🎉
```

## 5. Enable Auto-Deployments (Optional)

```bash
# Get Vercel credentials
# 1. Visit https://vercel.com/account/tokens
# 2. Create token → copy value

# Add GitHub secrets
# 1. Go to GitHub: Settings > Secrets and variables > Actions
# 2. Add:
#    - VERCEL_TOKEN=<from step 1>
#    - VERCEL_ORG_ID=<from Vercel settings>
#    - VERCEL_PROJECT_ID=<from Vercel settings>

# Now every push to main automatically deploys! 🚀
```

## Common Workflows

### Add a New Feature

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and test
npm run lint:fix
npm run format
npm run test -- --run

# Push and create pull request
git add .
git commit -m "feat: describe your feature"
git push origin feature/my-feature

# Create PR on GitHub
# Wait for review
# Merge to main
# Vercel automatically deploys
```

### Fix a Bug

```bash
# Create fix branch
git checkout -b fix/my-bug

# Make changes and test
npm run lint:fix
npm run format
npm run test -- --run

# Push and create pull request
git add .
git commit -m "fix: describe the fix"
git push origin fix/my-bug

# Same PR process as above
```

### View Production Logs

```bash
# See what went wrong
# Visit Vercel dashboard: https://vercel.com/dashboard
# Click your project → Deployments
# Click the failed deployment
# Check "Build Logs" tab
```

### Troubleshoot Firebase

```bash
# Start local emulator
firebase emulators:start --only firestore

# In another terminal, run tests
npm run test-rules

# Check browser console for errors (F12)
# Check Firebase console for permission issues
```

## File Quick Reference

| What You Need | File |
|---------------|------|
| Environment variables | `.env.local` (copy from `.env.example`) |
| Firestore rules | `firestore.rules` |
| React components | `src/pages/` |
| Firebase helpers | `src/firebase/config.ts` |
| Tests | `src/__tests__/balance.test.ts` |
| Setup guide | `README.md` |
| Deploy guide | `DEPLOYMENT.md` |
| Dev guide | `CONTRIBUTING.md` |

## All Scripts at a Glance

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Check code style
npm run lint:fix         # Auto-fix code style
npm run format           # Format code
npm run test             # Run tests (watch)
npm run test -- --run    # Run tests once
npm run test:ui          # Test dashboard
npm run test:coverage    # Test coverage
npm run test-rules       # Test Firestore rules
```

## Useful URLs

- **Local Dev:** http://localhost:5173
- **Firebase Console:** https://console.firebase.google.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your Live App:** https://your-project.vercel.app
- **GitHub Repo:** https://github.com/your-username/splitwise

## What's Included

✅ Complete React + Firebase app  
✅ Authentication (email + Google)  
✅ Groups, expenses, settlements, activity feed  
✅ Security rules + testing  
✅ Deployment to Vercel  
✅ Full documentation  

## Need Help?

1. Check [README.md](./README.md) for overview
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
3. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development
4. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for commands

---

**Ready?** Start with: `npm install && npm run dev` 🚀
