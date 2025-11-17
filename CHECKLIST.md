# Pre-Deployment Checklist

Use this checklist before deploying to production.

## Development & Code Quality

- [ ] All tests pass: `npm run test -- --run`
- [ ] Linting passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in development
- [ ] Responsive design tested on mobile
- [ ] All pages load without errors
- [ ] No TypeScript errors: `npx tsc --noEmit`

## Firebase Configuration

- [ ] Firebase project created
- [ ] Authentication enabled:
  - [ ] Email/Password provider
  - [ ] Google provider
  - [ ] OAuth consent screen configured
- [ ] Firestore database created
- [ ] Firestore security rules reviewed
- [ ] Firestore rules deployed: `firebase deploy --only firestore`
- [ ] Firestore indexes created (Firebase suggests them)
- [ ] Web app credentials copied to `.env.local`
- [ ] Tested locally with `.env.local`

## GitHub Repository

- [ ] Repository created on GitHub
- [ ] Code pushed to `main` branch
- [ ] README.md is complete and accurate
- [ ] `.env.example` created with all required variables
- [ ] `.gitignore` configured correctly
- [ ] License file included (LICENSE.md)
- [ ] Branch protection set up (require PR reviews)

## Vercel Configuration

- [ ] Vercel account created
- [ ] Project created in Vercel (linked to GitHub)
- [ ] Environment variables added:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] Build settings correct:
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] `vercel.json` configured
- [ ] Initial deployment successful
- [ ] Production deployment tested

## GitHub Actions CI

- [ ] `.github/workflows/ci.yml` included
- [ ] CI runs on push to `main`
- [ ] Linting job passes
- [ ] Testing job passes
- [ ] Build job succeeds
- [ ] No secret variables leaked in logs

## Testing

- [ ] Manual testing of all features:
  - [ ] Email sign-up works
  - [ ] Email sign-in works
  - [ ] Google sign-in works
  - [ ] Sign-out works
  - [ ] Create group works
  - [ ] Invite members by email works
  - [ ] Accept invite works
  - [ ] Add expense works
  - [ ] Split logic correct
  - [ ] Balance calculation correct
  - [ ] Record settlement works
  - [ ] Activity feed shows events
- [ ] Test with multiple users
- [ ] Test on mobile devices
- [ ] Test on different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

## Security

- [ ] Firestore rules prevent unauthorized reads/writes
- [ ] User data isolated by UID
- [ ] No API keys in client code
- [ ] No secrets in GitHub (use GitHub secrets for CI)
- [ ] Environment variables not logged
- [ ] CORS configured if needed
- [ ] Rate limiting implemented (optional)
- [ ] Error messages don't expose sensitive info

## Performance

- [ ] Build size acceptable (<500KB target)
- [ ] Images optimized (if any)
- [ ] Lazy loading configured for routes (optional)
- [ ] Database indexes created
- [ ] No N+1 queries
- [ ] Load time under 3 seconds
- [ ] Lighthouse score >80 (optional)

## Monitoring & Logging

- [ ] Firebase Analytics enabled (optional)
- [ ] Error tracking set up (Sentry, etc.) (optional)
- [ ] Vercel deployment logs checked
- [ ] Firebase logs reviewed for errors
- [ ] Performance metrics available
- [ ] User feedback mechanism available (optional)

## Documentation

- [ ] README.md complete:
  - [ ] Quick start instructions
  - [ ] Feature list
  - [ ] Architecture explained
  - [ ] Deployment instructions
  - [ ] Troubleshooting guide
- [ ] DEPLOYMENT.md complete
- [ ] CONTRIBUTING.md complete
- [ ] API documentation (if applicable)
- [ ] Setup guide for new developers
- [ ] Known issues documented

## Final Steps

- [ ] Domain configured (optional):
  - [ ] Custom domain purchased
  - [ ] Domain pointed to Vercel
  - [ ] SSL certificate installed
- [ ] Status page created (optional)
- [ ] Support/feedback channel set up (GitHub issues, email, etc.)
- [ ] Beta testers invited
- [ ] Public announcement ready
- [ ] Social media accounts linked (optional)

## Post-Launch

- [ ] Monitor errors for first 24 hours
- [ ] Check Firebase quotas
- [ ] Review user feedback
- [ ] Prepare hotfixes if needed
- [ ] Plan future features
- [ ] Schedule retrospective

---

## Deployment Steps Summary

```bash
# 1. Verify everything works locally
npm install
npm run lint
npm run test -- --run
npm run build
npm run preview

# 2. Deploy Firestore rules
firebase login
firebase deploy --only firestore

# 3. Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 4. Monitor Vercel deploy
# Open https://vercel.com/dashboard and watch deployment

# 5. Test production
# Visit your Vercel URL and test all features

# 6. Enable GitHub Actions secrets (if auto-deploy)
# Add VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

# Done! 🎉
```

---

**Need help?** Check:
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [DEPLOYMENT.md](./DEPLOYMENT.md) in this repo
