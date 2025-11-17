# Deployment Guide

This guide covers deploying the Splitwise app to Vercel with Firebase backend.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Firebase project (free tier is fine)
- Node.js 18+

## Step 1: Prepare Firebase

### 1.1 Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click **Go to console**
3. Click **Create project**
4. Name: `splitwise-app` (or your choice)
5. Disable Google Analytics (optional)
6. Click **Create project**

### 1.2 Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **Get started**
3. Sign-in provider: **Email/Password**
   - Enable it
4. Sign-in provider: **Google**
   - Enable it
   - Configure OAuth consent screen if prompted

### 1.3 Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click **Create database**
3. Start in **test mode** (development) or **production mode** (with rules)
4. Choose region closest to you
5. Click **Create**

### 1.4 Add Web App

1. Go to **Project settings** (gear icon)
2. Under **Your apps**, click **Add app** → **Web**
3. Register app name (e.g., `splitwise-web`)
4. You'll see a config object like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "splitwise-abc123.firebaseapp.com",
  projectId: "splitwise-abc123",
  storageBucket: "splitwise-abc123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

5. **Copy all these values** - you'll need them in Step 3

### 1.5 Deploy Security Rules

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. In your project directory:
   ```bash
   firebase login
   firebase init  # Select "Firestore" when prompted
   firebase deploy --only firestore
   ```

The `firestore.rules` file in the repo will be deployed and protect your data.

## Step 2: Prepare Code Repository

### 2.1 Create GitHub Repo

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `splitwise` (or your choice)
3. Private/Public: Choose (public for portfolio showcase)
4. Click **Create repository**

### 2.2 Push Code

In your local `SplitWise` directory:

```bash
git init
git add .
git commit -m "Initial commit: Splitwise app with React + Firebase"
git branch -M main
git remote add origin https://github.com/yourusername/splitwise.git
git push -u origin main
```

Replace `yourusername` with your GitHub username.

## Step 3: Deploy to Vercel

### 3.1 Link to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `splitwise` repository
4. Click **Import**

### 3.2 Configure Build

Vercel should auto-detect:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

Click **Continue** if settings look good.

### 3.3 Add Environment Variables

On the **Environment Variables** screen, add:

```
VITE_FIREBASE_API_KEY=<from Step 1.4>
VITE_FIREBASE_AUTH_DOMAIN=<from Step 1.4>
VITE_FIREBASE_PROJECT_ID=<from Step 1.4>
VITE_FIREBASE_STORAGE_BUCKET=<from Step 1.4>
VITE_FIREBASE_MESSAGING_SENDER_ID=<from Step 1.4>
VITE_FIREBASE_APP_ID=<from Step 1.4>
```

Set environment: **Production**, **Preview**, **Development**

Click **Deploy**

### 3.4 Wait for Deploy

Vercel will build and deploy your app. This takes 2-3 minutes.

Once complete:
- You'll get a `.vercel.app` domain
- Visit it to see your live app!

## Step 4: Enable Auto-Deployments (Optional)

To automatically deploy when you push to GitHub:

### 4.1 Get Vercel Secrets

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create**
3. Name: `VERCEL_TOKEN`
4. Select **Full Account**
5. Copy token (save it, you'll only see it once)

1. Go to your Vercel project settings
2. Copy: **ORG_ID** and **PROJECT_ID**

### 4.2 Add GitHub Secrets

1. Go to your GitHub repo
2. **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Add three secrets:
   - Name: `VERCEL_TOKEN`, Value: (from Step 4.1)
   - Name: `VERCEL_ORG_ID`, Value: (from Step 4.1)
   - Name: `VERCEL_PROJECT_ID`, Value: (from Step 4.1)

### 4.3 CI/CD Automatic

Now whenever you:
- **Push to `main`**: App automatically deploys to Vercel
- **Create pull request**: Tests run, preview deploy created

## Custom Domain (Optional)

1. In Vercel project settings: **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `splitwise.yourdomain.com`)
4. Follow DNS configuration steps

## Monitoring & Logs

### Vercel Logs

1. In Vercel project, click **Deployments**
2. Click any deployment to see build logs
3. If build fails, check logs for errors

### Firebase Logs

1. Go to Firebase Console
2. **Build > Firestore Database > Rules**
3. Check for permission errors in logs
4. **Build > Authentication** to see auth issues

### Browser Console

1. In your deployed app, open **DevTools** (F12)
2. **Console** tab shows client-side errors
3. **Network** tab shows API calls to Firebase

## Troubleshooting

### Build Fails: "VITE_FIREBASE_API_KEY is undefined"

**Cause**: Environment variables not set in Vercel

**Fix**:
1. In Vercel project settings, go to **Environment Variables**
2. Verify all `VITE_FIREBASE_*` variables are present
3. Redeploy: **Deployments > Redeploy** on latest commit

### App Loads but Firebase Errors

**Cause**: Security rules blocking requests

**Fix**:
1. Check Firestore security rules allow your app
2. Verify user is authenticated
3. Check browser console for permission denied errors
4. Run emulator locally to debug: `firebase emulators:start --only firestore`

### "Too many requests" or Rate Limiting

**Cause**: Firestore quota exceeded (free tier limit)

**Fix**:
1. Go to Firebase Console > Quotas
2. Check usage vs limits
3. Upgrade to paid plan or optimize queries
4. Consider caching on client side

### Email Authentication Not Working

**Cause**: Email provider not enabled in Firebase

**Fix**:
1. Firebase Console > **Authentication > Sign-in method**
2. Ensure **Email/Password** is enabled
3. Redeploy app

### Google OAuth Not Working

**Cause**: OAuth consent screen not configured

**Fix**:
1. Firebase Console > **Authentication > Sign-in method**
2. Click **Google**
3. Click **Configure consent screen**
4. Fill required fields
5. Add test users if in development
6. Redeploy app

## Production Checklist

Before going public:

- [ ] Firebase security rules reviewed and deployed
- [ ] Firestore indexes created for queries
- [ ] Authentication providers tested
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (Sentry, LogRocket, etc.)
- [ ] Performance monitoring enabled
- [ ] Legal: Privacy policy and terms (if applicable)
- [ ] CORS configured if needed

## Performance Tips

1. **Use Firestore Indexes**: Firebase automatically suggests them
2. **Pagination**: For large expense lists, add pagination
3. **Image Optimization**: If adding images, use Vercel Image Optimization
4. **Caching**: Cache group data on client side
5. **Lazy Loading**: Load route components on demand

## Costs

**Free Tier Limits (usually sufficient for MVP):**
- Vercel: 100GB/month bandwidth
- Firebase: 1GB storage, 50K read/write operations/day

**Upgrade to Paid:**
- Firebase: Blaze plan (pay as you go)
- Vercel: Pro ($20/month) or per-usage

## Next Steps

1. **Invite users**: Share your Vercel URL
2. **Gather feedback**: Ask beta users for improvements
3. **Monitor**: Check Vercel & Firebase metrics
4. **Scale**: Optimize as usage grows
5. **Features**: Add notifications, payments, etc.

---

For more help:
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [GitHub Issues](https://github.com) (open an issue on this repo)
